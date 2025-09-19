import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsOverview } from "./MetricsOverview";
import { RiskMatrix } from "./RiskMatrix";
import { AIInsights } from "./AIInsights";
import { RecentAlerts } from "./RecentAlerts";
import { StudentList } from "./StudentList";

interface Profile {
  id: string;
  user_id: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface Student {
  id: string;
  student_id: string;
  enrollment_date: string;
  grade_level: string;
  section: string;
  risk_level: 'safe' | 'caution' | 'high_risk';
  risk_score: number;
  dropout_probability: number;
  profiles?: any;
}

interface AIDashboardProps {
  user: User;
}

export const AIDashboard = ({ user }: AIDashboardProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch students data
        const { data: studentsData } = await supabase
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
          .order('risk_score', { ascending: false });

        if (studentsData) {
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground terminal-text">Loading AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Metrics Overview */}
        <MetricsOverview students={students} />
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <RiskMatrix students={students} />
            <StudentList students={students} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <AIInsights students={students} />
            <RecentAlerts />
          </div>
        </div>
      </main>
    </div>
  );
};