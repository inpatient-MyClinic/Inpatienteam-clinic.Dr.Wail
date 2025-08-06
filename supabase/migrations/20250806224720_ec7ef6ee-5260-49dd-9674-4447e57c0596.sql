-- Create finance analytics data table
CREATE TABLE public.finance_analytics_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  row_id TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.finance_analytics_data ENABLE ROW LEVEL SECURITY;

-- Create policies for finance analytics data
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_finance_analytics_data_updated_at
BEFORE UPDATE ON public.finance_analytics_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();