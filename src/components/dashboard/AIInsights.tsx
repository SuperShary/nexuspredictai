import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, TrendingUp } from "lucide-react";

interface Student {
  risk_level: 'safe' | 'caution' | 'high_risk';
}

interface AIInsightsProps {
  students: Student[];
}

export const AIInsights = ({ students }: AIInsightsProps) => {
  const insights = [
    {
      icon: Brain,
      title: "Predictive Analysis",
      description: "AI identifies 3 students requiring immediate intervention",
      priority: "high"
    },
    {
      icon: TrendingUp,
      title: "Trend Detection", 
      description: "Attendance patterns suggest improving engagement",
      priority: "medium"
    },
    {
      icon: Zap,
      title: "Intervention Suggestion",
      description: "Personalized mentoring recommended for 5 students",
      priority: "low"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-accent" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="glass-panel p-3 space-y-2">
            <div className="flex items-center space-x-2">
              <insight.icon className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{insight.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {insight.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};