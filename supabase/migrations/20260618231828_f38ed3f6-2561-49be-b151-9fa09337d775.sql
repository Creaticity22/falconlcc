
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seed-demo-daily') THEN
    PERFORM cron.unschedule('seed-demo-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'seed-demo-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://eraqvumoszuaknsmdpgj.supabase.co/functions/v1/seed-demo',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYXF2dW1vc3p1YWtuc21kcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjkxOTcsImV4cCI6MjA4NzUwNTE5N30.6lvFPpNSpRH53pgzZFpjGNHDyxnlk7rgJfHPpvo516Y',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYXF2dW1vc3p1YWtuc21kcGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjkxOTcsImV4cCI6MjA4NzUwNTE5N30.6lvFPpNSpRH53pgzZFpjGNHDyxnlk7rgJfHPpvo516Y'
    ),
    body := jsonb_build_object('source', 'cron', 'time', now())
  );
  $$
);
