-- Add individual columns for all Excel fields to excel_rows_raw table
ALTER TABLE excel_rows_raw 
ADD COLUMN IF NOT EXISTS "Date of File Opening" text,
ADD COLUMN IF NOT EXISTS "Agreed Booked Date" text,
ADD COLUMN IF NOT EXISTS "Case Coordinator" text,
ADD COLUMN IF NOT EXISTS "Patient Mobile" text,
ADD COLUMN IF NOT EXISTS "Patient National ID" text,
ADD COLUMN IF NOT EXISTS "Insurance Cash" text,
ADD COLUMN IF NOT EXISTS "Approval Status" text,
ADD COLUMN IF NOT EXISTS "Service Description" text,
ADD COLUMN IF NOT EXISTS "Treating Doctor Name" text,
ADD COLUMN IF NOT EXISTS "Approval Number" text,
ADD COLUMN IF NOT EXISTS "Insurance Number" text,
ADD COLUMN IF NOT EXISTS "Hospital File Number" text,
ADD COLUMN IF NOT EXISTS "Type of Admission" text,
ADD COLUMN IF NOT EXISTS "Expected Surgery Date" text,
ADD COLUMN IF NOT EXISTS "Email" text,
ADD COLUMN IF NOT EXISTS "Case Manager" text,
ADD COLUMN IF NOT EXISTS "Date of Order Submission" text,
ADD COLUMN IF NOT EXISTS "Category of Failure" text,
ADD COLUMN IF NOT EXISTS "Reason of Pending Cancellation" text;

-- Update the import_excel_rows function to handle all Excel columns
CREATE OR REPLACE FUNCTION public.import_excel_rows(batch_id uuid, rows_data jsonb[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  row_data jsonb;
  row_num integer := 1;
BEGIN
  -- Insert each row with complete column mapping
  FOREACH row_data IN ARRAY rows_data
  LOOP
    INSERT INTO excel_rows_raw (
      upload_batch_id,
      row_number,
      "Date", -- Column AP
      "Date of File Opening", -- Column B  
      "Agreed Booked Date", -- Column AH
      "Status", -- Column AI
      "Branch", -- Column G
      "Specialty", -- Column L
      "Case Coordinator", -- Column S
      "Hospital Name", -- Column N
      "Patient Name", -- Column D
      "Patient ID", -- Column H (MRN)
      "Patient Mobile", -- Column K
      "Patient National ID", -- Column J
      "Insurance Cash", -- Column Y
      "Approval Status", -- Column AF
      "Service Description", -- Column O
      "Treating Doctor Name", -- Column P
      "Approval Number", -- Column AE
      "Insurance Number", -- Column Z
      "Hospital File Number", -- Column AB
      "Type of Admission", -- Column M
      "Expected Surgery Date", -- Column Q
      "Email", -- No specific column mentioned
      "Case Manager", -- Column S (same as Case Coordinator)
      "Notes", -- Column R
      "Date of Order Submission", -- Column AC
      "Category of Failure", -- Column AK
      "Reason of Pending Cancellation", -- Column AJ
      "Medical Condition",
      "Paid Amount",
      "Currency",
      raw_data
    ) VALUES (
      batch_id,
      row_num,
      COALESCE(row_data->>'AP', row_data->>'Date of Request'),
      COALESCE(row_data->>'B', row_data->>'Date of File Opening'),
      COALESCE(row_data->>'AH', row_data->>'Agreed - Booked - OR date(mm/dd/yyyy)'),
      COALESCE(row_data->>'AI', row_data->>'Status of operation'),
      COALESCE(row_data->>'G', row_data->>'My Clinic Branch'),
      COALESCE(row_data->>'L', row_data->>'Specialty'),
      COALESCE(row_data->>'S', row_data->>'Case coordinator'),
      COALESCE(row_data->>'N', row_data->>'Referred Hospital'),
      COALESCE(row_data->>'D', row_data->>'Patient''s Name:'),
      COALESCE(row_data->>'H', row_data->>'Patient''s MRN:'),
      COALESCE(row_data->>'K', row_data->>'Patient''s Mobile No.:'),
      COALESCE(row_data->>'J', row_data->>'Patient''s National ID:'),
      COALESCE(row_data->>'Y', row_data->>'Insurance/Cash'),
      COALESCE(row_data->>'AF', row_data->>'Approval Status'),
      COALESCE(row_data->>'O', row_data->>'Service Description of referred service'),
      COALESCE(row_data->>'P', row_data->>'Treating Doctor''s Name'),
      COALESCE(row_data->>'AE', row_data->>'Approval Number'),
      COALESCE(row_data->>'Z', row_data->>'Insurance Number'),
      COALESCE(row_data->>'AB', row_data->>'Hospital File Number'),
      COALESCE(row_data->>'M', row_data->>'Type of Admission'),
      COALESCE(row_data->>'Q', row_data->>'Expected date of Surgery'),
      COALESCE(row_data->>'Email', row_data->>'Email'),
      COALESCE(row_data->>'S', row_data->>'Case Manager'),
      COALESCE(row_data->>'R', row_data->>'Notes: if you want to add'),
      COALESCE(row_data->>'AC', row_data->>'Date of Order Submission'),
      COALESCE(row_data->>'AK', row_data->>'Category of Failure'),
      COALESCE(row_data->>'AJ', row_data->>'Reason of pending or cancellation'),
      row_data->>'Medical Condition',
      row_data->>'Paid Amount',
      row_data->>'Currency',
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
$function$