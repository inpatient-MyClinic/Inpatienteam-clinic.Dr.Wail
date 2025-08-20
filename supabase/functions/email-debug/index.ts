// supabase/functions/email-debug/index.ts
// Deno edge function to verify SMTP secrets and send a test email

import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

function env(name: string, required = true): string {
  const v = Deno.env.get(name) ?? "";
  if (required && !v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function sendTestEmail(to: string, body: string) {
  const client = new SmtpClient();

  const hostname = env("SMTP_HOST");
  const port = Number(env("SMTP_PORT"));
  const username = env("SMTP_USER");
  const password = env("SMTP_PASS");
  const secure = (env("SMTP_SECURE") || "true").toLowerCase() === "true";
  const from = env("EMAIL_FROM");

  if (secure) {
    await client.connectTLS({ hostname, port, username, password });
  } else {
    await client.connect({ hostname, port, username, password });
  }

  await client.send({
    from,
    to,
    subject: "My Clinic – SMTP Test",
    content: body || "SMTP is configured and working ✅",
  });

  await client.close();
}

Deno.serve(async (req) => {
  try {
    const { to, body } = await req.json().catch(() => ({ to: "", body: "" }));
    const testTo = to || env("EMAIL_FROM"); // default to self if not provided

    // Validate all envs before trying to send
    ["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS","SMTP_SECURE","EMAIL_FROM"].forEach(k => env(k));

    await sendTestEmail(testTo, body);

    return new Response(JSON.stringify({ ok: true, message: "Email sent" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});