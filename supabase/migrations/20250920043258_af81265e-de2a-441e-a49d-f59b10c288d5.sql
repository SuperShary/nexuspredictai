-- Add attendance records for all students (last 30 days)
DO $$
DECLARE
    student_record RECORD;
    current_date DATE;
    days_back INTEGER;
    attendance_status TEXT;
    random_val REAL;
BEGIN
    -- For each student, create attendance records for the last 30 days
    FOR student_record IN SELECT id, student_id, risk_level FROM public.students LOOP
        FOR days_back IN 0..29 LOOP
            current_date := CURRENT_DATE - days_back;
            
            -- Skip weekends
            IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
                -- Generate attendance based on risk level
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
                
                INSERT INTO public.attendance (
                    student_id, 
                    date, 
                    status, 
                    check_in_time, 
                    check_out_time,
                    remarks
                ) VALUES (
                    student_record.id,
                    current_date,
                    attendance_status::attendance_status,
                    CASE WHEN attendance_status = 'present' THEN '08:00:00'::TIME ELSE NULL END,
                    CASE WHEN attendance_status = 'present' THEN '15:30:00'::TIME ELSE NULL END,
                    CASE WHEN attendance_status = 'absent' THEN 'Unexcused absence' ELSE 'Regular attendance' END
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;