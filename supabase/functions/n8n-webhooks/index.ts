import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    console.log(`n8n webhook called with action: ${action}`);

    switch (action) {
      case 'sync-data':
        return await handleDataSync(req, supabaseClient);
      
      case 'get-at-risk':
        return await getAtRiskStudents(supabaseClient);
      
      case 'trigger-alert':
        return await triggerAlert(req, supabaseClient);
      
      case 'generate-report':
        return await generateReport(req, supabaseClient);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Error in n8n webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleDataSync(req: Request, supabase: any) {
  const { attendance, scores, fees } = await req.json();
  
  console.log('Syncing data from n8n:', { 
    attendanceRecords: attendance?.length || 0,
    scoreRecords: scores?.length || 0,
    feeRecords: fees?.length || 0
  });

  let processedCount = 0;

  // Update attendance data
  if (attendance && Array.isArray(attendance)) {
    for (const record of attendance) {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: record.student_id,
          date: record.date,
          status: record.status,
          check_in_time: record.check_in_time,
          check_out_time: record.check_out_time
        });
      
      if (error) {
        console.error('Error upserting attendance:', error);
      } else {
        processedCount++;
      }
    }
  }

  // Update academic performance
  if (scores && Array.isArray(scores)) {
    for (const record of scores) {
      const { error } = await supabase
        .from('academic_performance')
        .upsert({
          student_id: record.student_id,
          subject: record.subject,
          test_type: record.test_type,
          test_date: record.test_date,
          score: record.score,
          max_score: record.max_score
        });
      
      if (error) {
        console.error('Error upserting academic performance:', error);
      } else {
        processedCount++;
      }
    }
  }

  // Update fee records
  if (fees && Array.isArray(fees)) {
    for (const record of fees) {
      const { error } = await supabase
        .from('fee_records')
        .upsert({
          student_id: record.student_id,
          fee_type: record.fee_type,
          amount: record.amount,
          due_date: record.due_date,
          status: record.status
        });
      
      if (error) {
        console.error('Error upserting fee record:', error);
      } else {
        processedCount++;
      }
    }
  }

  // Trigger risk recalculation (simplified - in real app would be more sophisticated)
  console.log('Triggering risk recalculation...');

  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: processedCount,
      message: 'Data sync completed successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAtRiskStudents(supabase: any) {
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      id,
      student_id,
      grade_level,
      section,
      risk_level,
      risk_score,
      dropout_probability,
      profiles:user_id (
        first_name,
        last_name,
        phone
      )
    `)
    .in('risk_level', ['caution', 'high_risk'])
    .order('risk_score', { ascending: false });

  if (error) {
    throw error;
  }

  console.log(`Found ${students.length} at-risk students`);

  return new Response(
    JSON.stringify({ 
      students: students,
      count: students.length,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerAlert(req: Request, supabase: any) {
  const { studentId, type, channels } = await req.json();
  
  console.log('Triggering alert:', { studentId, type, channels });

  // Log the alert in notifications table
  const { error } = await supabase
    .from('notifications')
    .insert({
      type: 'risk_alert',
      title: 'Risk Alert Triggered',
      message: `Alert triggered for student ${studentId || 'all at-risk students'}`,
      priority: 'high',
      student_id: studentId,
      recipient_id: '00000000-0000-0000-0000-000000000000' // Default admin
    });

  if (error) {
    console.error('Error logging notification:', error);
  }

  // In a real implementation, this would integrate with WhatsApp Business API,
  // SMS services, email providers, etc.
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Alert triggered successfully',
      studentId: studentId || 'all',
      channels: channels || ['email']
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateReport(req: Request, supabase: any) {
  const { reportType, dateRange } = await req.json();
  
  console.log('Generating report:', { reportType, dateRange });

  // Fetch comprehensive student data
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      *,
      profiles:user_id (first_name, last_name)
    `)
    .order('risk_score', { ascending: false });

  if (error) {
    throw error;
  }

  const report = {
    generated_at: new Date().toISOString(),
    report_type: reportType,
    date_range: dateRange,
    summary: {
      total_students: students.length,
      high_risk: students.filter((s: any) => s.risk_level === 'high_risk').length,
      medium_risk: students.filter((s: any) => s.risk_level === 'caution').length,
      safe: students.filter((s: any) => s.risk_level === 'safe').length,
      average_risk_score: students.reduce((sum: number, s: any) => sum + (s.risk_score || 0), 0) / students.length
    },
    students: students.map((student: any) => ({
      student_id: student.student_id,
      name: student.profiles ? `${student.profiles.first_name} ${student.profiles.last_name}` : 'Unknown',
      grade_level: student.grade_level,
      section: student.section,
      risk_level: student.risk_level,
      risk_score: student.risk_score,
      dropout_probability: student.dropout_probability
    }))
  };

  return new Response(
    JSON.stringify(report),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}