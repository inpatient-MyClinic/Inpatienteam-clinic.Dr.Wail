import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface PasswordResetRequest {
  email: string;
  action: 'reset' | 'verify';
  resetCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action }: PasswordResetRequest = await req.json();
    console.log('Password reset request:', { email, action });

    // Only allow admin emails
    const adminEmails = ['admin@myclinic.com.sa', 'wail.ahmed@myclinic.com.sa', 'inpatienteam@gmail.com'];
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!adminEmails.includes(normalizedEmail)) {
      throw new Error('Password reset only available for admin accounts');
    }

    if (action === 'reset') {
      // Generate a simple reset code (for demo purposes)
      const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Store the reset code temporarily (in real app, you'd store this securely)
      console.log(`Reset code for ${normalizedEmail}: ${resetCode}`);
      
      // Set a temporary password that includes the reset code
      const tempPassword = `Temp${resetCode}!`;
      
      // Update the user's password directly (for admin accounts only)
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        (await supabase.from('profiles').select('id').eq('email', normalizedEmail).single()).data?.id,
        { password: tempPassword }
      );

      if (updateError) {
        console.error('Failed to update password:', updateError);
        throw new Error('Failed to reset password');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset successfully',
          tempPassword: tempPassword, // In production, this would be sent via email
          resetCode: resetCode
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Error in admin-password-reset function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Password reset failed',
        message: error.message
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);