-- Add attendance records for recent days (ensuring no duplicates)
INSERT INTO public.attendance (student_id, date, status, check_in_time, check_out_time, remarks)
SELECT 
    s.id,
    dates.target_date,
    CASE s.risk_level
        WHEN 'safe' THEN CASE WHEN RANDOM() < 0.95 THEN 'present' ELSE 'absent' END
        WHEN 'caution' THEN CASE WHEN RANDOM() < 0.80 THEN 'present' ELSE 'absent' END
        WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.65 THEN 'present' ELSE 'absent' END
        ELSE 'present'
    END::attendance_status,
    CASE 
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN CASE WHEN RANDOM() < 0.95 THEN 'present' ELSE 'absent' END
            WHEN 'caution' THEN CASE WHEN RANDOM() < 0.80 THEN 'present' ELSE 'absent' END
            WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.65 THEN 'present' ELSE 'absent' END
            ELSE 'present'
        END) = 'present' THEN '08:00:00'::TIME 
        ELSE NULL 
    END,
    CASE 
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN CASE WHEN RANDOM() < 0.95 THEN 'present' ELSE 'absent' END
            WHEN 'caution' THEN CASE WHEN RANDOM() < 0.80 THEN 'present' ELSE 'absent' END
            WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.65 THEN 'present' ELSE 'absent' END
            ELSE 'present'
        END) = 'present' THEN '15:30:00'::TIME 
        ELSE NULL 
    END,
    CASE 
        WHEN (CASE s.risk_level
            WHEN 'safe' THEN CASE WHEN RANDOM() < 0.95 THEN 'present' ELSE 'absent' END
            WHEN 'caution' THEN CASE WHEN RANDOM() < 0.80 THEN 'present' ELSE 'absent' END
            WHEN 'high_risk' THEN CASE WHEN RANDOM() < 0.65 THEN 'present' ELSE 'absent' END
            ELSE 'present'
        END) = 'present' THEN 'Regular attendance' 
        ELSE 'Unexcused absence' 
    END
FROM 
    (SELECT id, risk_level FROM public.students LIMIT 30) s
CROSS JOIN
    (SELECT CURRENT_DATE - i AS target_date 
     FROM generate_series(0, 10) i 
     WHERE EXTRACT(DOW FROM CURRENT_DATE - i) NOT IN (0, 6)) dates
ON CONFLICT (student_id, date) DO NOTHING;

-- Add sample notifications using existing profile user_ids
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
    (SELECT user_id FROM public.profiles LIMIT 1) p
CROSS JOIN
    (SELECT id, student_id, risk_level FROM public.students WHERE risk_level IN ('high_risk', 'caution') LIMIT 8) s
CROSS JOIN
    (VALUES ('attendance_alert'), ('grade_update'), ('fee_reminder'), ('risk_assessment')) AS notif_types(notif_type)
WHERE RANDOM() < 0.3;