// Core risk calculation algorithm for student dropout prediction

export interface RiskFactors {
  attendance: {
    weight: number;
    value: number;
    threshold: { high: number; medium: number; safe: number };
  };
  academics: {
    weight: number;
    value: number;
    threshold: { high: number; medium: number; safe: number };
  };
  fees: {
    weight: number;
    value: number;
    threshold: { high: number; medium: number; safe: number };
  };
  attempts: {
    weight: number;
    value: number;
    threshold: { high: number; medium: number; safe: number };
  };
}

export interface RiskResult {
  score: number;
  level: 'HIGH' | 'MEDIUM' | 'SAFE';
  breakdown: Record<string, number>;
  recommendation: string;
}

export interface StudentData {
  attendance: number;
  avgScore: number;
  feeStatus: 'paid' | 'pending' | 'overdue';
  failedAttempts: number;
}

export const calculateStudentRisk = (student: StudentData): RiskResult => {
  const riskFactors: RiskFactors = {
    attendance: {
      weight: 0.35,
      value: student.attendance,
      threshold: { high: 60, medium: 75, safe: 85 }
    },
    academics: {
      weight: 0.30,
      value: student.avgScore,
      threshold: { high: 40, medium: 55, safe: 65 }
    },
    fees: {
      weight: 0.20,
      value: student.feeStatus === 'paid' ? 100 : student.feeStatus === 'pending' ? 50 : 0,
      threshold: { high: 0, medium: 50, safe: 100 }
    },
    attempts: {
      weight: 0.15,
      value: Math.max(0, 100 - (student.failedAttempts * 20)),
      threshold: { high: 40, medium: 60, safe: 80 }
    }
  };

  // Calculate weighted score
  let totalScore = 0;
  let breakdown: Record<string, number> = {};
  
  Object.keys(riskFactors).forEach(factor => {
    const f = riskFactors[factor as keyof RiskFactors];
    const score = (f.value / 100) * f.weight * 100;
    totalScore += score;
    breakdown[factor] = score;
  });

  // Determine risk level
  let riskLevel: 'HIGH' | 'MEDIUM' | 'SAFE';
  if (totalScore < 45) {
    riskLevel = 'HIGH';
  } else if (totalScore < 65) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'SAFE';
  }

  return {
    score: totalScore,
    level: riskLevel,
    breakdown,
    recommendation: generateRecommendation(riskLevel, breakdown)
  };
};

const generateRecommendation = (riskLevel: string, breakdown: Record<string, number>): string => {
  const lowestFactor = Object.entries(breakdown).reduce((min, [key, value]) => 
    value < min.value ? { key, value } : min, 
    { key: '', value: Infinity }
  );

  switch (riskLevel) {
    case 'HIGH':
      return `URGENT: Immediate intervention required. Primary concern: ${getFactorName(lowestFactor.key)}. Schedule counseling session and parent meeting within 48 hours.`;
    
    case 'MEDIUM':
      return `ATTENTION NEEDED: Monitor closely and provide targeted support for ${getFactorName(lowestFactor.key)}. Consider mentorship program.`;
    
    case 'SAFE':
      return `GOOD STANDING: Student is performing well. Continue regular monitoring and positive reinforcement.`;
    
    default:
      return 'Assessment needed.';
  }
};

const getFactorName = (factor: string): string => {
  const factorNames: Record<string, string> = {
    attendance: 'poor attendance',
    academics: 'academic performance',
    fees: 'fee payment issues',
    attempts: 'repeated failures'
  };
  
  return factorNames[factor] || factor;
};

// Batch risk calculation for multiple students
export const calculateBatchRisk = (students: StudentData[]): RiskResult[] => {
  return students.map(student => calculateStudentRisk(student));
};

// Risk trend analysis
export const analyzeRiskTrend = (historicalScores: number[]): 'improving' | 'declining' | 'stable' => {
  if (historicalScores.length < 2) return 'stable';
  
  const recent = historicalScores.slice(-3);
  const earlier = historicalScores.slice(0, -3);
  
  if (recent.length === 0 || earlier.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  
  const difference = recentAvg - earlierAvg;
  
  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
};

// Export functions for n8n webhook integration
export const prepareRiskDataForWebhook = (students: StudentData[]): any => {
  const results = calculateBatchRisk(students);
  
  return {
    timestamp: new Date().toISOString(),
    total_students: students.length,
    risk_summary: {
      high_risk: results.filter(r => r.level === 'HIGH').length,
      medium_risk: results.filter(r => r.level === 'MEDIUM').length,
      safe: results.filter(r => r.level === 'SAFE').length
    },
    at_risk_students: results
      .filter(r => r.level === 'HIGH' || r.level === 'MEDIUM')
      .map((result, index) => ({
        student_index: index,
        risk_score: result.score,
        risk_level: result.level,
        recommendation: result.recommendation,
        breakdown: result.breakdown
      }))
  };
};