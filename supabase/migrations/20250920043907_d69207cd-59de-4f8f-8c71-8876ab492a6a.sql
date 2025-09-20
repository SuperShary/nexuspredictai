-- Add sample academic performance records (without percentage as it's generated)
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, grade) 
SELECT 
    s.id,
    subjects.subject_name,
    test_types.test_type,
    CURRENT_DATE - (RANDOM() * 60)::INTEGER,
    ROUND(CASE s.risk_level
        WHEN 'safe' THEN 75 + (RANDOM() * 25)
        WHEN 'caution' THEN 50 + (RANDOM() * 30) 
        WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
        ELSE 70 + (RANDOM() * 30)
    END, 1) as score_val,
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

-- Add fee records with simpler status logic
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status, paid_date, payment_method)
SELECT 
    s.id,
    fees.fee_type,
    fees.amount,
    CURRENT_DATE + INTERVAL '30 days',
    CASE s.risk_level
        WHEN 'safe' THEN 'paid'
        WHEN 'caution' THEN CASE WHEN RANDOM() < 0.6 THEN 'paid' ELSE 'pending' END
        WHEN 'high_risk' THEN 'pending'
        ELSE 'paid'
    END,
    CASE s.risk_level
        WHEN 'safe' THEN CURRENT_DATE - INTERVAL '5 days'
        WHEN 'caution' THEN CASE WHEN RANDOM() < 0.6 THEN CURRENT_DATE - INTERVAL '5 days' ELSE NULL END
        WHEN 'high_risk' THEN NULL
        ELSE CURRENT_DATE - INTERVAL '5 days'
    END,
    CASE s.risk_level
        WHEN 'safe' THEN 'Bank Transfer'
        WHEN 'caution' THEN CASE WHEN RANDOM() < 0.6 THEN 'Bank Transfer' ELSE NULL END
        WHEN 'high_risk' THEN NULL
        ELSE 'Bank Transfer'
    END
FROM 
    (SELECT id, risk_level FROM public.students LIMIT 25) s
CROSS JOIN 
    (VALUES 
        ('Tuition', 2000), 
        ('Library', 200), 
        ('Sports', 300), 
        ('Lab', 500), 
        ('Transportation', 400)
    ) AS fees(fee_type, amount);

-- Add some notifications (simplified)
INSERT INTO public.notifications (recipient_id, student_id, type, title, message, priority, status)
SELECT 
    (SELECT user_id FROM public.profiles LIMIT 1) as recipient_id,
    s.id,
    'risk_assessment',
    CASE s.risk_level
        WHEN 'high_risk' THEN 'URGENT: High Risk Student Alert'
        WHEN 'caution' THEN 'ATTENTION: Student Requires Monitoring'
        ELSE 'INFO: Student Status Update'
    END,
    'Student ' || s.student_id || ' has been assessed with ' || s.risk_level || ' risk level.',
    CASE s.risk_level
        WHEN 'high_risk' THEN 'high'::notification_priority
        WHEN 'caution' THEN 'medium'::notification_priority
        ELSE 'low'::notification_priority
    END,
    'pending'::notification_status
FROM 
    (SELECT id, student_id, risk_level FROM public.students WHERE risk_level IN ('high_risk', 'caution') LIMIT 15) s;