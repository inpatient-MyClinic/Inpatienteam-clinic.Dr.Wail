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
    const { history, diagnosis, specialty } = await req.json();

    if (!history && !diagnosis) {
      return new Response(
        JSON.stringify({ error: "Please provide history or diagnosis text." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical coding and clinical documentation specialist with deep expertise in:
1. ICD-10 coding according to CHI (Council of Health Insurance) Saudi Arabia guidelines
2. European clinical coding guidelines
3. CPT/HCPCS procedure coding and package codes per CHI Saudi Arabia guidelines
4. Writing clinical histories that maximize insurance approval rates

When given a patient history and/or diagnosis, you must:

1. **Suggest ICD-10 Diagnosis Codes**: Provide the most appropriate ICD-10 codes. For each code provide:
   - The ICD-10 code
   - Description
   - Why this code is recommended for approval

2. **Suggest Procedure/Package Codes**: Based on the history and requested procedures, suggest appropriate CPT/package codes per CHI Saudi Arabia guidelines. For each code provide:
   - The procedure code (CPT or CHI package code)
   - Description
   - Why this code/package is recommended

3. **Rewrite the History**: Provide an improved version of the clinical history that:
   - Uses precise medical terminology
   - Clearly justifies medical necessity
   - Follows CHI Saudi Arabia documentation requirements
   - Includes key elements insurers look for
   - Is structured for maximum approval likelihood

Respond ONLY with valid JSON in this exact format:
{
  "icdCodes": [
    { "code": "ICD-10 code", "description": "Description", "reasoning": "Why recommended" }
  ],
  "procedureCodes": [
    { "code": "Procedure/Package code", "description": "Description", "reasoning": "Why recommended" }
  ],
  "suggestedHistory": "The rewritten clinical history text",
  "tips": ["Short tip 1", "Short tip 2"]
}`;

    const userMessage = `Patient Information:
${specialty ? `Specialty: ${specialty}` : ""}
${diagnosis ? `Current Diagnosis: ${diagnosis}` : ""}

Clinical History provided by doctor:
${history || "No history provided"}

Please suggest appropriate ICD-10 diagnosis codes and procedure/package codes per CHI Saudi Arabia and European guidelines, and rewrite the history to maximize insurance approval.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `AI service temporarily unavailable (${response.status}). Please try again in a few moments.` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        icdCodes: [],
        procedureCodes: [],
        suggestedHistory: content,
        tips: [],
      };
    }

    // Ensure procedureCodes exists
    if (!parsed.procedureCodes) parsed.procedureCodes = [];

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-icd-history error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
