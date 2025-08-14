import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { sendEmail } from "../_shared/email-smtp.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationEmailRequest {
  type: 'user_registration' | 'user_approval' | 'user_rejection';
  userEmail: string;
  userName?: string;
  adminEmail?: string;
  reason?: string;
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
    const { type, userEmail, userName, adminEmail, reason }: NotificationEmailRequest = await req.json();

    let subject: string;
    let html: string;
    let text: string;
    let to: string;

    switch (type) {
      case 'user_registration':
        // Send to admin emails
        to = 'inpatienteam@gmail.com';
        subject = 'New User Registration - My Clinic';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New User Registration</h2>
            <p>A new user has registered and requires approval:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Name:</strong> ${userName || 'Not provided'}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Please log in to the admin dashboard to review and approve this user.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">This is an automated message from My Clinic.</p>
          </div>
        `;
        text = `New User Registration\n\nA new user has registered: ${userEmail}\nName: ${userName || 'Not provided'}\nTime: ${new Date().toLocaleString()}\n\nPlease log in to approve this user.`;
        break;

      case 'user_approval':
        to = userEmail;
        subject = 'Your My Clinic Account Has Been Approved';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Account Approved!</h2>
            <p>Hello ${userName || 'User'},</p>
            <p>Great news! Your My Clinic account has been approved and is now active.</p>
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0;"><strong>You can now:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Log in to the My Clinic system</li>
                <li>Access your dashboard</li>
                <li>Submit and manage medical requests</li>
                <li>View analytics and reports</li>
              </ul>
            </div>
            <p>Thank you for joining My Clinic!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">This is an automated message from My Clinic.</p>
          </div>
        `;
        text = `Account Approved!\n\nHello ${userName || 'User'},\n\nYour My Clinic account has been approved and is now active. You can now log in and access all features.\n\nThank you for joining My Clinic!`;
        break;

      case 'user_rejection':
        to = userEmail;
        subject = 'My Clinic Account Registration Update';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Account Registration Update</h2>
            <p>Hello ${userName || 'User'},</p>
            <p>We have reviewed your My Clinic account registration.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0;"><strong>Status:</strong> Registration requires additional review</p>
              ${reason ? `<p style="margin: 10px 0 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            <p>If you have any questions, please contact the system administrator.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">This is an automated message from My Clinic.</p>
          </div>
        `;
        text = `Account Registration Update\n\nHello ${userName || 'User'},\n\nYour registration requires additional review.${reason ? `\nReason: ${reason}` : ''}\n\nPlease contact the administrator if you have questions.`;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    console.log(`[Send Notification] Sending ${type} email to: ${to}`);

    const result = await sendEmail({
      to,
      subject,
      html,
      text
    });

    if (!result.ok) {
      console.error('Failed to send notification email:', result.error);
      return new Response(
        JSON.stringify({ ok: false, error: result.error }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`[Send Notification] Email sent successfully via ${result.provider}:`, result.messageId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('[Send Notification] Error:', error.message || error);
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