import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Check for environment variables (return booleans only, no secrets)
    const diagnostics = {
      smtpHost: !!Deno.env.get('SMTP_HOST'),
      smtpPort: !!Deno.env.get('SMTP_PORT'),
      smtpUser: !!Deno.env.get('SMTP_USER'),
      smtpPass: !!Deno.env.get('SMTP_PASS'),
      smtpSecure: !!Deno.env.get('SMTP_SECURE'),
      emailFrom: !!Deno.env.get('EMAIL_FROM'),
      emailReplyTo: !!Deno.env.get('EMAIL_REPLY_TO'),
      resendApiKey: !!Deno.env.get('RESEND_API_KEY')
    };

    console.log('[Email Debug] Diagnostics check:', diagnostics);

    return new Response(JSON.stringify(diagnostics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('[Email Debug] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);