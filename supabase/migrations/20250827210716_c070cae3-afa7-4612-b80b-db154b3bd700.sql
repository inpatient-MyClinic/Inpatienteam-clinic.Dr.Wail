-- Create excel_rows_raw table to store actual Excel data
CREATE TABLE IF NOT EXISTS public.excel_rows_raw (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_batch_id uuid REFERENCES excel_upload_batches(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  "Date" text,
  "Status" text,
  "Branch" text,
  "Hospital Name" text,
  "Specialty" text,
  "Patient Name" text,
  "Patient ID" text,
  "Medical Condition" text,
  "Paid Amount" text,
  "Currency" text,
  "Notes" text,
  raw_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_upload_batch ON excel_rows_raw(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_status ON excel_rows_raw("Status");
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_branch ON excel_rows_raw("Branch");
CREATE INDEX IF NOT EXISTS idx_excel_rows_raw_date ON excel_rows_raw("Date");

-- Create function to import Excel rows
CREATE OR REPLACE FUNCTION public.import_excel_rows(
  batch_id uuid,
  rows_data jsonb[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  row_data jsonb;
  row_num integer := 1;
BEGIN
  -- Insert each row
  FOREACH row_data IN ARRAY rows_data
  LOOP
    INSERT INTO excel_rows_raw (
      upload_batch_id,
      row_number,
      "Date",
      "Status", 
      "Branch",
      "Hospital Name",
      "Specialty",
      "Patient Name",
      "Patient ID",
      "Medical Condition", 
      "Paid Amount",
      "Currency",
      "Notes",
      raw_data
    ) VALUES (
      batch_id,
      row_num,
      row_data->>'Date',
      row_data->>'Status',
      row_data->>'Branch', 
      row_data->>'Hospital Name',
      row_data->>'Specialty',
      row_data->>'Patient Name',
      row_data->>'Patient ID',
      row_data->>'Medical Condition',
      row_data->>'Paid Amount',
      row_data->>'Currency',
      row_data->>'Notes',
      row_data
    );
    
    row_num := row_num + 1;
  END LOOP;
  
  -- Update batch statistics
  UPDATE excel_upload_batches 
  SET 
    processed_rows = array_length(rows_data, 1),
    success_count = array_length(rows_data, 1),
    status = 'completed'
  WHERE id = batch_id;
END;
$$;

-- Enable RLS on excel_rows_raw
ALTER TABLE excel_rows_raw ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view excel data they uploaded" ON excel_rows_raw
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM excel_upload_batches eub 
      WHERE eub.id = upload_batch_id 
      AND (eub.uploaded_by = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert excel data" ON excel_rows_raw
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM excel_upload_batches eub 
      WHERE eub.id = upload_batch_id 
      AND eub.uploaded_by = auth.uid()
    )
  );