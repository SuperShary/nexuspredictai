import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSchedule {
  frequency: 'daily' | 'weekly' | 'on_risk_change';
  day: string;
  time: string;
  channels: string[];
}

interface AlertItem {
  id: string;
  student: string;
  recipient: string;
  time: string;
  status: 'delivered' | 'pending' | 'failed';
  channel: 'email' | 'whatsapp' | 'sms';
}

const mockRecentAlerts: AlertItem[] = [
  {
    id: '1',
    student: 'Rahul Sharma (2025001)',
    recipient: 'Parent: +91-98765xxxxx',
    time: '2 hours ago',
    status: 'delivered',
    channel: 'whatsapp'
  },
  {
    id: '2',
    student: 'Neha Gupta (2025003)',
    recipient: 'Mentor: teacher@school.edu',
    time: '4 hours ago',
    status: 'delivered',
    channel: 'email'
  },
  {
    id: '3',
    student: 'Aarav Kumar (2025004)',
    recipient: 'Parent: +91-98765yyyyy',
    time: '6 hours ago',
    status: 'pending',
    channel: 'sms'
  },
];

export const NotificationManager = () => {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<NotificationSchedule>({
    frequency: 'weekly',
    day: 'Friday',
    time: '18:00',
    channels: ['email', 'whatsapp']
  });

  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'sms':
        return <Phone className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const sendManualAlert = async (studentId?: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to n8n webhook
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would trigger n8n webhook
      const webhookData = {
        type: 'manual_alert',
        timestamp: new Date().toISOString(),
        studentId: studentId || 'all_at_risk',
        channels: schedule.channels
      };

      toast({
        title: "Alerts Sent Successfully!",
        description: `Manual alerts have been triggered for ${studentId ? 'student ' + studentId : 'all at-risk students'}.`,
        className: "neon-glow-success",
      });
    } catch (error) {
      toast({
        title: "Alert Failed",
        description: "Could not send alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveScheduleSettings = () => {
    // In real app, this would save to database
    toast({
      title: "Settings Saved!",
      description: "Notification schedule has been updated.",
      className: "neon-glow-cyan",
    });
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>📬 Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Auto-send alerts</Label>
              <Select 
                value={schedule.frequency} 
                onValueChange={(value: any) => setSchedule({...schedule, frequency: value})}
              >
                <SelectTrigger className="glass-panel border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="on_risk_change">When risk changes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {schedule.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Day of week</Label>
                <Select 
                  value={schedule.day} 
                  onValueChange={(value) => setSchedule({...schedule, day: value})}
                >
                  <SelectTrigger className="glass-panel border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel">
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preferred Channels</Label>
            <div className="flex space-x-2">
              {['email', 'whatsapp', 'sms'].map((channel) => (
                <Button
                  key={channel}
                  size="sm"
                  variant={schedule.channels.includes(channel) ? "default" : "outline"}
                  onClick={() => {
                    const newChannels = schedule.channels.includes(channel)
                      ? schedule.channels.filter(c => c !== channel)
                      : [...schedule.channels, channel];
                    setSchedule({...schedule, channels: newChannels});
                  }}
                  className="glass-panel"
                >
                  {getChannelIcon(channel)}
                  <span className="ml-2 capitalize">{channel}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={saveScheduleSettings}
            className="w-full gradient-primary hover:scale-105 transition-transform"
          >
            <Settings className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Manual Alert Trigger */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-primary" />
            <span>Manual Alert Trigger</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send immediate alerts to mentors and parents of at-risk students.
          </p>
          
          <Button 
            onClick={() => sendManualAlert()}
            disabled={isLoading}
            className="w-full send-all-btn gradient-danger hover:scale-105 transition-transform"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>📤 Send Alerts to All At-Risk Mentors Now</span>
              </div>
            )}
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            This will trigger n8n workflows to send notifications via selected channels
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>Recent Alerts Sent</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentAlerts.map((alert) => (
              <div key={alert.id} className="recent-alerts glass-panel p-3 hover-lift">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getChannelIcon(alert.channel)}
                    <div>
                      <p className="font-medium text-sm">{alert.student}</p>
                      <p className="text-xs text-muted-foreground">{alert.recipient}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    <Badge 
                      variant={alert.status === 'delivered' ? 'default' : 
                              alert.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};