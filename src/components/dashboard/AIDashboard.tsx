import { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsOverview } from "./MetricsOverview";
import { StudentTable } from "./StudentTable";
import { N8nIntegration } from "./N8nIntegration";
import { RiskVisualization } from "./RiskVisualization";
import { NotificationManager } from "./NotificationManager";
import { AIInsights } from "./AIInsights";
import { LiveDataIndicator } from "./LiveDataIndicator";

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
  const { students, loading: dataLoading, error: dataError } = useRealTimeData();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const studentTableRef = useRef<{ resetFilters: () => void; exportData: () => void } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id]);

  // Settings callback functions
  const handleClearTable = async () => {
    try {
      // Clear all student data from the database
      const { error } = await supabase
        .from('students')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        throw error;
      }

      toast({
        title: "Table Cleared",
        description: "All student data has been cleared from the database.",
        className: "neon-glow-success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear table data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetFilters = () => {
    if (studentTableRef.current?.resetFilters) {
      studentTableRef.current.resetFilters();
    }
  };

  const handleExportData = () => {
    if (studentTableRef.current?.exportData) {
      studentTableRef.current.exportData();
    }
  };

  if (loading || dataLoading) {
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
      <DashboardHeader 
        user={user} 
        profile={profile}
        onClearTable={handleClearTable}
        onResetFilters={handleResetFilters}
        onExportData={handleExportData}
      />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Top Section - Overview Stats */}
        <MetricsOverview students={students} />
        
        {/* Main Section - Student Table */}
        <StudentTable ref={studentTableRef} students={students} />
        
        {/* Grid Layout for Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Visualization */}
          <div className="lg:col-span-2 space-y-8">
            <RiskVisualization students={students} />
          </div>
          
          {/* Right Sidebar - n8n Integration & Notifications */}
          <div className="space-y-8">
            <LiveDataIndicator />
            <AIInsights students={students} />
            <N8nIntegration />
            <NotificationManager />
          </div>
        </div>
      </main>
    </div>
  );
};