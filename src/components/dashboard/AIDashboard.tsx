import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsOverview } from "./MetricsOverview";
import { StudentTable } from "./StudentTable";
import { N8nIntegration } from "./N8nIntegration";
import { RiskVisualization } from "./RiskVisualization";
import { NotificationManager } from "./NotificationManager";
import { AIInsights } from "./AIInsights";

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
        {/* Top Section - Overview Stats */}
        <MetricsOverview students={students} />
        
        {/* Main Section - Student Table */}
        <StudentTable students={students} />
        
        {/* Grid Layout for Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Visualization */}
          <div className="space-y-8">
            <RiskVisualization students={students} />
          </div>
          
          {/* n8n Integration & Notifications */}
          <div className="space-y-8">
            <AIInsights students={students} />
            <N8nIntegration />
            <NotificationManager />
          </div>
        </div>
      </main>
    </div>
  );
};