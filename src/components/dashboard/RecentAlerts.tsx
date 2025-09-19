import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Clock } from "lucide-react";

export const RecentAlerts = () => {
  const alerts = [
    {
      id: 1,
      title: "High Risk Student Detected",
      description: "STU002 shows significant decline",
      time: "2 min ago",
      priority: "critical"
    },
    {
      id: 2,
      title: "Attendance Pattern Alert", 
      description: "3 students absent for 2+ days",
      time: "15 min ago",
      priority: "high"
    },
    {
      id: 3,
      title: "Fee Payment Overdue",
      description: "5 students have pending payments",
      time: "1 hour ago", 
      priority: "medium"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <span>Recent Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="glass-panel p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={alert.priority === 'critical' ? 'destructive' : 'outline'}>
                {alert.priority === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {alert.priority}
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{alert.time}</span>
              </div>
            </div>
            <div>
              <div className="font-medium text-sm">{alert.title}</div>
              <div className="text-xs text-muted-foreground">{alert.description}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};