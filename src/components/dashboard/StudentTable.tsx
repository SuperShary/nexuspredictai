import { useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  student_id: string;
  grade_level: string;
  section: string;
  risk_level: 'safe' | 'caution' | 'high_risk';
  risk_score: number;
  dropout_probability: number;
  profiles?: any;
}

interface StudentTableProps {
  students: Student[];
}

interface StudentTableRef {
  resetFilters: () => void;
  exportData: () => void;
}

export const StudentTable = forwardRef<StudentTableRef, StudentTableProps>(({ students }, ref) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    resetFilters: () => {
      setSearchTerm("");
      setGradeFilter("all");
      setRiskFilter("all");
    },
    exportData: handleExportCSV
  }));

  // Mock data for attendance and scores (would come from database)
  const getStudentStats = (studentId: string) => {
    const attendance = Math.floor(Math.random() * 40) + 60; // 60-100%
    const avgScore = Math.floor(Math.random() * 60) + 40; // 40-100
    const feeStatus = Math.random() > 0.3 ? 'Paid' : 'Pending';
    return { attendance, avgScore, feeStatus };
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === "all" || student.grade_level === gradeFilter;
      const matchesRisk = riskFilter === "all" || student.risk_level === riskFilter;
      
      return matchesSearch && matchesGrade && matchesRisk;
    });
  }, [students, searchTerm, gradeFilter, riskFilter]);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high_risk':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredStudents.map(student => {
      const stats = getStudentStats(student.student_id);
      return {
        'Student ID': student.student_id,
        'Grade': student.grade_level,
        'Section': student.section,
        'Attendance %': stats.attendance,
        'Avg Score': stats.avgScore,
        'Fee Status': stats.feeStatus,
        'Risk Level': student.risk_level.replace('_', ' ').toUpperCase(),
        'Risk Score': student.risk_score.toFixed(1),
        'Dropout Probability': student.dropout_probability.toFixed(1)
      };
    });

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-risk-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete!",
      description: "Student data has been exported to CSV.",
      className: "neon-glow-success",
    });
  };

  const handleSendAlert = (studentId: string) => {
    // This would trigger n8n webhook
    toast({
      title: "Alert Sent!",
      description: `Intervention alert sent for student ${studentId}`,
      className: "neon-glow-cyan",
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Student Risk Assessment</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={handleExportCSV}
              variant="outline" 
              size="sm"
              className="glass-panel hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-panel border-primary/20"
            />
          </div>
          
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-full sm:w-32 glass-panel border-primary/20">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent className="glass-panel">
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="9th">9th</SelectItem>
              <SelectItem value="10th">10th</SelectItem>
              <SelectItem value="11th">11th</SelectItem>
              <SelectItem value="12th">12th</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-36 glass-panel border-primary/20">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="glass-panel">
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="caution">Caution</SelectItem>
              <SelectItem value="high_risk">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-7 gap-4 p-4 bg-primary/5 rounded-t-lg border border-primary/20">
              <div className="font-semibold text-sm">Student</div>
              <div className="font-semibold text-sm text-center">Attend %</div>
              <div className="font-semibold text-sm text-center">Avg Score</div>
              <div className="font-semibold text-sm text-center">Fee Status</div>
              <div className="font-semibold text-sm text-center">Risk Level</div>
              <div className="font-semibold text-sm text-center">Risk Score</div>
              <div className="font-semibold text-sm text-center">Actions</div>
            </div>
            
            {/* Rows */}
            <div className="space-y-1">
              {filteredStudents.map((student, index) => {
                const stats = getStudentStats(student.student_id);
                const isHighRisk = student.risk_level === 'high_risk';
                
                return (
                  <div 
                    key={student.id}
                    className={`grid grid-cols-7 gap-4 p-4 glass-panel hover-lift transition-all duration-200 ${
                      isHighRisk ? 'border-red-500/30 bg-red-500/5' : 'border-primary/10'
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-primary text-white text-xs">
                          {student.student_id.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{student.student_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.grade_level} • {student.section}
                        </div>
                      </div>
                    </div>
                    
                    {/* Attendance */}
                    <div className="text-center">
                      <div className={`font-bold ${stats.attendance < 75 ? 'text-red-400' : 'text-green-400'}`}>
                        {stats.attendance}%
                      </div>
                    </div>
                    
                    {/* Average Score */}
                    <div className="text-center">
                      <div className={`font-bold ${stats.avgScore < 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {stats.avgScore}
                      </div>
                    </div>
                    
                    {/* Fee Status */}
                    <div className="text-center">
                      <Badge variant={stats.feeStatus === 'Paid' ? 'default' : 'destructive'}>
                        {stats.feeStatus}
                      </Badge>
                    </div>
                    
                    {/* Risk Level */}
                    <div className="flex items-center justify-center space-x-1">
                      {getRiskIcon(student.risk_level)}
                      <Badge className={`risk-${student.risk_level.replace('_', '-')}`}>
                        {student.risk_level.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    {/* Risk Score */}
                    <div className="text-center">
                      <div className="font-bold terminal-text text-primary">
                        {student.risk_score.toFixed(1)}%
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="text-center">
                      {isHighRisk && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendAlert(student.student_id)}
                          className="text-xs hover:bg-primary/10"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Alert
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No students found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

StudentTable.displayName = "StudentTable";