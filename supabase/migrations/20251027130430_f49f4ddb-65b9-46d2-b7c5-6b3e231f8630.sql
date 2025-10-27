-- Recreate Excel upload infrastructure after database reset

-- 1. Create excel_upload_batches table
CREATE TABLE IF NOT EXISTS public.excel_upload_batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_date timestamp with time zone DEFAULT now(),
  processed_rows integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create excel_rows_raw table with all required columns
CREATE TABLE IF NOT EXISTS public.excel_rows_raw (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_batch_id uuid REFERENCES public.excel_upload_batches(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  "Date" text,
  "Date of File Opening" text,
  "Agreed Booked Date" text,
  "Status" text,
  "Branch" text,
  "Specialty" text,
  "Case Coordinator" text,
  "Hospital Name" text,
  "Patient Name" text,
  "Patient ID" text,
  "Patient Mobile" text,
  "Patient National ID" text,
  "Insurance Cash" text,
  "Approval Status" text,
  "Service Description" text,
  "Treating Doctor Name" text,
  "Approval Number" text,
  "Insurance Number" text,
  "Hospital File Number" text,
  "Type of Admission" text,
  "Expected Surgery Date" text,
  "Email" text,
  "Case Manager" text,
  "Notes" text,
  "Date of Order Submission" text,
  "Category of Failure" text,
  "Reason of Pending Cancellation" text,
  "Medical Condition" text,
  "Paid Amount" text,
  "Currency" text,
  raw_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_excel_upload_batches_uploaded_by ON public.excel_upload_batches(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_excel_upload_batches_status ON public.excel_upload_batches(status);

CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_upload_batch ON public.excel_rows_raw(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_status ON public.excel_rows_raw("Status");
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_branch ON public.excel_rows_raw("Branch");
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_date ON public.excel_rows_raw("Date");
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_specialty ON public.excel_rows_raw("Specialty");

-- 4. Create import function with proper security
CREATE OR REPLACE FUNCTION public.import_excel_rows(batch_id uuid, rows_data jsonb[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  row_data jsonb;
  row_num integer := 1;
BEGIN
  -- Insert each row with complete column mapping
  FOREACH row_data IN ARRAY rows_data
  LOOP
    INSERT INTO public.excel_rows_raw (
      upload_batch_id,
      row_number,
      "Date",
      "Date of File Opening",
      "Agreed Booked Date",
      "Status",
      "Branch",
      "Specialty",
      "Case Coordinator",
      "Hospital Name",
      "Patient Name",
      "Patient ID",
      "Patient Mobile",
      "Patient National ID",
      "Insurance Cash",
      "Approval Status",
      "Service Description",
      "Treating Doctor Name",
      "Approval Number",
      "Insurance Number",
      "Hospital File Number",
      "Type of Admission",
      "Expected Surgery Date",
      "Email",
      "Case Manager",
      "Notes",
      "Date of Order Submission",
      "Category of Failure",
      "Reason of Pending Cancellation",
      "Medical Condition",
      "Paid Amount",
      "Currency",
      raw_data
    ) VALUES (
      batch_id,
      row_num,
      COALESCE(row_data->>'AP', row_data->>'Date', row_data->>'Date of Request'),
      COALESCE(row_data->>'B', row_data->>'Date of File Opening'),
      COALESCE(row_data->>'AH', row_data->>'Agreed - Booked - OR date(mm/dd/yyyy)', row_data->>'Agreed Booked Date'),
      COALESCE(row_data->>'AI', row_data->>'Status', row_data->>'Status of operation'),
      COALESCE(row_data->>'G', row_data->>'Branch', row_data->>'My Clinic Branch'),
      COALESCE(row_data->>'L', row_data->>'Specialty'),
      COALESCE(row_data->>'S', row_data->>'Case coordinator', row_data->>'Case Coordinator'),
      COALESCE(row_data->>'N', row_data->>'Hospital Name', row_data->>'Referred Hospital'),
      COALESCE(row_data->>'D', row_data->>'Patient Name', row_data->>'Patient''s Name:'),
      COALESCE(row_data->>'H', row_data->>'Patient ID', row_data->>'Patient''s MRN:'),
      COALESCE(row_data->>'K', row_data->>'Patient Mobile', row_data->>'Patient''s Mobile No.:'),
      COALESCE(row_data->>'J', row_data->>'Patient National ID', row_data->>'Patient''s National ID:'),
      COALESCE(row_data->>'Y', row_data->>'Insurance Cash', row_data->>'Insurance/Cash'),
      COALESCE(row_data->>'AF', row_data->>'Approval Status'),
      COALESCE(row_data->>'O', row_data->>'Service Description', row_data->>'Service Description of referred service'),
      COALESCE(row_data->>'P', row_data->>'Treating Doctor Name', row_data->>'Treating Doctor''s Name'),
      COALESCE(row_data->>'AE', row_data->>'Approval Number'),
      COALESCE(row_data->>'Z', row_data->>'Insurance Number'),
      COALESCE(row_data->>'AB', row_data->>'Hospital File Number'),
      COALESCE(row_data->>'M', row_data->>'Type of Admission'),
      COALESCE(row_data->>'Q', row_data->>'Expected Surgery Date', row_data->>'Expected date of Surgery'),
      COALESCE(row_data->>'Email', row_data->>'email'),
      COALESCE(row_data->>'S', row_data->>'Case Manager'),
      COALESCE(row_data->>'R', row_data->>'Notes', row_data->>'Notes: if you want to add'),
      COALESCE(row_data->>'AC', row_data->>'Date of Order Submission'),
      COALESCE(row_data->>'AK', row_data->>'Category of Failure'),
      COALESCE(row_data->>'AJ', row_data->>'Reason of Pending Cancellation', row_data->>'Reason of pending or cancellation'),
      row_data->>'Medical Condition',
      row_data->>'Paid Amount',
      row_data->>'Currency',
      row_data
    );
    
    row_num := row_num + 1;
  END LOOP;
  
  -- Update batch statistics
  UPDATE public.excel_upload_batches 
  SET 
    processed_rows = array_length(rows_data, 1),
    success_count = array_length(rows_data, 1),
    status = 'completed',
    updated_at = now()
  WHERE id = batch_id;
END;
$$;

-- 5. Enable RLS on both tables
ALTER TABLE public.excel_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_rows_raw ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for excel_upload_batches
CREATE POLICY "Users can view their own upload batches"
  ON public.excel_upload_batches FOR SELECT
  USING (auth.uid() = uploaded_by OR public.is_admin());

CREATE POLICY "Users can insert their own upload batches"
  ON public.excel_upload_batches FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own upload batches"
  ON public.excel_upload_batches FOR UPDATE
  USING (auth.uid() = uploaded_by OR public.is_admin());

CREATE POLICY "Admins can delete upload batches"
  ON public.excel_upload_batches FOR DELETE
  USING (public.is_admin());

-- 7. Create RLS policies for excel_rows_raw
CREATE POLICY "Users can view excel data they uploaded"
  ON public.excel_rows_raw FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.excel_upload_batches eub 
      WHERE eub.id = upload_batch_id 
      AND (eub.uploaded_by = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert excel data"
  ON public.excel_rows_raw FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.excel_upload_batches eub 
      WHERE eub.id = upload_batch_id 
      AND eub.uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all excel data"
  ON public.excel_rows_raw FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());