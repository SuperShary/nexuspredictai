-- Add sample data for all tables, using ON CONFLICT DO NOTHING to handle existing data

-- Add attendance records (using ON CONFLICT DO NOTHING to handle existing records)
DO $$
DECLARE
    student_record RECORD;
    target_date DATE;
    days_back INTEGER;
    attendance_status TEXT;
    random_val REAL;
BEGIN
    FOR student_record IN SELECT id, student_id, risk_level FROM public.students LIMIT 20 LOOP
        FOR days_back IN 0..14 LOOP  -- Just 15 days to avoid too much data
            target_date := CURRENT_DATE - days_back;
            
            IF EXTRACT(DOW FROM target_date) NOT IN (0, 6) THEN
                random_val := RANDOM();
                
                CASE student_record.risk_level
                    WHEN 'safe' THEN
                        attendance_status := CASE WHEN random_val < 0.95 THEN 'present' ELSE 'absent' END;
                    WHEN 'caution' THEN
                        attendance_status := CASE WHEN random_val < 0.80 THEN 'present' ELSE 'absent' END;
                    WHEN 'high_risk' THEN
                        attendance_status := CASE WHEN random_val < 0.60 THEN 'present' ELSE 'absent' END;
                    ELSE
                        attendance_status := 'present';
                END CASE;
                
                INSERT INTO public.attendance (student_id, date, status, check_in_time, check_out_time, remarks) 
                VALUES (
                    student_record.id,
                    target_date,
                    attendance_status::attendance_status,
                    CASE WHEN attendance_status = 'present' THEN '08:00:00'::TIME ELSE NULL END,
                    CASE WHEN attendance_status = 'present' THEN '15:30:00'::TIME ELSE NULL END,
                    CASE WHEN attendance_status = 'absent' THEN 'Unexcused absence' ELSE 'Regular attendance' END
                ) ON CONFLICT (student_id, date) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Add academic performance records
DO $$
DECLARE
    student_record RECORD;
    subject_list TEXT[] := ARRAY['Mathematics', 'English', 'Science', 'History', 'Physics', 'Chemistry', 'Biology'];
    subject_name TEXT;
    test_date DATE;
    score_val NUMERIC;
    random_val REAL;
BEGIN
    FOR student_record IN SELECT id, student_id, risk_level FROM public.students LIMIT 20 LOOP
        FOREACH subject_name IN ARRAY subject_list LOOP
            -- Create 2-3 test records per subject for each student
            FOR i IN 1..3 LOOP
                test_date := CURRENT_DATE - (i * 10 + FLOOR(RANDOM() * 5));
                random_val := RANDOM();
                
                -- Generate scores based on risk level
                CASE student_record.risk_level
                    WHEN 'safe' THEN
                        score_val := 75 + (random_val * 25); -- 75-100
                    WHEN 'caution' THEN
                        score_val := 50 + (random_val * 30); -- 50-80
                    WHEN 'high_risk' THEN
                        score_val := 25 + (random_val * 35); -- 25-60
                    ELSE
                        score_val := 70 + (random_val * 30);
                END CASE;
                
                INSERT INTO public.academic_performance (
                    student_id, subject, test_type, test_date, score, max_score, percentage, grade
                ) VALUES (
                    student_record.id,
                    subject_name,
                    CASE WHEN i = 1 THEN 'Midterm' WHEN i = 2 THEN 'Quiz' ELSE 'Final' END,
                    test_date,
                    ROUND(score_val, 1),
                    100,
                    ROUND(score_val, 1),
                    CASE 
                        WHEN score_val >= 90 THEN 'A'
                        WHEN score_val >= 80 THEN 'B'
                        WHEN score_val >= 70 THEN 'C'
                        WHEN score_val >= 60 THEN 'D'
                        ELSE 'F'
                    END
                );
            END LOOP;
        END FOREACH;
    END LOOP;
END $$;

-- Add fee records
DO $$
DECLARE
    student_record RECORD;
    fee_types TEXT[] := ARRAY['Tuition', 'Library', 'Sports', 'Lab', 'Transportation'];
    fee_type_name TEXT;
    due_date DATE;
    amount_val NUMERIC;
    status_val TEXT;
    random_val REAL;
