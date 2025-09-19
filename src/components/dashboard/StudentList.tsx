import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  risk_level: 'safe' | 'caution' | 'high_risk';
  risk_score: number;
  grade_level: string;
  section: string;
  profiles?: any;
}

interface StudentListProps {
  students: Student[];
}

export const StudentList = ({ students }: StudentListProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <span>Student Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {students.slice(0, 8).map((student) => (
            <div key={student.id} className="glass-panel p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {student.student_id.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{student.student_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {student.grade_level} • Section {student.section}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`risk-${student.risk_level.replace('_', '-')}`}>
                  {student.risk_level.replace('_', ' ')}
                </Badge>
                <div className="text-sm terminal-text">
                  {student.risk_score.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};