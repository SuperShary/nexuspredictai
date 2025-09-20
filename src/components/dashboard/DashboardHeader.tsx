import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Bell, 
  LogOut, 
  Shield,
  Zap,
  Activity
} from "lucide-react";
import { SettingsDropdown } from "./SettingsDropdown";

interface Profile {
  id: string;
  user_id: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface DashboardHeaderProps {
  user: User;
  profile: Profile | null;
  onClearTable?: () => void;
  onResetFilters?: () => void;
  onExportData?: () => void;
}

export const DashboardHeader = ({ 
  user, 
  profile, 
  onClearTable, 
  onResetFilters, 
  onExportData 
}: DashboardHeaderProps) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'teacher': return <Brain className="w-4 h-4" />;
      case 'mentor': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'teacher': return 'secondary';
      case 'mentor': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <header className="glass-panel border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center neon-glow-cyan">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-heading holographic-text">
                Nexus Predict AI
              </h1>
              <p className="text-xs text-muted-foreground terminal-text">
                Command Center • Neural Network Active
              </p>
            </div>
          </div>

          {/* Center: Status Indicators */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-ai-success rounded-full animate-pulse"></div>
              <span className="text-sm text-ai-success terminal-text">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-primary terminal-text">AI Active</span>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative glass-panel hover:neon-glow-cyan"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-crimson-red rounded-full animate-pulse"></div>
            </Button>

            <SettingsDropdown 
              onClearTable={onClearTable}
              onResetFilters={onResetFilters}
              onExportData={onExportData}
            />

            <div className="flex items-center space-x-3 glass-panel px-3 py-2 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getRoleBadgeVariant(profile?.role || 'student')}
                    className="text-xs"
                  >
                    {getRoleIcon(profile?.role || 'student')}
                    <span className="ml-1 capitalize">{profile?.role}</span>
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="glass-panel hover:neon-glow-danger text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};