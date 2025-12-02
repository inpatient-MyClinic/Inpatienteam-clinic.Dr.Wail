import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VATInvoiceEmailRequest {
  hospitalEmail: string;
  hospitalName: string;
  invoiceNumber: string;
  invoiceMonth: string;
  invoiceYear: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  invoiceHtml: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      hospitalEmail, 
      hospitalName, 
      invoiceNumber,
      invoiceMonth,
      invoiceYear,
      subtotal,
      vatAmount,
      total,
      invoiceHtml
    }: VATInvoiceEmailRequest = await req.json();

    // Validate required fields
    if (!hospitalEmail || !invoiceNumber) {
      throw new Error("Missing required fields: hospitalEmail or invoiceNumber");
    }

    // Get SMTP configuration
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const emailFrom = Deno.env.get('EMAIL_FROM') || smtpUser;

    if (!smtpUser || !smtpPass) {
      throw new Error("SMTP credentials not configured");
    }

    // Import nodemailer transport
    const { createTransporter } = await import('../_shared/nodemailer-transport.ts');
    
    const transporter = createTransporter({
      host: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(Deno.env.get('SMTP_PORT')) || 587,
      secure: Deno.env.get('SMTP_SECURE') === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .summary { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .summary-row:last-child { border-bottom: none; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VAT Invoice</h1>
      <p>Invoice #${invoiceNumber}</p>
    </div>
    <div class="content">
      <p>Dear ${hospitalName},</p>
      <p>Please find attached the VAT invoice for <strong>${invoiceMonth} ${invoiceYear}</strong>.</p>
      
      <div class="summary">
        <h3>Invoice Summary</h3>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString()} SAR</span>
        </div>
        <div class="summary-row">
          <span>VAT (15%):</span>
          <span>${vatAmount.toLocaleString()} SAR</span>
        </div>
        <div class="summary-row">
          <span>Total:</span>
          <span>${total.toLocaleString()} SAR</span>
        </div>
      </div>
      
      <p>The detailed invoice is attached below.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>My Clinic International Medical Company</p>
    </div>
    <div class="footer">
      <p>My Clinic International Medical Company Limited</p>
      <p>VAT Number: 301155866610003</p>
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: emailFrom,
      to: hospitalEmail,
      subject: `VAT Invoice ${invoiceNumber} - ${invoiceMonth} ${invoiceYear}`,
      html: emailHtml,
    });

    console.log(`[VAT Email] Sent invoice ${invoiceNumber} to ${hospitalEmail}:`, info.messageId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        invoiceNumber 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error: any) {
    console.error("[VAT Email] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
