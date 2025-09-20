-- Add RLS policies for students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all students" 
ON students FOR SELECT 
USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admins can insert students" 
ON students FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admins can update students" 
ON students FOR UPDATE 
USING (get_current_user_role() = 'admin'::text)
WITH CHECK (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admins can delete students" 
ON students FOR DELETE 
USING (get_current_user_role() = 'admin'::text);

-- Add RLS policies for interventions table
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interventions they have access to" 
ON interventions FOR SELECT 
USING (can_access_student_data(student_id));

CREATE POLICY "Teachers and admins can insert interventions" 
ON interventions FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['teacher'::text, 'admin'::text]));

CREATE POLICY "Teachers and admins can update interventions" 
ON interventions FOR UPDATE 
USING ((get_current_user_role() = ANY (ARRAY['teacher'::text, 'admin'::text])) AND ((initiated_by = auth.uid()) OR (get_current_user_role() = 'admin'::text)))
WITH CHECK ((get_current_user_role() = ANY (ARRAY['teacher'::text, 'admin'::text])) AND ((initiated_by = auth.uid()) OR (get_current_user_role() = 'admin'::text)));

CREATE POLICY "Only admins can delete interventions" 
ON interventions FOR DELETE 
USING (get_current_user_role() = 'admin'::text);

-- Add RLS policies for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = recipient_id OR get_current_user_role() = 'admin'::text);

CREATE POLICY "Teachers and admins can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['teacher'::text, 'admin'::text]));

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = recipient_id OR get_current_user_role() = 'admin'::text)
WITH CHECK (auth.uid() = recipient_id OR get_current_user_role() = 'admin'::text);

CREATE POLICY "Only admins can delete notifications" 
ON notifications FOR DELETE 
USING (get_current_user_role() = 'admin'::text);