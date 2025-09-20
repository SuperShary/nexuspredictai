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

-- Add sample notifications (for admin users)
INSERT INTO public.notifications (recipient_id, student_id, type, title, message, priority, status)
SELECT 
    p.user_id,
    s.id,
    notif_types.notif_type,
    CASE notif_types.notif_type
        WHEN 'attendance_alert' THEN 'Low Attendance Alert'
        WHEN 'grade_update' THEN 'Grade Posted'
        WHEN 'fee_reminder' THEN 'Fee Payment Due'
        WHEN 'risk_assessment' THEN 'Risk Level Update'
        ELSE 'General Notification'
    END,
    CASE notif_types.notif_type
        WHEN 'attendance_alert' THEN 'Student ' || s.student_id || ' has concerning attendance patterns'
        WHEN 'grade_update' THEN 'New test scores have been posted for student ' || s.student_id
        WHEN 'fee_reminder' THEN 'Outstanding fees need attention for student ' || s.student_id
        WHEN 'risk_assessment' THEN 'Risk assessment has been updated for student ' || s.student_id
        ELSE 'General notification for student ' || s.student_id
    END,
    CASE s.risk_level
        WHEN 'high_risk' THEN 'high'::notification_priority
        WHEN 'caution' THEN 'medium'::notification_priority
        ELSE 'low'::notification_priority
    END,
    'pending'::notification_status
FROM 
    (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1) p
CROSS JOIN
    (SELECT id, student_id, risk_level FROM public.students WHERE risk_level IN ('high_risk', 'caution') LIMIT 15) s
CROSS JOIN
    (VALUES ('attendance_alert'), ('grade_update'), ('fee_reminder'), ('risk_assessment')) AS notif_types(notif_type)
WHERE RANDOM() < 0.4;