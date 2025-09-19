-- Enable RLS on academic_performance table
ALTER TABLE public.academic_performance ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user's role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user can access student data
CREATE OR REPLACE FUNCTION public.can_access_student_data(target_student_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_student_id uuid;
  is_parent BOOLEAN;
  is_teacher BOOLEAN;
BEGIN
  -- Get current user's role
  SELECT get_current_user_role() INTO user_role;
  
  -- Admins can access all data
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is the student themselves
  SELECT s.id INTO user_student_id 
  FROM public.students s 
  WHERE s.user_id = auth.uid() AND s.id = target_student_id;
  
  IF user_student_id IS NOT NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a parent of the student
  SELECT EXISTS(
    SELECT 1 FROM public.students s 
    WHERE s.id = target_student_id AND s.parent_id = auth.uid()
  ) INTO is_parent;
  
  IF is_parent THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is a teacher of the student (through academic_performance records)
  IF user_role = 'teacher' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.academic_performance ap
      WHERE ap.student_id = target_student_id AND ap.teacher_id = auth.uid()
    ) INTO is_teacher;
    
    IF is_teacher THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create RLS policies for academic_performance table
CREATE POLICY "Users can view academic performance they have access to"
ON public.academic_performance
FOR SELECT
TO authenticated
USING (public.can_access_student_data(student_id));

CREATE POLICY "Teachers can insert academic performance for their students"
ON public.academic_performance
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_current_user_role() IN ('teacher', 'admin') 
  AND (teacher_id = auth.uid() OR public.get_current_user_role() = 'admin')
);

CREATE POLICY "Teachers and admins can update academic performance"
ON public.academic_performance
FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('teacher', 'admin') 
  AND (teacher_id = auth.uid() OR public.get_current_user_role() = 'admin')
)
WITH CHECK (
  public.get_current_user_role() IN ('teacher', 'admin') 
  AND (teacher_id = auth.uid() OR public.get_current_user_role() = 'admin')
);

CREATE POLICY "Only admins can delete academic performance records"
ON public.academic_performance
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');