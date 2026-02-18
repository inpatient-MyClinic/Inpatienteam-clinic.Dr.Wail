import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN");
    const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { templateId, content, channel, targetType, targetValue, recipients, requestData } = await req.json();

    // Get sender user from auth header
    const authHeader = req.headers.get("Authorization");
    let sentBy: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      sentBy = data?.user?.id || null;
    }

    // Replace placeholders in content
    const fillTemplate = (text: string, data: any = {}) => {
      return text
        .replace(/\{patient_name\}/g, data.patientName || "Patient")
        .replace(/\{doctor_name\}/g, data.doctorName || "Doctor")
        .replace(/\{hospital\}/g, data.hospitalName || "Hospital")
        .replace(/\{surgery_date\}/g, data.surgeryDate || "TBD")
        .replace(/\{anesthesia_date\}/g, data.anesthesiaDate || "TBD")
        .replace(/\{service\}/g, data.service || "")
        .replace(/\{mrn\}/g, data.mrn || "");
    };

    const filledContent = fillTemplate(content, requestData || {});

    // Determine recipients list
    let recipientList: { phone: string; name: string; role: string }[] = recipients || [];

    // If no explicit recipients, this is a manual broadcast - log without sending
    if (recipientList.length === 0 && targetType) {
      // Log the broadcast attempt
      await supabase.from("notification_logs").insert({
        template_id: templateId || null,
        content: filledContent,
        channel: channel || "whatsapp",
        status: WHATSAPP_API_TOKEN ? "queued" : "simulated",
        recipient_name: `Broadcast: ${targetType}=${targetValue || "all"}`,
        recipient_role: targetType,
        sent_by: sentBy,
      });

      return new Response(JSON.stringify({
        success: true,
        message: WHATSAPP_API_TOKEN
          ? "Broadcast queued for delivery"
          : "WhatsApp API not configured. Message logged as simulated.",
        simulated: !WHATSAPP_API_TOKEN
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to each recipient
    const results = [];
    for (const recipient of recipientList) {
      let status = "simulated";
      let errorMessage = null;

      if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_ID && recipient.phone) {
        try {
          // WhatsApp Business API call
          const waResp = await fetch(
            `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipient.phone.replace(/[^0-9]/g, ""),
                type: "text",
                text: { body: filledContent },
              }),
            }
          );
          if (waResp.ok) {
            status = "sent";
          } else {
            const errData = await waResp.text();
            status = "failed";
            errorMessage = errData;
          }
        } catch (e) {
          status = "failed";
          errorMessage = e instanceof Error ? e.message : "Send error";
        }
      }

      // Log each send
      await supabase.from("notification_logs").insert({
        template_id: templateId || null,
        request_id: requestData?.requestId || null,
        recipient_phone: recipient.phone,
        recipient_name: recipient.name,
        recipient_role: recipient.role,
        channel: channel || "whatsapp",
        content: filledContent,
        status,
        error_message: errorMessage,
        sent_by: sentBy,
      });

      results.push({ recipient: recipient.name, status });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-whatsapp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