BEGIN
    FOR student_record IN SELECT id, student_id, risk_level FROM public.students LIMIT 20 LOOP
        FOREACH fee_type_name IN ARRAY fee_types LOOP
            due_date := CURRENT_DATE + INTERVAL '1 month';
            random_val := RANDOM();
            
            -- Generate fee amounts
            CASE fee_type_name
                WHEN 'Tuition' THEN amount_val := 2000;
                WHEN 'Library' THEN amount_val := 200;
                WHEN 'Sports' THEN amount_val := 300;
                WHEN 'Lab' THEN amount_val := 500;
                WHEN 'Transportation' THEN amount_val := 400;
                ELSE amount_val := 250;
            END CASE;
            
            -- Payment status based on risk level
            CASE student_record.risk_level
                WHEN 'safe' THEN
                    status_val := CASE WHEN random_val < 0.90 THEN 'paid' ELSE 'pending' END;
                WHEN 'caution' THEN
                    status_val := CASE WHEN random_val < 0.60 THEN 'paid' ELSE 'pending' END;
                WHEN 'high_risk' THEN
                    status_val := CASE WHEN random_val < 0.30 THEN 'paid' ELSE 'pending' END;
                ELSE
                    status_val := 'paid';
            END CASE;
            
            INSERT INTO public.fee_records (
                student_id, fee_type, amount, due_date, status, paid_date, payment_method
            ) VALUES (
                student_record.id,
                fee_type_name,
                amount_val,
                due_date,
                status_val,
                CASE WHEN status_val = 'paid' THEN CURRENT_DATE - INTERVAL '5 days' ELSE NULL END,
                CASE WHEN status_val = 'paid' THEN 'Bank Transfer' ELSE NULL END
            );
        END LOOP;
    END LOOP;
END $$;

-- Add sample notifications
DO $$
DECLARE
    student_record RECORD;
    admin_user_id UUID;
    notification_types TEXT[] := ARRAY['attendance_alert', 'grade_update', 'fee_reminder', 'risk_assessment'];
    notif_type TEXT;
    random_val REAL;
BEGIN
    -- Get the first admin user (assuming there's at least one)
    SELECT user_id INTO admin_user_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin user found, create notifications for the first user
    IF admin_user_id IS NULL THEN
        SELECT user_id INTO admin_user_id FROM public.profiles LIMIT 1;
    END IF;
    
    -- If still no user, skip notifications
    IF admin_user_id IS NOT NULL THEN
        FOR student_record IN SELECT id, student_id, risk_level FROM public.students LIMIT 10 LOOP
            FOREACH notif_type IN ARRAY notification_types LOOP
                random_val := RANDOM();
                
                -- Create notifications more frequently for high-risk students
                IF (student_record.risk_level = 'high_risk' OR random_val < 0.3) THEN
                    INSERT INTO public.notifications (
                        recipient_id, student_id, type, title, message, priority, status
                    ) VALUES (
                        admin_user_id,
                        student_record.id,
                        notif_type,
                        CASE notif_type
                            WHEN 'attendance_alert' THEN 'Low Attendance Alert'
                            WHEN 'grade_update' THEN 'Grade Posted'
                            WHEN 'fee_reminder' THEN 'Fee Payment Due'
                            WHEN 'risk_assessment' THEN 'Risk Level Update'
                            ELSE 'General Notification'
                        END,
                        CASE notif_type
                            WHEN 'attendance_alert' THEN 'Student ' || student_record.student_id || ' has low attendance'
                            WHEN 'grade_update' THEN 'New grades posted for student ' || student_record.student_id
                            WHEN 'fee_reminder' THEN 'Fee payment reminder for student ' || student_record.student_id
                            WHEN 'risk_assessment' THEN 'Risk assessment updated for student ' || student_record.student_id
                            ELSE 'General notification for student ' || student_record.student_id
                        END,
                        CASE student_record.risk_level
                            WHEN 'high_risk' THEN 'high'::notification_priority
                            WHEN 'caution' THEN 'medium'::notification_priority
                            ELSE 'low'::notification_priority
                        END,
                        'pending'::notification_status
                    );
                END IF;
            END LOOP;
        END LOOP;
    END IF;
END $$;