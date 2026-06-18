
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove any previous version of this job
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
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := jsonb_build_object('source', 'cron', 'time', now())
  );
  $$
);
