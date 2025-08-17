// Minimal auth utilities for backward compatibility
import { supabase } from "@/integrations/supabase/client";

export const getCurrentUserRole = (): string | null => {
  // This is now handled by Supabase auth - return null to force proper auth flow
  return null;
};

export const getCurrentUserEmail = (): string | null => {
  // This is now handled by Supabase auth - return null to force proper auth flow
  return null;
};

export const isAdmin = (email: string): boolean => {
  const adminEmails = [
    "admin@myclinic.com.sa",
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@gmail.com"
  ];
  return adminEmails.includes(email.toLowerCase().trim());
};

export const canAccessRole = (userRole: string, requiredRole: string): boolean => {
  if (userRole === 'admin') {
    return true;
  }
  return userRole === requiredRole;
};