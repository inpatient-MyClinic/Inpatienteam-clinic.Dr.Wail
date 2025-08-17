import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const EnvironmentBanner = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return null;
  }

  return (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertDescription className="text-red-800">
        🚨 Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
      </AlertDescription>
    </Alert>
  );
};