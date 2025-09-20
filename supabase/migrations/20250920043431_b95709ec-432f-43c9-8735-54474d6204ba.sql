-- Add comprehensive data for realistic dashboard display
-- Clear existing data first to avoid conflicts
DELETE FROM public.fee_records;
DELETE FROM public.academic_performance;  
DELETE FROM public.attendance;

-- Add attendance records with unique dates per student
WITH date_series AS (
  SELECT student_id, 
         CURRENT_DATE - gs AS attendance_date,
         ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY gs) as rn
  FROM public.students s
  CROSS JOIN generate_series(1, 30) gs
  WHERE random() < 0.8  -- Not every day has attendance
)
INSERT INTO public.attendance (student_id, date, status, check_in_time, check_out_time, remarks)
SELECT 
    student_id,
    attendance_date,
    CASE 
        WHEN random() < 0.85 THEN 'present'::attendance_status
        WHEN random() < 0.95 THEN 'absent'::attendance_status
        ELSE 'late'::attendance_status
    END,
    ('08:00:00'::time + (random() * interval '2 hours'))::time,
    ('15:00:00'::time + (random() * interval '2 hours'))::time,
    CASE 
        WHEN random() < 0.7 THEN NULL
        WHEN random() < 0.9 THEN 'Regular attendance'
        ELSE 'Medical leave'
    END
FROM date_series
WHERE rn <= 20;  -- Limit to 20 records per student

-- Add academic performance records
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, percentage, grade)
SELECT 
    s.id,
    subjects.subject,
    test_types.test_type,
    CURRENT_DATE - (random() * 90)::int,
    score_val,
    100,
    score_val,
    CASE 
        WHEN score_val >= 90 THEN 'A'
        WHEN score_val >= 80 THEN 'B'
        WHEN score_val >= 70 THEN 'C'
        WHEN score_val >= 60 THEN 'D'
        ELSE 'F'
    END
FROM public.students s
CROSS JOIN (VALUES ('Mathematics'), ('Science'), ('English'), ('History'), ('Geography')) AS subjects(subject)
CROSS JOIN (VALUES ('Quiz'), ('Test'), ('Assignment'), ('Final Exam')) AS test_types(test_type),
LATERAL (VALUES ((40 + random() * 60)::numeric)) AS scores(score_val)
WHERE random() < 0.3;

-- Add fee records
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status, paid_date, payment_method, late_fee)
SELECT 
    s.id,
    fee_types.fee_type,
    fee_types.amount,
    due_date_val,
    status_val,
    CASE WHEN status_val = 'paid' THEN due_date_val - interval '5 days' ELSE NULL END,
    CASE 
        WHEN random() < 0.3 THEN 'cash'
        WHEN random() < 0.6 THEN 'card'
        WHEN random() < 0.8 THEN 'bank_transfer'
        ELSE 'online'
    END,
    CASE WHEN status_val = 'overdue' THEN (random() * 100)::numeric ELSE 0 END
FROM public.students s
CROSS JOIN (VALUES 
    ('Tuition', 5000),
    ('Library Fee', 500),
    ('Lab Fee', 1000),
    ('Sports Fee', 300),
    ('Examination Fee', 800)
) AS fee_types(fee_type, amount),
LATERAL (VALUES (CURRENT_DATE + (random() * 60 - 30)::int)) AS due_dates(due_date_val),
LATERAL (VALUES (
    CASE 
        WHEN random() < 0.6 THEN 'paid'
        WHEN random() < 0.85 THEN 'pending'
        ELSE 'overdue'
    END
)) AS statuses(status_val)
WHERE random() < 0.4;

-- Add notifications for the admin user
INSERT INTO public.notifications (recipient_id, title, message, type, priority, status, channel)
SELECT 
    COALESCE(
        (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
        (SELECT user_id FROM public.profiles LIMIT 1)
    ),
    notifications.title,
    notifications.message,
    notifications.type,
    notifications.priority::notification_priority,
    'sent'::notification_status,
    'in_app'
FROM (VALUES 
    ('High Risk Alert', 'Student STU005 has been flagged as high risk (Risk Score: 41.5)', 'alert', 'high'),
    ('Attendance Warning', '5 students have missed more than 3 consecutive days', 'attendance', 'medium'),
    ('Fee Reminder', '12 fee payments are overdue this month', 'fee', 'medium'),
    ('Academic Alert', 'Student STU010 scored below 40% in Mathematics', 'academic', 'high'),
    ('System Update', 'Risk calculation algorithm updated successfully', 'system', 'low'),
    ('Data Sync Complete', 'Successfully synchronized 147 student records from n8n', 'system', 'low'),
    ('Intervention Required', 'Student STU025 requires immediate counselor intervention', 'intervention', 'high'),
    ('Monthly Report', 'September 2024 student analytics report is now available', 'report', 'low'),
    ('Sync Completed', 'Data sync completed: 97 students, 145 attendance records, 89 academic records updated.', 'system', 'low'),
    ('Webhook Success', 'n8n workflow executed successfully - all data synchronized', 'system', 'low')
) AS notifications(title, message, type, priority);