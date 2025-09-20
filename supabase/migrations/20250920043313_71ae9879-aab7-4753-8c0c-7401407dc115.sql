-- Add attendance records for realistic dashboard data
INSERT INTO public.attendance (student_id, date, status, check_in_time, check_out_time, remarks)
SELECT 
    s.id,
    CURRENT_DATE - (random() * 30)::int,  -- Random date within last 30 days
    CASE 
        WHEN random() < 0.85 THEN 'present'::attendance_status
        WHEN random() < 0.95 THEN 'absent'::attendance_status
        ELSE 'late'::attendance_status
    END,
    ('08:00:00'::time + (random() * interval '2 hours'))::time,  -- Random check-in between 8-10 AM
    ('15:00:00'::time + (random() * interval '2 hours'))::time,  -- Random check-out between 3-5 PM
    CASE 
        WHEN random() < 0.7 THEN NULL
        WHEN random() < 0.9 THEN 'Regular attendance'
        ELSE 'Medical leave'
    END
FROM public.students s,
     generate_series(1, 15) gs  -- 15 attendance records per student
WHERE random() < 0.95;  -- Some days might not have records

-- Add academic performance records
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score, percentage, grade)
SELECT 
    s.id,
    subjects.subject,
    test_types.test_type,
    CURRENT_DATE - (random() * 90)::int,  -- Random date within last 90 days
    (40 + random() * 60)::numeric,  -- Score between 40-100
    100,
    (40 + random() * 60)::numeric,  -- Percentage between 40-100
    CASE 
        WHEN (40 + random() * 60) >= 90 THEN 'A'
        WHEN (40 + random() * 60) >= 80 THEN 'B'
        WHEN (40 + random() * 60) >= 70 THEN 'C'
        WHEN (40 + random() * 60) >= 60 THEN 'D'
        ELSE 'F'
    END
FROM public.students s
CROSS JOIN (VALUES ('Mathematics'), ('Science'), ('English'), ('History'), ('Geography')) AS subjects(subject)
CROSS JOIN (VALUES ('Quiz'), ('Test'), ('Assignment'), ('Project'), ('Final Exam')) AS test_types(test_type)
WHERE random() < 0.4;  -- Not every subject-test combination for every student

-- Add fee records
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status, paid_date, payment_method, late_fee)
SELECT 
    s.id,
    fee_types.fee_type,
    fee_types.amount,
    CURRENT_DATE + (random() * 60 - 30)::int,  -- Due dates from 30 days ago to 30 days from now
    CASE 
        WHEN random() < 0.7 THEN 'paid'
        WHEN random() < 0.9 THEN 'pending'
        ELSE 'overdue'
    END,
    CASE 
        WHEN random() < 0.7 THEN CURRENT_DATE - (random() * 30)::int
        ELSE NULL
    END,
    CASE 
        WHEN random() < 0.4 THEN 'cash'
        WHEN random() < 0.7 THEN 'card'
        WHEN random() < 0.9 THEN 'bank_transfer'
        ELSE 'online'
    END,
    CASE 
        WHEN random() < 0.2 THEN (random() * 50)::numeric
        ELSE 0
    END
FROM public.students s
CROSS JOIN (VALUES 
    ('Tuition', 5000),
    ('Library Fee', 500),
    ('Lab Fee', 1000),
    ('Sports Fee', 300),
    ('Examination Fee', 800)
) AS fee_types(fee_type, amount)
WHERE random() < 0.6;  -- Not every fee type for every student

-- Add some sample notifications for recent activity
INSERT INTO public.notifications (recipient_id, title, message, type, priority, status, channel)
SELECT 
    (SELECT user_id FROM public.profiles LIMIT 1),  -- Use the first admin user
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
    ('Monthly Report', 'September 2024 student analytics report is now available', 'report', 'low')
) AS notifications(title, message, type, priority);