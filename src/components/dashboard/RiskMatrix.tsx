import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  risk_level: 'safe' | 'caution' | 'high_risk';
  risk_score: number;
  dropout_probability: number;
  profiles?: any;
}

interface RiskMatrixProps {
  students: Student[];
}

export const RiskMatrix = ({ students }: RiskMatrixProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <span>AI Risk Matrix</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.slice(0, 6).map((student) => (
            <div 
              key={student.id}
              className="glass-panel p-4 hover-lift"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{student.student_id}</span>
                <Badge className={`risk-${student.risk_level.replace('_', '-')}`}>
                  {student.risk_level === 'high_risk' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {student.risk_level.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-2xl font-bold terminal-text">
                {student.risk_score.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Dropout Probability: {student.dropout_probability.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};