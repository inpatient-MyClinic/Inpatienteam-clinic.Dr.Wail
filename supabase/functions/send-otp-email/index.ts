import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

interface SendOTPRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOTPRequest = await req.json();
    console.log('Generating OTP for email:', email);

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Processing OTP request for:', normalizedEmail);

    // Simple direct query to find user
    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('status, role, full_name, email')
      .or(`email.eq.${normalizedEmail},email.ilike.${normalizedEmail}`);
    
    console.log('Direct query result:', { profiles, queryError });
    
    if (queryError || !profiles || profiles.length === 0) {
      console.error('User not found in database');
      throw new Error('User not found');
    }

    const profile = profiles[0];
    console.log('Found user profile:', profile);

    if (profile.status !== 'active') {
      console.error('User account not active:', profile.status);
      throw new Error('User account is not active');
    }

    // Generate OTP using database function
    const { data: otpCode, error: otpError } = await supabase
      .rpc('generate_otp', { user_email: normalizedEmail });

    if (otpError) {
      console.error('Error generating OTP:', otpError);
      throw new Error('Failed to generate OTP: ' + otpError.message);
    }

    console.log('Generated OTP code for user:', normalizedEmail);

    // Check if Resend API key exists
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment');
      // Do NOT expose OTP in responses under any circumstance
      console.log('Email service not configured; OTP generated but not disclosed');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP generated successfully'
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

    try {
      // Send OTP email using Resend
      const emailResponse = await resend.emails.send({
        from: "MyClinic Support <noreply@resend.dev>",
        to: [normalizedEmail],
        subject: "Your Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1d4ed8; margin-bottom: 10px;">My Clinic In-Patient</h1>
              <p style="color: #6b7280;">Medical Management System</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; text-align: center;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your Verification Code</h2>
              <div style="font-size: 32px; font-weight: bold; color: #1d4ed8; letter-spacing: 8px; margin: 20px 0; font-family: monospace;">
                ${otpCode}
              </div>
              <p style="color: #6b7280; margin-top: 20px;">
                This code will expire in 2 minutes. Please do not share this code with anyone.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #fef3cd; border-radius: 8px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> If you did not request this code, please ignore this email and contact your administrator.
              </p>
            </div>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error('Resend API error:', emailResponse.error);
        throw new Error('Email service error: ' + emailResponse.error.message);
      }

      console.log('OTP email sent successfully via Resend to:', normalizedEmail);

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      console.error('Full email error details:', JSON.stringify(emailError));
      
      // For development/testing - log OTP when email fails but don't show it visibly
      console.log('=== OTP CODE (EMAIL FAILED) ===');
      console.log('CODE:', otpCode);
      console.log('EMAIL:', normalizedEmail);
      console.log('===========================');
      
      // Return success but with warning message for now
      return new Response(
        JSON.stringify({ 
          success: true, 
          warning: true,
          message: 'OTP generated. Email delivery failed - check console logs for code during development.',
          debugMessage: 'Email sending failed, but OTP was generated successfully.'
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully to your email'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-otp-email function:', error);
    
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send OTP',
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