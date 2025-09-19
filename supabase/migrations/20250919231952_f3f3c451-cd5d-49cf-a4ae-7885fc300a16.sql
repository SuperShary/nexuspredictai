-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attendance table
CREATE POLICY "Users can view attendance records they have access to"
ON public.attendance
FOR SELECT
TO authenticated
USING (public.can_access_student_data(student_id));

CREATE POLICY "Teachers and admins can insert attendance records"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_current_user_role() IN ('teacher', 'admin') 
);

CREATE POLICY "Teachers and admins can update attendance records"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('teacher', 'admin') 
  AND (recorded_by = auth.uid() OR public.get_current_user_role() = 'admin')
)
WITH CHECK (
  public.get_current_user_role() IN ('teacher', 'admin') 
  AND (recorded_by = auth.uid() OR public.get_current_user_role() = 'admin')
);

CREATE POLICY "Only admins can delete attendance records"
ON public.attendance
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');