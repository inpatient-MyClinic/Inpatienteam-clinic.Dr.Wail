import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/email-smtp.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailTestRequest {
  to: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { to }: EmailTestRequest = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing "to" field' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`[Email Test] Sending test email to: ${to}`);
    console.log(`[Email Test] SMTP Host: ${Deno.env.get('SMTP_HOST')}`);
    console.log(`[Email Test] SMTP Port: ${Deno.env.get('SMTP_PORT')}`);
    console.log(`[Email Test] Email From: ${Deno.env.get('EMAIL_FROM')}`);

    const result = await sendEmail({
      to,
      subject: 'My Clinic Email Test',
      html: `
        <h2>Email Test Successful!</h2>
        <p>If you received this email, your SMTP configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Test conducted from:</strong> My Clinic Admin Dashboard</p>
      `,
      text: `Email Test Successful! If you received this email, your SMTP configuration is working correctly. Timestamp: ${new Date().toISOString()}`
    });

    console.log('[Email Test] Result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('[Email Test] Error:', error.message || error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);