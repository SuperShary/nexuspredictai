-- Enable realtime for students table
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Add students table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE academic_performance;
ALTER PUBLICATION supabase_realtime ADD TABLE fee_records;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Set replica identity for real-time updates
ALTER TABLE students REPLICA IDENTITY FULL;
ALTER TABLE attendance REPLICA IDENTITY FULL;
ALTER TABLE academic_performance REPLICA IDENTITY FULL;
ALTER TABLE fee_records REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;