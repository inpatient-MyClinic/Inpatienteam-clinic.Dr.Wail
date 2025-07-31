import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = [
  'wail.ahmed@myclinic.com.sa',
  'admin@myclinic.com.sa', 
  'inpatienteam@gmail.com'
];

const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    console.log("Processing user signup:", record);
    
    // Check if this is an admin email
    if (record && record.email && isAdminEmail(record.email)) {
      console.log("Admin email detected, auto-confirming:", record.email);
      
      // Create admin client to confirm the email
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Auto-confirm the admin user's email
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        record.id,
        { 
          email_confirm: true,
          email_confirmed_at: new Date().toISOString()
        }
      );

      if (confirmError) {
        console.error("Error confirming admin email:", confirmError);
        return new Response(
          JSON.stringify({ error: "Failed to confirm admin email" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      console.log("Admin email confirmed successfully:", record.email);
      
      return new Response(
        JSON.stringify({ 
          message: "Admin email auto-confirmed",
          email: record.email 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Not an admin email, no action needed
    return new Response(
      JSON.stringify({ message: "Regular user, no auto-confirmation needed" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in auto-confirm-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);