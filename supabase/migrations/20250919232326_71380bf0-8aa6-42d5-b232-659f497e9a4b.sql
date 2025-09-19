-- Enable RLS on fee_records table
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fee_records table
CREATE POLICY "Users can view fee records they have access to"
ON public.fee_records
FOR SELECT
TO authenticated
USING (public.can_access_student_data(student_id));

CREATE POLICY "Only admins can insert fee records"
ON public.fee_records
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update fee records"
ON public.fee_records
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete fee records"
ON public.fee_records
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');