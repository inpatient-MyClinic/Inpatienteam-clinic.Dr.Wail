-- Enable RLS on excel_requests table
ALTER TABLE excel_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for excel_requests
CREATE POLICY "Admins and authorized users can view excel requests"
ON excel_requests FOR SELECT
USING (is_admin() OR get_current_user_role() IN ('admin', 'finance', 'case-coordinator'));

CREATE POLICY "Admins can manage excel requests"
ON excel_requests FOR ALL
USING (is_admin()) WITH CHECK (is_admin());