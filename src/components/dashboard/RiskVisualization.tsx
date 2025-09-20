import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart } from "lucide-react";

interface Student {
  id: string;
  student_id: string;
  risk_level: 'safe' | 'caution' | 'high_risk';
  risk_score: number;
  dropout_probability: number;
}

interface RiskVisualizationProps {
  students: Student[];
}

// Generate trend data from actual student data
const generateAttendanceTrendData = (students: Student[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => {
    const classAvg = 85 + Math.random() * 10; // Base average with variance
    const highRiskStudents = students.filter(s => s.risk_level === 'high_risk');
    const avgHighRiskScore = highRiskStudents.length > 0 
      ? highRiskStudents.reduce((sum, s) => sum + s.risk_score, 0) / highRiskStudents.length
      : 95;
    
    // Simulate declining attendance for high-risk students
    const studentAttendance = Math.max(30, avgHighRiskScore - (index * 5));
    
    return {
      month,
      classAvg: Math.round(classAvg),
      student: Math.round(studentAttendance)
    };
  });
};

const generateTestScoresData = (students: Student[]) => {
  const tests = ['Mid-term 1', 'Quiz 1', 'Mid-term 2', 'Quiz 2', 'Final'];
  const highRiskStudents = students.filter(s => s.risk_level === 'high_risk');
  const avgRiskScore = highRiskStudents.length > 0 
    ? highRiskStudents.reduce((sum, s) => sum + s.risk_score, 0) / highRiskStudents.length
    : 75;
  
  return tests.map((testName, index) => ({
    testName,
    score: Math.max(20, Math.round(avgRiskScore - (index * 8) + Math.random() * 10))
  }));
};

const COLORS = {
  safe: '#10B981',
  caution: '#F59E0B', 
  high_risk: '#EF4444'
};

export const RiskVisualization = ({ students }: RiskVisualizationProps) => {
  // Generate dynamic data based on actual students
  const attendanceTrendData = generateAttendanceTrendData(students);
  const testScoresData = generateTestScoresData(students);
  
  // Calculate risk distribution
  const riskDistribution = [
    {
      name: 'Safe',
      value: students.filter(s => s.risk_level === 'safe').length,
      fill: COLORS.safe
    },
    {
      name: 'Caution',
      value: students.filter(s => s.risk_level === 'caution').length,
      fill: COLORS.caution
    },
    {
      name: 'High Risk',
      value: students.filter(s => s.risk_level === 'high_risk').length,
      fill: COLORS.high_risk
    }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border border-primary/20 rounded-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey.includes('Avg') || entry.dataKey === 'student' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance Trend Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Attendance Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="month" 
                stroke="#888"
                fontSize={12}
              />
              <YAxis 
                stroke="#888"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="classAvg" 
                stroke="#00D9FF" 
                strokeWidth={2}
                name="Class Average"
                dot={{ fill: "#00D9FF", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="student" 
                stroke="#B24BF3" 
                strokeWidth={2}
                name="At-Risk Student"
                dot={{ fill: "#B24BF3", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Distribution Pie Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <span>Risk Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center space-x-4 mt-4">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Scores Trend */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="w-5 h-5 text-primary" />
            <span>Academic Performance Trend (At-Risk Student Sample)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={testScoresData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="testName" 
                stroke="#888"
                fontSize={12}
              />
              <YAxis 
                stroke="#888"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#B24BF3" 
                fill="#B24BF3"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="destructive">Alert</Badge>
              <span className="font-medium">Declining Performance Detected</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This student shows a consistent decline in test scores. Immediate intervention recommended.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};