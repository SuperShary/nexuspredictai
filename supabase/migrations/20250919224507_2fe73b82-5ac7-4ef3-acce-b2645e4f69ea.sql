-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL,
    enrollment_date DATE NOT NULL,
    grade_level TEXT,
    section TEXT,
    parent_id UUID REFERENCES public.profiles(id),
    mentor_id UUID REFERENCES public.profiles(id),
    risk_level TEXT DEFAULT 'safe',
    risk_score DECIMAL(5,2) DEFAULT 0,
    last_risk_calculation TIMESTAMP WITH TIME ZONE,
    dropout_probability DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for demonstration
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin@school.edu', crypt('password123', gen_salt('bf')), now(), '{"first_name": "Admin", "last_name": "User", "role": "admin"}'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'john.doe@student.edu', crypt('password123', gen_salt('bf')), now(), '{"first_name": "John", "last_name": "Doe", "role": "student"}'),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'jane.smith@student.edu', crypt('password123', gen_salt('bf')), now(), '{"first_name": "Jane", "last_name": "Smith", "role": "student"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample students data
INSERT INTO public.students (user_id, student_id, enrollment_date, grade_level, section, risk_level, risk_score, dropout_probability)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'STU001', '2024-01-15', 'Grade 10', 'A', 'caution', 65.5, 35.2),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'STU002', '2024-01-15', 'Grade 10', 'B', 'high_risk', 85.7, 78.3)
ON CONFLICT (student_id) DO NOTHING;