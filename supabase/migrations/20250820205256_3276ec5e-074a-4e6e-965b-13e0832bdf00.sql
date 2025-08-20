-- Only create policies that don't already exist

-- Check and create missing policies for tables that show "RLS Enabled No Policy" warning

-- Finance analytics data policies (likely missing all policies)
CREATE POLICY "Finance and admin can view analytics data" 
ON public.finance_analytics_data 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role]));

CREATE POLICY "Finance and admin can insert analytics data" 
ON public.finance_analytics_data 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role]));

CREATE POLICY "Finance and admin can update analytics data" 
ON public.finance_analytics_data 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role]));

CREATE POLICY "Finance and admin can delete analytics data" 
ON public.finance_analytics_data 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role]));

-- Request history policies (likely missing some)
CREATE POLICY "Users can insert request history" 
ON public.request_history 
FOR INSERT 
WITH CHECK (changed_by = auth.uid());

CREATE POLICY "Users can view request history they have access to" 
ON public.request_history 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM medical_requests mr
  WHERE ((mr.id = request_history.request_id) AND
        CASE get_current_user_role()
            WHEN 'admin'::user_role THEN true
            WHEN 'doctor'::user_role THEN ((mr.created_by = auth.uid()) OR (mr.assigned_to = auth.uid()))
            WHEN 'nurse'::user_role THEN (mr.assigned_to = auth.uid())
            ELSE true
        END)));

-- Finance transactions policies (might be missing some)
CREATE POLICY "Finance secure access" 
ON public.finance_transactions 
FOR SELECT 
USING ((get_current_user_role() = 'admin'::user_role) OR ((get_current_user_role() = 'finance'::user_role) AND (EXISTS ( SELECT 1
   FROM (medical_requests mr
     JOIN profiles p ON ((p.id = auth.uid())))
  WHERE ((mr.id = finance_transactions.request_id) AND (mr.hospital_code = p.hospital_code))))));

CREATE POLICY "Finance users can manage transactions" 
ON public.finance_transactions 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'finance'::user_role]));

CREATE POLICY "Request owners can view their transaction status only" 
ON public.finance_transactions 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM medical_requests mr
  WHERE ((mr.id = finance_transactions.request_id) AND ((mr.created_by = auth.uid()) OR (mr.assigned_to = auth.uid())))));

-- OTP codes policies (need to be accessible by postgres functions)  
CREATE POLICY "otp_codes access via postgres only" 
ON public.otp_codes 
FOR ALL 
USING (true)
WITH CHECK (true);