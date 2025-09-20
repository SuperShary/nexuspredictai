-- Add sample academic performance records (without percentage column as it's generated)
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, grade) 
SELECT 
    s.id,
    subjects.subject_name,
    test_types.test_type,
    CURRENT_DATE - (RANDOM() * 60)::INTEGER,
    CASE s.risk_level
        WHEN 'safe' THEN 75 + (RANDOM() * 25)
        WHEN 'caution' THEN 50 + (RANDOM() * 30) 
        WHEN 'high_risk' THEN 25 + (RANDOM() * 35)
        ELSE 70 + (RANDOM() * 30)
    END as score_val,
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

-- Add fee records
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status, paid_date, payment_method)
SELECT 
    s.id,
    fees.fee_type,
    fees.amount,
    CURRENT_DATE + INTERVAL '30 days',
    CASE s.risk_level
        WHEN 'safe' THEN CASE WHEN RANDOM() < 0.9 THEN 'paid' ELSE 'pending' END
        WHEN 'caution' THEN CASE WHEN RANDOM() < 0.6 THEN 'paid' ELSE 'pending' END
        WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.3 THEN 'paid' ELSE 'pending' END
        ELSE 'paid'
    END,
    CASE 
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN CASE WHEN RANDOM() < 0.9 THEN 'paid' ELSE 'pending' END
            WHEN 'caution' THEN CASE WHEN RANDOM() < 0.6 THEN 'paid' ELSE 'pending' END
            WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.3 THEN 'paid' ELSE 'pending' END
            ELSE 'paid'
        END) = 'paid' THEN CURRENT_DATE - INTERVAL '5 days'
        ELSE NULL
    END,
    CASE 
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN CASE WHEN RANDOM() < 0.9 THEN 'paid' ELSE 'pending' END
            WHEN 'caution' THEN CASE WHEN RANDOM() < 0.6 THEN 'paid' ELSE 'pending' END
            WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.3 THEN 'paid' ELSE 'pending' END
            ELSE 'paid'
        END) = 'paid' THEN 'Bank Transfer'
        ELSE NULL
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