-- Recreate all the missing RLS policies that were dropped

-- Audit log policies
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (is_admin());

-- Hospitals policies  
CREATE POLICY "Anyone can view hospitals" 
ON public.hospitals 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage hospitals" 
ON public.hospitals 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Excel uploads policies
CREATE POLICY "Admins can manage excel uploads" 
ON public.excel_uploads 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view excel uploads" 
ON public.excel_uploads 
FOR SELECT 
USING (is_admin());

-- Excel rows raw policies
CREATE POLICY "Admins can manage excel rows raw" 
ON public.excel_rows_raw 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can view excel rows raw" 
ON public.excel_rows_raw 
FOR SELECT 
USING (is_admin());

-- Password history policies
CREATE POLICY "System can manage password history" 
ON public.password_history 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own password history" 
ON public.password_history 
FOR SELECT 
USING (user_id = auth.uid());

-- Pre-approved emails policies
CREATE POLICY "Admins can delete pre-approved emails" 
ON public.pre_approved_emails 
FOR DELETE 
USING (is_admin());

CREATE POLICY "Admins can insert pre-approved emails" 
ON public.pre_approved_emails 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update pre-approved emails" 
ON public.pre_approved_emails 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can view all pre-approved emails" 
ON public.pre_approved_emails 
FOR SELECT 
USING (is_admin());

-- SIA settings policies
CREATE POLICY "Admins can manage SIA settings" 
ON public.sia_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Authorized users can view SIA settings" 
ON public.sia_settings 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'case-coordinator'::user_role, 'finance'::user_role]));

-- Excel requests policies
CREATE POLICY "Admins can manage excel requests" 
ON public.excel_requests 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins and authorized users can view excel requests" 
ON public.excel_requests 
FOR SELECT 
USING (is_admin() OR (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role, 'case-coordinator'::user_role])));

-- Messages policies
CREATE POLICY "Restricted message access" 
ON public.messages 
FOR SELECT 
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()) OR is_admin());

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received" 
ON public.messages 
FOR UPDATE 
USING ((recipient_id = auth.uid()) OR (sender_id = auth.uid()));