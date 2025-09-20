-- Add sample academic performance records with proper casting
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, grade) 
SELECT 
    s.id,
    subjects.subject_name,
    test_types.test_type,
    CURRENT_DATE - (RANDOM() * 60)::INTEGER,
    (CASE s.risk_level
        WHEN 'safe' THEN 75 + (RANDOM() * 25)
        WHEN 'caution' THEN 50 + (RANDOM() * 30) 
        WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
        ELSE 70 + (RANDOM() * 30)
    END)::NUMERIC,
    100,
    CASE 
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN 75 + (RANDOM() * 25)
            WHEN 'caution' THEN 50 + (RANDOM() * 30) 
            WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
            ELSE 70 + (RANDOM() * 30)
        END) >= 90 THEN 'A'
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN 75 + (RANDOM() * 25)
            WHEN 'caution' THEN 50 + (RANDOM() * 30) 
            WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
            ELSE 70 + (RANDOM() * 30)
        END) >= 80 THEN 'B'
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN 75 + (RANDOM() * 25)
            WHEN 'caution' THEN 50 + (RANDOM() * 30) 
            WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
            ELSE 70 + (RANDOM() * 30)
        END) >= 70 THEN 'C'
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN 75 + (RANDOM() * 25)
            WHEN 'caution' THEN 50 + (RANDOM() * 30) 
            WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
            ELSE 70 + (RANDOM() * 30)
        END) >= 60 THEN 'D'
        ELSE 'F'
    END
FROM 
    (SELECT id, risk_level FROM public.students LIMIT 25) s
CROSS JOIN 
    (VALUES ('Mathematics'), ('English'), ('Science'), ('History'), ('Physics')) AS subjects(subject_name)
CROSS JOIN
    (VALUES ('Midterm'), ('Quiz'), ('Final')) AS test_types(test_type);

-- Add simple fee records
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status)
SELECT 
    s.id,
    'Tuition',
    2000,
    CURRENT_DATE + INTERVAL '30 days',
    CASE s.risk_level
        WHEN 'safe' THEN 'paid'
        WHEN 'caution' THEN 'pending'
        WHEN 'high_risk' THEN 'pending'
        ELSE 'paid'
    END
FROM public.students s LIMIT 25;

-- Add basic notifications
INSERT INTO public.notifications (recipient_id, type, title, message, priority, status)
VALUES 
    ((SELECT user_id FROM public.profiles LIMIT 1), 'system', 'System Status', 'AI Dashboard initialized with sample data', 'low', 'pending'),
    ((SELECT user_id FROM public.profiles LIMIT 1), 'alert', 'High Risk Students', 'Multiple students identified as high risk', 'high', 'pending'),
    ((SELECT user_id FROM public.profiles LIMIT 1), 'report', 'Daily Report', 'Daily risk assessment completed', 'medium', 'pending');