interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

interface EmailResult {
  ok: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text } = options;

  // Validate required environment variables
  const requiredEnvs = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = requiredEnvs.filter(env => !Deno.env.get(env));
  
  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    console.error('[SMTP] Configuration error:', error);
    throw new Error(error);
  }

  const smtpHost = Deno.env.get('SMTP_HOST')!;
  const smtpPort = Number(Deno.env.get('SMTP_PORT'));
  const smtpUser = Deno.env.get('SMTP_USER')!;
  const smtpPass = Deno.env.get('SMTP_PASS')!;
  const smtpSecure = Deno.env.get('SMTP_SECURE') === 'true';
  const emailFrom = Deno.env.get('EMAIL_FROM')!;
  const emailReplyTo = Deno.env.get('EMAIL_REPLY_TO');

  console.log(`[SMTP] Attempting to send email via ${smtpHost}:${smtpPort} (secure: ${smtpSecure})`);

  // Use nodemailer for proper SMTP handling
  try {
    const { createTransporter } = await import('./nodemailer-transport.ts');
    
    const transporter = createTransporter({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      html,
      text,
      ...(emailReplyTo && { replyTo: emailReplyTo }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email sent successfully via port ${smtpPort}:`, info.messageId);
    
    return {
      ok: true,
      provider: `smtp-${smtpPort}`,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[SMTP] Primary attempt failed (${smtpHost}:${smtpPort}):`, error.message);
    
    // If 465/secure failed with connection issues, try 587/non-secure fallback
    if (smtpPort === 465 && smtpSecure && (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT'))) {
      console.log('[SMTP] Retrying with port 587 and secure=false fallback...');
      
      try {
        const { createTransporter } = await import('./nodemailer-transport.ts');
        
        const fallbackTransporter = createTransporter({
          host: smtpHost,
          port: 587,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: emailFrom,
          to,
          subject,
          html,
          text,
          ...(emailReplyTo && { replyTo: emailReplyTo }),
        };

        const info = await fallbackTransporter.sendMail(mailOptions);
        console.log('[SMTP] Email sent successfully via fallback port 587:', info.messageId);
        
        return {
          ok: true,
          provider: 'smtp-587',
          messageId: info.messageId,
        };
      } catch (fallbackError: any) {
        console.error('[SMTP] Fallback attempt also failed:', fallbackError.message);
        return {
          ok: false,
          error: `Primary and fallback failed: ${error.message}; ${fallbackError.message}`
        };
      }
    }
    
    return {
      ok: false,
      error: error.message
    };
  }
}