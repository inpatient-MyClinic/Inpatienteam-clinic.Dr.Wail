import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EmailOtpLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // إرسال الرمز إلى البريد
  const sendCode = async () => {
    setBusy(true); 
    setErr(null);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        shouldCreateUser: false
      }
    });
    
    setBusy(false);
    if (error) { 
      setErr(`Supabase OTP Error: ${error.message}`); 
      return; 
    }
    setCodeSent(true);
  };

  // التحقق من الرمز وتسجيل الدخول
  const verifyCode = async () => {
    setBusy(true); 
    setErr(null);
    
    const { data, error } = await supabase.auth.verifyOtp({
      type: "email",
      email: email.trim(),
      token: code.trim()
    });
    
    setBusy(false);
    if (error) { 
      setErr(`Supabase Verify Error: ${error.message}`); 
      return; 
    }
    if (data?.session) onSuccess();
  };

  return (
    <div className="space-y-4">
      {!codeSent ? (
        <>
          <Input
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <Button
            className="w-full"
            disabled={busy || !email}
            onClick={sendCode}
          >
            {busy ? "جاري الإرسال..." : "إرسال رمز OTP إلى البريد"}
          </Button>
        </>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            تم إرسال رمز من 6 أرقام إلى: <b>{email}</b>
          </div>
          <Input
            placeholder="أدخل الرمز"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <Button
            className="w-full"
            disabled={busy || code.trim().length < 6}
            onClick={verifyCode}
          >
            {busy ? "جاري التحقق..." : "تحقق وتسجيل الدخول"}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => setCodeSent(false)}
          >
            إعادة إرسال الرمز
          </Button>
        </>
      )}
      {err && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}