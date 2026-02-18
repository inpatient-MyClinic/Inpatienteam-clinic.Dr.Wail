import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type, history, specialty } = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isProcedure = type === "procedure";

    const systemPrompt = isProcedure
      ? `You are a medical procedure coding specialist. Given a search query, return ONLY procedure codes — specifically CPT codes, ICD-10-PCS procedure codes, or CHI Saudi Arabia package codes.

IMPORTANT: Do NOT return ICD-10-CM diagnosis codes. Only return codes that represent medical/surgical PROCEDURES, interventions, or service packages.

For each result, determine if it is RELEVANT to the provided patient history.

Respond ONLY with valid JSON array (no wrapping object, just the array):
[
  { "code": "CODE", "description": "Description", "relevant": true/false }
]

Return up to 8 suggestions. If no matches, return empty array [].`
      : `You are a medical diagnosis coding specialist. Given a search query, return matching ICD-10-CM diagnosis codes.

For each result, determine if it is RELEVANT to the provided patient history.

Respond ONLY with valid JSON array (no wrapping object, just the array):
[
  { "code": "CODE", "description": "Description", "relevant": true/false }
]

Return up to 8 suggestions. If no matches, return empty array [].`;

    const userMessage = `Search query: "${query}"
${specialty ? `Specialty: ${specialty}` : ""}
${history ? `Patient history: ${history}` : "No history provided"}

Return matching ${isProcedure ? "CPT/ICD-10-PCS procedure or CHI package" : "ICD-10-CM diagnosis"} codes. ${isProcedure ? "Do NOT include any diagnosis codes." : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = [];
    }

    const suggestions = Array.isArray(parsed) ? parsed : [];

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("code-autocomplete error:", e);
    return new Response(
      JSON.stringify({ suggestions: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
