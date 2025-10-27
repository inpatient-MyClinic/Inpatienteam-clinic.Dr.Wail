-- Add missing columns to excel_upload_batches table
ALTER TABLE public.excel_upload_batches 
ADD COLUMN IF NOT EXISTS total_rows integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS uploaded_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS processing_log jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS warnings_count integer DEFAULT 0;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER set_excel_upload_batches_updated_at
BEFORE UPDATE ON public.excel_upload_batches
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();