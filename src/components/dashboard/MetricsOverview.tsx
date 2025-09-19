import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  Brain,
  Zap
} from "lucide-react";

interface Student {
  id: string;
  risk_level: 'safe' | 'caution' | 'high_risk';
  risk_score: number;
  dropout_probability: number;
}

interface MetricsOverviewProps {
  students: Student[];
}

export const MetricsOverview = ({ students }: MetricsOverviewProps) => {
  const totalStudents = students.length;
  const highRiskCount = students.filter(s => s.risk_level === 'high_risk').length;
  const cautionCount = students.filter(s => s.risk_level === 'caution').length;
  const safeCount = students.filter(s => s.risk_level === 'safe').length;
  
  const avgRiskScore = students.length > 0 
    ? students.reduce((sum, s) => sum + s.risk_score, 0) / students.length 
    : 0;
    
  const avgDropoutProb = students.length > 0 
    ? students.reduce((sum, s) => sum + s.dropout_probability, 0) / students.length 
    : 0;

  const metrics = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      change: "+12 this month",
      icon: Users,
      gradient: "gradient-primary",
      glow: "neon-glow-cyan"
    },
    {
      title: "High Risk",
      value: highRiskCount.toString(),
      change: `${((highRiskCount / totalStudents) * 100).toFixed(1)}% of total`,
      icon: AlertTriangle,
      gradient: "gradient-danger",
      glow: "neon-glow-danger"
    },
    {
      title: "Average Risk Score",
      value: `${avgRiskScore.toFixed(1)}%`,
      change: avgRiskScore > 50 ? "Above threshold" : "Within limits",
      icon: Brain,
      gradient: avgRiskScore > 50 ? "gradient-danger" : "gradient-success",
      glow: avgRiskScore > 50 ? "neon-glow-danger" : "neon-glow-success"
    },
    {
      title: "Intervention Success",
      value: "87.3%",
      change: "+5.2% this quarter",
      icon: TrendingUp,
      gradient: "gradient-success",
      glow: "neon-glow-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className={`glass-card hover-lift ${metric.glow} transition-all duration-300`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`w-10 h-10 ${metric.gradient} rounded-lg flex items-center justify-center`}>
              <metric.icon className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold terminal-text text-foreground">
                {metric.value}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
      
      {/* Risk Distribution Card */}
      <Card className="glass-card hover-lift md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Risk Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-ai-success terminal-text">
                {safeCount}
              </div>
              <Badge className="risk-safe">
                <Shield className="w-3 h-3 mr-1" />
                Safe
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-ai-warning terminal-text">
                {cautionCount}
              </div>
              <Badge className="risk-caution">
                <Zap className="w-3 h-3 mr-1" />
                Caution
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-ai-danger terminal-text">
                {highRiskCount}
              </div>
              <Badge className="risk-high">
                <AlertTriangle className="w-3 h-3 mr-1" />
                High Risk
              </Badge>
            </div>
          </div>
          
          {/* Progress bars */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-full bg-space-medium rounded-full h-2 overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-ai-success" 
                    style={{ width: `${(safeCount / totalStudents) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-ai-warning" 
                    style={{ width: `${(cautionCount / totalStudents) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-ai-danger" 
                    style={{ width: `${(highRiskCount / totalStudents) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};