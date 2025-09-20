-- Add missing RLS policies for students table (only if they don't exist)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Only create policies that don't exist
DO $$ 
BEGIN
    -- Check and create insert policy for students
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' AND policyname = 'Admins can insert students'
    ) THEN
        CREATE POLICY "Admins can insert students" 
        ON students FOR INSERT 
        WITH CHECK (get_current_user_role() = 'admin'::text);
    END IF;

    -- Check and create update policy for students
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' AND policyname = 'Admins can update students'
    ) THEN
        CREATE POLICY "Admins can update students" 
        ON students FOR UPDATE 
        USING (get_current_user_role() = 'admin'::text)
        WITH CHECK (get_current_user_role() = 'admin'::text);
    END IF;

    -- Check and create delete policy for students
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' AND policyname = 'Admins can delete students'
    ) THEN
        CREATE POLICY "Admins can delete students" 
        ON students FOR DELETE 
        USING (get_current_user_role() = 'admin'::text);
    END IF;
END $$;

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