-- Fix security issues: Enable RLS and add policies

-- Enable RLS on new tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_rows_raw ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hospitals table
CREATE POLICY "Anyone can view hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Admins can manage hospitals" ON hospitals FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for excel_uploads table
CREATE POLICY "Admins can view excel uploads" ON excel_uploads FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage excel uploads" ON excel_uploads FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create RLS policies for excel_rows_raw table  
CREATE POLICY "Admins can view excel rows raw" ON excel_rows_raw FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage excel rows raw" ON excel_rows_raw FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Add missing search_path to functions
ALTER FUNCTION norm_text(text) SET search_path = '';
ALTER FUNCTION norm_upper(text) SET search_path = '';
ALTER FUNCTION norm_status(text) SET search_path = '';
ALTER FUNCTION import_excel_rows(text, jsonb) SET search_path = 'public';