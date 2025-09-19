-- Fix function search paths first
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create helper function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for students table
CREATE POLICY "Students can view own profile" ON public.students
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'teacher') OR
        public.has_role(auth.uid(), 'mentor')
    );

CREATE POLICY "Admins and teachers can insert students" ON public.students
    FOR INSERT WITH CHECK (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'teacher')
    );

CREATE POLICY "Admins and teachers can update students" ON public.students
    FOR UPDATE USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'teacher')
    );

-- Create RLS policies for attendance table
CREATE POLICY "Teachers can manage attendance" ON public.attendance
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'teacher')
    );

CREATE POLICY "Students can view own attendance" ON public.attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.id = student_id AND s.user_id = auth.uid()
        )
    );

-- Create RLS policies for academic_performance table  
CREATE POLICY "Teachers can manage academic performance" ON public.academic_performance
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'teacher')
    );

CREATE POLICY "Students can view own performance" ON public.academic_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.id = student_id AND s.user_id = auth.uid()
        )
    );

-- Create RLS policies for fee_records table
CREATE POLICY "Admins can manage fee records" ON public.fee_records
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own fee records" ON public.fee_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.id = student_id AND s.user_id = auth.uid()
        )
    );

-- Create RLS policies for interventions table
CREATE POLICY "Mentors and admins can manage interventions" ON public.interventions
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'mentor') OR
        public.has_role(auth.uid(), 'teacher')
    );

-- Create RLS policies for notifications table
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (recipient_id = (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins and mentors can send notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'mentor') OR
        public.has_role(auth.uid(), 'teacher')
    );

CREATE POLICY "Users can update their notification status" ON public.notifications
    FOR UPDATE USING (recipient_id = (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ));