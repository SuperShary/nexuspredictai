import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Clock, Zap } from "lucide-react";
import { useRealTimeData } from "@/hooks/useRealTimeData";

export const LiveDataIndicator = () => {
  const { loading, error, students } = useRealTimeData();
  
  const lastUpdate = new Date().toLocaleTimeString();
  
  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Live Data Status</span>
          </span>
          {loading ? (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Syncing
            </Badge>
          ) : error ? (
            <Badge variant="destructive">
              Error
            </Badge>
          ) : (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Students tracked:</span>
          <span className="terminal-text text-foreground font-bold">{students.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last update:</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{lastUpdate}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Auto-sync:</span>
          <span className="text-primary font-medium">Every 2 hours</span>
        </div>
      </CardContent>
    </Card>
  );
};