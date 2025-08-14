// Simplified nodemailer-like interface for Deno
// This provides a basic SMTP client implementation

interface TransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

interface SendResult {
  messageId: string;
}

class SMTPTransporter {
  private options: TransportOptions;

  constructor(options: TransportOptions) {
    this.options = options;
  }

  async sendMail(mailOptions: MailOptions): Promise<SendResult> {
    const { host, port, secure, auth } = this.options;
    
    // Connect to SMTP server
    let conn: Deno.TcpConn | Deno.TlsConn;
    
    if (secure) {
      conn = await Deno.connectTls({
        hostname: host,
        port: port,
      });
    } else {
      conn = await Deno.connect({
        hostname: host,
        port: port,
      });
    }

    try {
      const writer = conn.writable.getWriter();
      const reader = conn.readable.getReader();
      
      // Helper to read response
      const readResponse = async (): Promise<string> => {
        const { value } = await reader.read();
        if (!value) throw new Error('No response from server');
        return new TextDecoder().decode(value);
      };
      
      // Helper to send command
      const sendCommand = async (command: string): Promise<void> => {
        const data = new TextEncoder().encode(command + '\r\n');
        await writer.write(data);
      };

      // Read server greeting
      let response = await readResponse();
      if (!response.startsWith('220')) {
        throw new Error(`SMTP connection failed: ${response.trim()}`);
      }

      // EHLO command
      await sendCommand(`EHLO ${host}`);
      response = await readResponse();
      if (!response.startsWith('250')) {
        throw new Error(`EHLO failed: ${response.trim()}`);
      }

      // STARTTLS if not already secure
      if (!secure && response.includes('STARTTLS')) {
        await sendCommand('STARTTLS');
        response = await readResponse();
        if (response.startsWith('220')) {
          // Need to upgrade connection to TLS
          await writer.close();
          await reader.cancel();
          conn.close();
          
          // Reconnect with TLS
          conn = await Deno.connectTls({
            hostname: host,
            port: port,
          });
          
          const newWriter = conn.writable.getWriter();
          const newReader = conn.readable.getReader();
          
          // Re-assign for the rest of the function
          writer = newWriter;
          reader = newReader;
          
          // Re-send EHLO after TLS upgrade
          await sendCommand(`EHLO ${host}`);
          response = await readResponse();
        }
      }

      // AUTH LOGIN
      await sendCommand('AUTH LOGIN');
      response = await readResponse();
      if (!response.startsWith('334')) {
        throw new Error(`AUTH LOGIN failed: ${response.trim()}`);
      }

      // Send username (base64 encoded)
      const userB64 = btoa(auth.user);
      await sendCommand(userB64);
      response = await readResponse();
      if (!response.startsWith('334')) {
        throw new Error(`Username authentication failed: ${response.trim()}`);
      }

      // Send password (base64 encoded)
      const passB64 = btoa(auth.pass);
      await sendCommand(passB64);
      response = await readResponse();
      if (!response.startsWith('235')) {
        throw new Error(`Password authentication failed: ${response.trim()}`);
      }

      // MAIL FROM
      await sendCommand(`MAIL FROM:<${mailOptions.from}>`);
      response = await readResponse();
      if (!response.startsWith('250')) {
        throw new Error(`MAIL FROM failed: ${response.trim()}`);
      }

      // RCPT TO
      await sendCommand(`RCPT TO:<${mailOptions.to}>`);
      response = await readResponse();
      if (!response.startsWith('250')) {
        throw new Error(`RCPT TO failed: ${response.trim()}`);
      }

      // DATA
      await sendCommand('DATA');
      response = await readResponse();
      if (!response.startsWith('354')) {
        throw new Error(`DATA command failed: ${response.trim()}`);
      }

      // Send email content
      let content = `From: ${mailOptions.from}\r\n`;
      content += `To: ${mailOptions.to}\r\n`;
      if (mailOptions.replyTo) {
        content += `Reply-To: ${mailOptions.replyTo}\r\n`;
      }
      content += `Subject: ${mailOptions.subject}\r\n`;
      content += `MIME-Version: 1.0\r\n`;
      
      if (mailOptions.html) {
        content += `Content-Type: text/html; charset=UTF-8\r\n`;
        content += `\r\n`;
        content += mailOptions.html;
      } else {
        content += `Content-Type: text/plain; charset=UTF-8\r\n`;
        content += `\r\n`;
        content += mailOptions.text || '';
      }
      
      content += `\r\n.`;
      
      await sendCommand(content);
      response = await readResponse();
      if (!response.startsWith('250')) {
        throw new Error(`Email send failed: ${response.trim()}`);
      }

      // Extract message ID if available
      const messageIdMatch = response.match(/id[=\s]+([^\s]+)/i);
      const messageId = messageIdMatch ? messageIdMatch[1] : `local-${Date.now()}`;

      // QUIT
      await sendCommand('QUIT');
      
      return { messageId };
      
    } finally {
      try {
        conn.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
}

export function createTransporter(options: TransportOptions): SMTPTransporter {
  return new SMTPTransporter(options);
}