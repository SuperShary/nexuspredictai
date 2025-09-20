-- Simple data insertion without complex foreign key references

-- Add attendance records with basic ON CONFLICT handling
INSERT INTO public.attendance (student_id, date, status, check_in_time, check_out_time, remarks)
SELECT 
    s.id,
    CURRENT_DATE - generate_series.day_offset,
    CASE WHEN RANDOM() > 0.2 THEN 'present'::attendance_status ELSE 'absent'::attendance_status END,
    CASE WHEN RANDOM() > 0.2 THEN '08:00:00'::TIME ELSE NULL END,
    CASE WHEN RANDOM() > 0.2 THEN '15:30:00'::TIME ELSE NULL END,
    CASE WHEN RANDOM() > 0.2 THEN 'Regular attendance' ELSE 'Unexcused absence' END
FROM 
    (SELECT id FROM public.students LIMIT 20) s
CROSS JOIN 
    (SELECT generate_series(1, 10) as day_offset) generate_series
WHERE EXTRACT(DOW FROM (CURRENT_DATE - generate_series.day_offset)) NOT IN (0, 6)
ON CONFLICT (student_id, date) DO NOTHING;

-- Add basic academic performance records
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, grade)
SELECT 
    s.id,
    'Mathematics',
    'Midterm',
    CURRENT_DATE - 15,
    85.0,
    100,
    'B'
FROM public.students s LIMIT 10
ON CONFLICT DO NOTHING;

INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, grade)
SELECT 
    s.id,
    'English',
    'Quiz',
    CURRENT_DATE - 7,
    78.5,
    100,
    'C'
FROM public.students s LIMIT 10
ON CONFLICT DO NOTHING;

-- Add fee records without foreign key issues
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status)
SELECT 
    s.id,
    'Tuition',
    2000,
    CURRENT_DATE + INTERVAL '30 days',
    'pending'
FROM public.students s LIMIT 15
ON CONFLICT DO NOTHING;