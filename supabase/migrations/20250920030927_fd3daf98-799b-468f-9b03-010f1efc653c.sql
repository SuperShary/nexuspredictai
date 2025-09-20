-- Create a scheduled task that runs every 2 hours to sync data from n8n webhook
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the n8n webhook and process data
CREATE OR REPLACE FUNCTION public.sync_n8n_webhook_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by the edge function
  -- Log the sync attempt
  INSERT INTO public.notifications (
    title,
    message,
    type,
    recipient_id,
    channel,
    priority,
    status
  ) VALUES (
    'Automated Data Sync',
    'Starting automated data sync from n8n webhook',
    'system',
    (SELECT id FROM auth.users LIMIT 1), -- Use first admin user as recipient
    'system',
    'low',
    'pending'
  );
END;
$$;

-- Schedule the webhook sync to run every 2 hours
SELECT cron.schedule(
  'n8n-webhook-sync',
  '0 */2 * * *', -- Run every 2 hours
  $$
  SELECT net.http_post(
    url := 'https://zcinbxtkdydrkyflpiui.supabase.co/functions/v1/n8n-webhook-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaW5ieHRrZHlkcmt5ZmxwaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzE4ODIsImV4cCI6MjA3MzQwNzg4Mn0.o0-LT81lQmFmSLV95RtDsYUtZbIBo4y-CPQr548iadU"}'::jsonb,
    body := '{"trigger": "automated", "timestamp": "' || now() || '"}'::jsonb
  ) as request_id;
  $$
);