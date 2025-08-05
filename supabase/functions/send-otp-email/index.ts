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
      throw new Error('Failed to generate OTP');
    }

    console.log('Generated OTP for user:', normalizedEmail);

    // Send OTP email using Resend
    const emailResponse = await resend.emails.send({
      from: "MyClinic <noreply@resend.dev>",
      to: [normalizedEmail],
      subject: "Your Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Login Verification Code</h2>
          
          <p>Hello ${profile.full_name || 'User'},</p>
          
          <p>You requested to login to your MyClinic account. Please use the verification code below:</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #2563eb;">${otpCode}</h1>
          </div>
          
          <p style="color: #666;">This code will expire in 2 minutes for security reasons.</p>
          
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            MyClinic - Medical Request Management System
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      throw new Error('Failed to send OTP email');
    }

    console.log('OTP email sent successfully to:', normalizedEmail);

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