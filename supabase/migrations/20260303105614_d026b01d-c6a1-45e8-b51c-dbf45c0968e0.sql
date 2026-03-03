
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  source_name text NOT NULL,
  url text NOT NULL,
  age_min integer,
  age_max integer,
  is_video boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read resources"
  ON public.resources
  FOR SELECT
  TO authenticated
  USING (true);
