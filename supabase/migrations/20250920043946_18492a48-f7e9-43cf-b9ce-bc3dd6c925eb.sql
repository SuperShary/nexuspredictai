-- Add sample academic performance records (without percentage as it's generated)
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, grade) 
SELECT 
    s.id,
    subj.subject_name,
    CASE WHEN (row_number() OVER (PARTITION BY s.id, subj.subject_name)) % 3 = 1 THEN 'Midterm' 
         WHEN (row_number() OVER (PARTITION BY s.id, subj.subject_name)) % 3 = 2 THEN 'Quiz' 
         ELSE 'Final' END,
    CURRENT_DATE - (FLOOR(RANDOM() * 30) + 1)::INTEGER,
    CASE 
        WHEN s.risk_level = 'safe' THEN 75 + (RANDOM() * 25)
        WHEN s.risk_level = 'caution' THEN 50 + (RANDOM() * 30)
        WHEN s.risk_level = 'high_risk' THEN 25 + (RANDOM() * 35)
        ELSE 70 + (RANDOM() * 30)
    END,
    100,
    CASE 
        WHEN (CASE 
                WHEN s.risk_level = 'safe' THEN 75 + (RANDOM() * 25)
                WHEN s.risk_level = 'caution' THEN 50 + (RANDOM() * 30)
                WHEN s.risk_level = 'high_risk' THEN 25 + (RANDOM() * 35)
                ELSE 70 + (RANDOM() * 30)
              END) >= 90 THEN 'A'
        WHEN (CASE 
                WHEN s.risk_level = 'safe' THEN 75 + (RANDOM() * 25)
                WHEN s.risk_level = 'caution' THEN 50 + (RANDOM() * 30)
                WHEN s.risk_level = 'high_risk' THEN 25 + (RANDOM() * 35)
                ELSE 70 + (RANDOM() * 30)
              END) >= 80 THEN 'B'
        WHEN (CASE 
                WHEN s.risk_level = 'safe' THEN 75 + (RANDOM() * 25)
                WHEN s.risk_level = 'caution' THEN 50 + (RANDOM() * 30)
                WHEN s.risk_level = 'high_risk' THEN 25 + (RANDOM() * 35)
                ELSE 70 + (RANDOM() * 30)
              END) >= 70 THEN 'C'
        WHEN (CASE 
                WHEN s.risk_level = 'safe' THEN 75 + (RANDOM() * 25)
                WHEN s.risk_level = 'caution' THEN 50 + (RANDOM() * 30)
                WHEN s.risk_level = 'high_risk' THEN 25 + (RANDOM() * 35)
                ELSE 70 + (RANDOM() * 30)
              END) >= 60 THEN 'D'
        ELSE 'F'
    END
FROM (SELECT id, risk_level FROM public.students LIMIT 15) s
CROSS JOIN (
    SELECT unnest(ARRAY['Mathematics', 'English', 'Science', 'History', 'Physics']) AS subject_name
) subj
CROSS JOIN generate_series(1, 2) AS test_num; -- 2 tests per subject per student

-- Add fee records
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status, paid_date, payment_method)
SELECT 
    s.id,
    ft.fee_type_name,
    ft.amount_val,
    CURRENT_DATE + INTERVAL '1 month',
    CASE 
        WHEN s.risk_level = 'safe' AND RANDOM() < 0.90 THEN 'paid'
        WHEN s.risk_level = 'caution' AND RANDOM() < 0.60 THEN 'paid'
        WHEN s.risk_level = 'high_risk' AND RANDOM() < 0.30 THEN 'paid'
        ELSE 'pending'
    END,
    CASE 
        WHEN s.risk_level = 'safe' AND RANDOM() < 0.90 THEN CURRENT_DATE - INTERVAL '5 days'
        WHEN s.risk_level = 'caution' AND RANDOM() < 0.60 THEN CURRENT_DATE - INTERVAL '5 days'
        WHEN s.risk_level = 'high_risk' AND RANDOM() < 0.30 THEN CURRENT_DATE - INTERVAL '5 days'
        ELSE NULL
    END,
    CASE 
        WHEN s.risk_level = 'safe' AND RANDOM() < 0.90 THEN 'Bank Transfer'
        WHEN s.risk_level = 'caution' AND RANDOM() < 0.60 THEN 'Bank Transfer'
        WHEN s.risk_level = 'high_risk' AND RANDOM() < 0.30 THEN 'Bank Transfer'
        ELSE NULL
    END
FROM (SELECT id, risk_level FROM public.students LIMIT 15) s
CROSS JOIN (
    VALUES 
        ('Tuition', 2000),
        ('Library', 200),
        ('Sports', 300),
        ('Lab', 500),
        ('Transportation', 400)
) AS ft(fee_type_name, amount_val);

-- Add sample notifications (only if there's a user to send them to)
INSERT INTO public.notifications (recipient_id, student_id, type, title, message, priority, status)
SELECT 
    COALESCE(
        (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
        (SELECT user_id FROM public.profiles LIMIT 1)
    ),
    s.id,
    nt.notif_type,
    nt.title,
    nt.message || s.student_id,
    CASE 
        WHEN s.risk_level = 'high_risk' THEN 'high'::notification_priority
        WHEN s.risk_level = 'caution' THEN 'medium'::notification_priority
        ELSE 'low'::notification_priority
    END,
    'pending'::notification_status
FROM (SELECT id, student_id, risk_level FROM public.students LIMIT 10) s
CROSS JOIN (
    VALUES 
        ('attendance_alert', 'Low Attendance Alert', 'Student '),
        ('grade_update', 'Grade Posted', 'New grades posted for student '),
        ('fee_reminder', 'Fee Payment Due', 'Fee payment reminder for student '),
        ('risk_assessment', 'Risk Level Update', 'Risk assessment updated for student ')
) AS nt(notif_type, title, message)
WHERE (s.risk_level = 'high_risk' OR RANDOM() < 0.3)
AND (SELECT user_id FROM public.profiles LIMIT 1) IS NOT NULL;