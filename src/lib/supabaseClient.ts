// Untyped Supabase client for use until database schema is set up
// This bypasses TypeScript strict checking for table names
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xinslkxcxntaertkzmwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbnNsa3hjeG50YWVydGt6bXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODY2MjQsImV4cCI6MjA4NTA2MjYyNH0.imAJ_7wldjPKM1I2ZI43j0neQ9VxV9gSZCt71M7ZI18";

// Create untyped client that allows any table name
export const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Re-export auth from the typed client for consistency
export { supabase } from "@/integrations/supabase/client";
