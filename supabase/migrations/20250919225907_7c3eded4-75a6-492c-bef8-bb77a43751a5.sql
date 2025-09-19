-- Create demo user and seed data for the AI dashboard (fixed version)

-- First, let's create some demo students with realistic data  
INSERT INTO public.students (student_id, enrollment_date, grade_level, section, risk_level, risk_score, dropout_probability) VALUES
('2025001', '2024-06-15', '10th', 'A', 'high_risk', 75.5, 85.2),
('2025002', '2024-06-15', '10th', 'A', 'safe', 25.1, 15.3),
('2025003', '2024-06-15', '10th', 'B', 'caution', 55.8, 45.7),
('2025004', '2024-06-15', '9th', 'A', 'high_risk', 82.3, 92.1),
('2025005', '2024-06-15', '9th', 'B', 'safe', 18.7, 12.4),
('2025006', '2024-06-15', '11th', 'A', 'caution', 48.9, 38.6),
('2025007', '2024-06-15', '11th', 'B', 'safe', 22.4, 18.9),
('2025008', '2024-06-15', '10th', 'C', 'high_risk', 78.9, 88.4),
('2025009', '2024-06-15', '12th', 'A', 'caution', 52.1, 42.3),
('2025010', '2024-06-15', '12th', 'B', 'safe', 31.2, 25.7),
('2025011', '2024-06-15', '10th', 'A', 'high_risk', 71.2, 81.5),
('2025012', '2024-06-15', '10th', 'B', 'safe', 28.9, 22.1),
('2025013', '2024-06-15', '9th', 'A', 'caution', 59.4, 49.8),
('2025014', '2024-06-15', '9th', 'B', 'high_risk', 84.1, 89.7),
('2025015', '2024-06-15', '11th', 'A', 'safe', 19.8, 14.2),
('2025016', '2024-06-15', '11th', 'B', 'caution', 46.7, 36.9),
('2025017', '2024-06-15', '12th', 'A', 'safe', 33.5, 28.4),
('2025018', '2024-06-15', '12th', 'B', 'high_risk', 76.8, 83.2),
('2025019', '2024-06-15', '10th', 'C', 'caution', 51.3, 41.7),
('2025020', '2024-06-15', '9th', 'C', 'safe', 24.6, 19.8),
('2025021', '2024-06-15', '10th', 'A', 'high_risk', 77.9, 86.3),
('2025022', '2024-06-15', '10th', 'B', 'safe', 21.4, 16.7),
('2025023', '2024-06-15', '9th', 'A', 'caution', 53.2, 43.8),
('2025024', '2024-06-15', '9th', 'B', 'high_risk', 79.6, 87.9),
('2025025', '2024-06-15', '11th', 'A', 'safe', 26.8, 21.3),
('2025026', '2024-06-15', '11th', 'B', 'caution', 49.1, 39.4),
('2025027', '2024-06-15', '12th', 'A', 'safe', 30.7, 25.1),
('2025028', '2024-06-15', '12th', 'B', 'high_risk', 73.4, 82.7),
('2025029', '2024-06-15', '10th', 'C', 'caution', 56.9, 46.2),
('2025030', '2024-06-15', '9th', 'C', 'safe', 23.1, 18.5),
('2025031', '2024-06-15', '10th', 'A', 'high_risk', 80.2, 88.9),
('2025032', '2024-06-15', '10th', 'B', 'safe', 27.3, 22.6),
('2025033', '2024-06-15', '9th', 'A', 'caution', 50.8, 40.9),
('2025034', '2024-06-15', '9th', 'B', 'high_risk', 74.7, 84.1),
('2025035', '2024-06-15', '11th', 'A', 'safe', 20.9, 15.8),
('2025036', '2024-06-15', '11th', 'B', 'caution', 47.5, 37.2),
('2025037', '2024-06-15', '12th', 'A', 'safe', 32.8, 27.9),
('2025038', '2024-06-15', '12th', 'B', 'high_risk', 75.1, 83.6),
('2025039', '2024-06-15', '10th', 'C', 'caution', 54.6, 44.3),
('2025040', '2024-06-15', '9th', 'C', 'safe', 25.7, 20.4),
('2025041', '2024-06-15', '10th', 'A', 'high_risk', 78.3, 85.7),
('2025042', '2024-06-15', '10th', 'B', 'safe', 22.9, 17.8),
('2025043', '2024-06-15', '9th', 'A', 'caution', 52.4, 42.1),
('2025044', '2024-06-15', '9th', 'B', 'high_risk', 81.7, 89.2),
('2025045', '2024-06-15', '11th', 'A', 'safe', 24.2, 19.1),
('2025046', '2024-06-15', '11th', 'B', 'caution', 48.3, 38.7),
('2025047', '2024-06-15', '12th', 'A', 'safe', 29.4, 24.8),
('2025048', '2024-06-15', '12th', 'B', 'high_risk', 76.5, 84.9),
('2025049', '2024-06-15', '10th', 'C', 'caution', 55.1, 45.6),
('2025050', '2024-06-15', '9th', 'C', 'safe', 26.3, 21.7);

-- Add some attendance records for realistic data
INSERT INTO public.attendance (student_id, date, status, check_in_time, check_out_time) 
SELECT 
    s.id,
    CURRENT_DATE - (generate_series(1, 30) || ' days')::interval,
    CASE 
        WHEN random() < 0.1 THEN 'absent'::attendance_status
        WHEN random() < 0.05 THEN 'late'::attendance_status  
        ELSE 'present'::attendance_status
    END,
    '09:00:00'::time,
    '15:30:00'::time
FROM students s
WHERE s.student_id IN (SELECT student_id FROM students LIMIT 20);

-- Add some academic performance records (without percentage - it's generated)
INSERT INTO public.academic_performance (student_id, subject, test_type, test_date, score, max_score)
SELECT 
    s.id,
    subjects.subject,
    'Unit Test',
    CURRENT_DATE - (floor(random() * 90) || ' days')::interval,
    floor(random() * 80) + 20, -- Score between 20-100
    100
FROM students s
CROSS JOIN (
    VALUES ('Mathematics'), ('English'), ('Science'), ('Social Studies'), ('Hindi')
) AS subjects(subject)
WHERE s.student_id IN (SELECT student_id FROM students LIMIT 25);

-- Add some fee records
INSERT INTO public.fee_records (student_id, fee_type, amount, due_date, status)
SELECT 
    s.id,
    'Tuition Fee',
    15000,
    CURRENT_DATE + interval '30 days',
    CASE 
        WHEN random() < 0.7 THEN 'paid'
        WHEN random() < 0.2 THEN 'pending'
        ELSE 'overdue'
    END
FROM students s;

-- Add some intervention records for at-risk students
INSERT INTO public.interventions (student_id, intervention_type, description, start_date, status)
SELECT 
    s.id,
    'Counseling Session',
    'One-on-one counseling to address academic and personal challenges',
    CURRENT_DATE - interval '7 days',
    'in_progress'::intervention_status
FROM students s
WHERE s.risk_level = 'high_risk'
LIMIT 10;