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
    
    try {
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: { email: email.trim() }
      });
      
      setBusy(false);
      
      if (error) {
        setErr(error.message);
        return;
      }
      
      if (data?.success) {
        setCodeSent(true);
        if (data.warning) {
          setErr("تم إنشاء الرمز، لكن فشل إرسال البريد. تحقق من كونسول المطور للحصول على الرمز.");
        }
      } else {
        setErr("فشل في إرسال الرمز");
      }
    } catch (error: any) {
      setBusy(false);
      setErr(error.message || "فشل في إرسال الرمز");
    }
  };

  // التحقق من الرمز وتسجيل الدخول
  const verifyCode = async () => {
    setBusy(true); 
    setErr(null);
    
    try {
      // First verify the OTP using the database function
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('verify_otp', { 
          user_email: email.trim(), 
          submitted_code: code.trim() 
        });
      
      if (verifyError || !verifyData) {
        setBusy(false);
        setErr("رمز OTP غير صحيح أو منتهي الصلاحية");
        return;
      }
      
      // If OTP is valid, sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: code.trim() // Use OTP as temporary password
      });
      
      // If password signin fails, try magic link
      if (signInError) {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false
          }
        });
        
        if (!magicError) {
          // Auto verify the magic link with our OTP
          const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            type: "email",
            email: email.trim(),
            token: code.trim()
          });
          
          setBusy(false);
          if (sessionError) {
            setErr("فشل في تسجيل الدخول");
            return;
          }
          
          if (sessionData?.session) {
            onSuccess();
            return;
          }
        }
        
        setBusy(false);
        setErr("فشل في تسجيل الدخول");
        return;
      }
      
      setBusy(false);
      if (signInData?.session) {
        onSuccess();
      }
    } catch (error: any) {
      setBusy(false);
      setErr(error.message || "فشل في التحقق من الرمز");
    }
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