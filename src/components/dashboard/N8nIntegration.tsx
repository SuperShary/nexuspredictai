import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Workflow,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Database,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock workflow data - in real app, this would come from n8n API
const mockWorkflows = [
  {
    id: "1",
    name: "Data Sync",
    status: "active",
    lastRun: "2 mins ago",
    schedule: "Every 6 hours",
    description: "Syncs student data from Google Sheets",
    progress: null
  },
  {
    id: "2", 
    name: "Risk Calculator",
    status: "running",
    lastRun: "Running now",
    schedule: "On data change",
    description: "Calculates student risk scores using AI",
    progress: 67
  },
  {
    id: "3",
    name: "Alert Sender",
    status: "scheduled",
    lastRun: "1 hour ago",
    schedule: "Friday 6 PM",
    description: "Sends WhatsApp alerts to mentors",
    progress: null
  }
];

const mockDataSources = [
  {
    id: "1",
    type: "Google Sheets",
    name: "Attendance Master",
    url: "https://sheets.google.com/...",
    lastSync: "10 mins ago",
    status: "connected",
    records: 1247
  },
  {
    id: "2",
    type: "Excel",
    name: "Test Scores Q3",
    file: "scores_2025.xlsx",
    lastSync: "1 hour ago", 
    status: "connected",
    records: 825
  },
  {
    id: "3",
    type: "Google Sheets",
    name: "Fee Records",
    url: "https://sheets.google.com/...",
    lastSync: "30 mins ago",
    status: "syncing",
    records: 456
  }
];

export const N8nIntegration = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'running':
      case 'syncing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const handleTriggerSync = async () => {
    setIsTriggering(true);
    
    try {
      // Call the actual n8n webhook sync function
      const response = await fetch('https://zcinbxtkdydrkyflpiui.supabase.co/functions/v1/n8n-webhook-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaW5ieHRrZHlkcmt5ZmxwaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzE4ODIsImV4cCI6MjA3MzQwNzg4Mn0.o0-LT81lQmFmSLV95RtDsYUtZbIBo4y-CPQr548iadU`
        },
        body: JSON.stringify({
          trigger: 'manual',
          timestamp: new Date().toISOString(),
          source: 'dashboard'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Sync Triggered!",
          description: `Data sync completed: ${result.summary?.studentsUpdated || 0} students, ${result.summary?.attendanceRecordsUpdated || 0} attendance records, ${result.summary?.academicRecordsUpdated || 0} academic records updated.`,
          className: "neon-glow-cyan",
        });
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Could not trigger n8n workflows. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const handleWebhookTrigger = async () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter a valid n8n webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsTriggering(true);
    
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: "ai_dashboard",
          action: "manual_sync"
        }),
      });

      toast({
        title: "Webhook Triggered!",
        description: "n8n webhook has been called successfully.",
        className: "neon-glow-cyan",
      });
    } catch (error) {
      toast({
        title: "Webhook Failed",
        description: "Could not trigger the webhook.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Status Panel */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="w-5 h-5 text-primary" />
            <span>n8n Workflow Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockWorkflows.map((workflow) => (
            <div key={workflow.id} className="glass-panel p-4 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.toUpperCase()}
                </Badge>
              </div>
              
              {workflow.progress && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Last run: {workflow.lastRun}</span>
                <span>Schedule: {workflow.schedule}</span>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={handleTriggerSync}
            disabled={isTriggering}
            className="w-full trigger-sync-btn gradient-primary hover:scale-105 transition-transform"
          >
            {isTriggering ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isTriggering ? "Syncing..." : "🔄 Sync Now"}
          </Button>
        </CardContent>
      </Card>

      {/* Data Source Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Connected Data Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockDataSources.map((source) => (
            <div key={source.id} className="glass-panel p-4 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {source.type === "Google Sheets" ? (
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  )}
                  <div>
                    <h4 className="font-medium flex items-center space-x-2">
                      <span>{source.name}</span>
                      {source.url && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {source.type} • {source.records} records
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(source.status)}>
                  {source.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Last sync: {source.lastSync}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            <span>Manual Webhook Trigger</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">n8n Webhook URL</Label>
          <Input
            id="webhook-url"
            placeholder="https://n8n.srv872880.hstgr.cloud/webhook-test/incomingdata"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="glass-panel border-primary/20"
          />
          </div>
          
          <Button 
            onClick={handleWebhookTrigger}
            disabled={isTriggering || !webhookUrl}
            className="w-full gradient-success hover:scale-105 transition-transform"
          >
            {isTriggering ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Trigger Webhook
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Use this to manually trigger your n8n workflows for testing or immediate data processing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};