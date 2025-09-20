import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeDataHook {
  students: any[];
  attendance: any[];
  academicPerformance: any[];
  feeRecords: any[];
  notifications: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRealTimeData = (): RealTimeDataHook => {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [academicPerformance, setAcademicPerformance] = useState<any[]>([]);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        studentsResponse,
        attendanceResponse,
        academicResponse,
        feeResponse,
        notificationsResponse
      ] = await Promise.all([
        supabase
          .from('students')
          .select(`
            *,
            profiles:user_id (
              id,
              user_id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('risk_score', { ascending: false }),
        
        supabase
          .from('attendance')
          .select('*')
          .order('date', { ascending: false })
          .limit(1000),
        
        supabase
          .from('academic_performance')
          .select('*')
          .order('test_date', { ascending: false })
          .limit(1000),
        
        supabase
          .from('fee_records')
          .select('*')
          .order('due_date', { ascending: false })
          .limit(1000),
        
        supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      // Handle errors
      if (studentsResponse.error) throw studentsResponse.error;
      if (attendanceResponse.error) throw attendanceResponse.error;
      if (academicResponse.error) throw academicResponse.error;
      if (feeResponse.error) throw feeResponse.error;
      if (notificationsResponse.error) throw notificationsResponse.error;

      // Set data
      setStudents(studentsResponse.data || []);
      setAttendance(attendanceResponse.data || []);
      setAcademicPerformance(academicResponse.data || []);
      setFeeRecords(feeResponse.data || []);
      setNotifications(notificationsResponse.data || []);

    } catch (err: any) {
      console.error('Error fetching real-time data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Set up real-time subscriptions
    const studentsChannel = supabase
      .channel('students-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          console.log('Students table changed:', payload);
          fetchAllData(); // Refetch all data when students change
        }
      )
      .subscribe();

    const attendanceChannel = supabase
      .channel('attendance-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        (payload) => {
          console.log('Attendance table changed:', payload);
          fetchAllData(); // Refetch when attendance changes
        }
      )
      .subscribe();

    const academicChannel = supabase
      .channel('academic-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'academic_performance' },
        (payload) => {
          console.log('Academic performance table changed:', payload);
          fetchAllData(); // Refetch when academic data changes
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Notifications table changed:', payload);
          // Just update notifications without full refetch
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as any, ...prev.slice(0, 99)]);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(academicChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  return {
    students,
    attendance,
    academicPerformance,
    feeRecords,
    notifications,
    loading,
    error,
    refetch: fetchAllData
  };
};