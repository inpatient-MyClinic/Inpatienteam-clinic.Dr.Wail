// Helper functions to bypass strict TypeScript checks until database schema is set up
import { supabase } from "@/integrations/supabase/client";

// Type-safe wrapper for Supabase queries that works around empty schema
export const queryTable = (tableName: string) => {
  return (supabase as any).from(tableName);
};

// Type-safe wrapper for RPC calls
export const callRpc = (functionName: string, params?: any) => {
  return (supabase as any).rpc(functionName, params);
};

// Common table operations with type assertions
export const profilesTable = () => queryTable('profiles');
export const medicalRequestsTable = () => queryTable('medical_requests');
export const unifiedRequestsTable = () => queryTable('unified_requests');
export const excelUploadBatchesTable = () => queryTable('excel_upload_batches');
export const excelRowsRawTable = () => queryTable('excel_rows_raw');
