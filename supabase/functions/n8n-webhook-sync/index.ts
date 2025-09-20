import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Risk calculation logic (copied from utils to avoid import issues)
interface StudentData {
  attendance: number;
  averageScore: number;
  feeStatus: 'paid' | 'unpaid';
  failedAttempts: number;
}

interface RiskResult {
  score: number;
  level: 'safe' | 'caution' | 'high_risk';
  breakdown: Record<string, number>;
  recommendation: string;
}

const calculateStudentRisk = (student: StudentData): RiskResult => {
  const riskFactors = {
    attendance: {
      weight: 0.35,
      value: student.attendance,
      threshold: { high: 60, medium: 75, safe: 85 }
    },
    academics: {
      weight: 0.30,
      value: student.averageScore,
      threshold: { high: 40, medium: 55, safe: 65 }
    },
    fees: {
      weight: 0.20,
      value: student.feeStatus === 'paid' ? 100 : 0,
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
    const f = riskFactors[factor as keyof typeof riskFactors];
    const score = (f.value / 100) * f.weight * 100;
    totalScore += score;
    breakdown[factor] = score;
  });

  // Determine risk level
  let riskLevel: 'safe' | 'caution' | 'high_risk';
  if (totalScore < 45) {
    riskLevel = 'high_risk';
  } else if (totalScore < 65) {
    riskLevel = 'caution';
  } else {
    riskLevel = 'safe';
  }

  const generateRecommendation = (level: string): string => {
    switch (level) {
      case 'high_risk':
        return 'URGENT: Immediate intervention required. Schedule counseling session and parent meeting within 48 hours.';
      case 'caution':
        return 'ATTENTION NEEDED: Monitor closely and provide targeted support. Consider mentorship program.';
      case 'safe':
        return 'GOOD STANDING: Student is performing well. Continue regular monitoring.';
      default:
        return 'Assessment needed.';
    }
  };

  return {
    score: totalScore,
    level: riskLevel,
    breakdown,
    recommendation: generateRecommendation(riskLevel)
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting automated n8n webhook sync...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Your n8n webhook URL
    const webhookUrl = 'https://n8n.srv872880.hstgr.cloud/webhook-test/incomingdata';
    
    console.log('Calling n8n webhook:', webhookUrl);
    
    // Call the n8n webhook to get fresh data
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'automated_sync',
        timestamp: new Date().toISOString(),
        source: 'supabase_cron',
        request_data: true
      })
    });

    console.log('Webhook response status:', webhookResponse.status);
    console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook call failed: ${webhookResponse.status} ${webhookResponse.statusText} - ${errorText}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Received data from n8n webhook:', webhookData);

    // Process different types of data from webhook
    let studentsUpdated = 0;
    let attendanceRecordsUpdated = 0;
    let academicRecordsUpdated = 0;
    let feeRecordsUpdated = 0;

    // Process students data if present
    if (webhookData.students && Array.isArray(webhookData.students)) {
      console.log(`Processing ${webhookData.students.length} student records`);
      
      for (const studentData of webhookData.students) {
        // Upsert student data
        const { error: studentError } = await supabase
          .from('students')
          .upsert({
            student_id: studentData.student_id,
            grade_level: studentData.grade_level,
            section: studentData.section,
            enrollment_date: studentData.enrollment_date || new Date().toISOString().split('T')[0],
            risk_score: studentData.risk_score || 0,
            risk_level: studentData.risk_level || 'safe',
            dropout_probability: studentData.dropout_probability || 0,
            last_risk_calculation: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'student_id'
          });

        if (studentError) {
          console.error('Error upserting student:', studentError);
        } else {
          studentsUpdated++;
        }
      }
    }

    // Process attendance data if present
    if (webhookData.attendance && Array.isArray(webhookData.attendance)) {
      console.log(`Processing ${webhookData.attendance.length} attendance records`);
      
      for (const attendanceData of webhookData.attendance) {
        // Find student by student_id
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', attendanceData.student_id)
          .single();

        if (student) {
          const { error: attendanceError } = await supabase
            .from('attendance')
            .upsert({
              student_id: student.id,
              date: attendanceData.date,
              status: attendanceData.status || 'present',
              check_in_time: attendanceData.check_in_time,
              check_out_time: attendanceData.check_out_time,
              remarks: attendanceData.remarks,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'student_id,date'
            });

          if (attendanceError) {
            console.error('Error upserting attendance:', attendanceError);
          } else {
            attendanceRecordsUpdated++;
          }
        }
      }
    }

    // Process academic performance data if present
    if (webhookData.academic_performance && Array.isArray(webhookData.academic_performance)) {
      console.log(`Processing ${webhookData.academic_performance.length} academic records`);
      
      for (const academicData of webhookData.academic_performance) {
        // Find student by student_id
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', academicData.student_id)
          .single();

        if (student) {
          const { error: academicError } = await supabase
            .from('academic_performance')
            .insert({
              student_id: student.id,
              subject: academicData.subject,
              test_type: academicData.test_type,
              test_date: academicData.test_date,
              score: academicData.score,
              max_score: academicData.max_score,
              percentage: academicData.percentage || (academicData.score / academicData.max_score) * 100,
              grade: academicData.grade,
              created_at: new Date().toISOString()
            });

          if (academicError) {
            console.error('Error inserting academic performance:', academicError);
          } else {
            academicRecordsUpdated++;
          }
        }
      }
    }

    // Process fee records data if present
    if (webhookData.fee_records && Array.isArray(webhookData.fee_records)) {
      console.log(`Processing ${webhookData.fee_records.length} fee records`);
      
      for (const feeData of webhookData.fee_records) {
        // Find student by student_id
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', feeData.student_id)
          .single();

        if (student) {
          const { error: feeError } = await supabase
            .from('fee_records')
            .upsert({
              student_id: student.id,
              fee_type: feeData.fee_type,
              amount: feeData.amount,
              due_date: feeData.due_date,
              status: feeData.status || 'pending',
              paid_date: feeData.paid_date,
              payment_method: feeData.payment_method,
              transaction_id: feeData.transaction_id,
              remarks: feeData.remarks,
              late_fee: feeData.late_fee || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'student_id,fee_type,due_date'
            });

          if (feeError) {
            console.error('Error upserting fee record:', feeError);
          } else {
            feeRecordsUpdated++;
          }
        }
      }
    }

    // Recalculate risk scores for all students with updated data
    console.log('Recalculating risk scores...');
    const { data: allStudents } = await supabase
      .from('students')
      .select('*');

    if (allStudents) {
      for (const student of allStudents) {
        // Get attendance rate for the student
        const { data: attendanceRecords } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 30 days

        const attendanceRate = attendanceRecords ? 
          (attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100 : 95;

        // Get average academic performance
        const { data: academicRecords } = await supabase
          .from('academic_performance')
          .select('percentage')
          .eq('student_id', student.id)
          .gte('test_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 90 days

        const averageScore = academicRecords && academicRecords.length > 0 ?
          academicRecords.reduce((sum, record) => sum + (record.percentage || 0), 0) / academicRecords.length : 75;

        // Check fee status
        const { data: feeRecords } = await supabase
          .from('fee_records')
          .select('*')
          .eq('student_id', student.id)
          .gte('due_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const unpaidFees = feeRecords ? feeRecords.filter(f => f.status === 'pending').length : 0;
        const feeStatus = unpaidFees > 0 ? 'unpaid' : 'paid';

        // Calculate risk using existing utility
        const riskResult = calculateStudentRisk({
          attendance: attendanceRate,
          averageScore: averageScore,
          feeStatus: feeStatus as 'paid' | 'unpaid',
          failedAttempts: 0 // Default for now
        });

        // Update student with new risk calculation
        await supabase
          .from('students')
          .update({
            risk_score: riskResult.score,
            risk_level: riskResult.level,
            dropout_probability: riskResult.score * 1.2, // Estimated dropout probability
            last_risk_calculation: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id);
      }
    }

    // Log success notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        title: 'Data Sync Completed',
        message: `Successfully synced data: ${studentsUpdated} students, ${attendanceRecordsUpdated} attendance records, ${academicRecordsUpdated} academic records, ${feeRecordsUpdated} fee records updated. Risk scores recalculated.`,
        type: 'system',
        recipient_id: (await supabase.auth.admin.listUsers()).data.users[0]?.id || '00000000-0000-0000-0000-000000000000',
        channel: 'system',
        priority: 'medium',
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    console.log('Sync completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Data synchronization completed',
      summary: {
        studentsUpdated,
        attendanceRecordsUpdated,
        academicRecordsUpdated,
        feeRecordsUpdated,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in n8n webhook sync:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});