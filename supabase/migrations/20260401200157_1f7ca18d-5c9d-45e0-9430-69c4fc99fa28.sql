
CREATE TABLE public.radio_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stream_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  logo_url text,
  frequency text,
  country text DEFAULT 'YE',
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  play_count integer NOT NULL DEFAULT 0,
  quality_score numeric(5,2) NOT NULL DEFAULT 50.00,
  is_working boolean NOT NULL DEFAULT true,
  last_checked timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.radio_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Radio stations are publicly readable"
  ON public.radio_stations FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Service role can insert radio stations"
  ON public.radio_stations FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Service role can update radio stations"
  ON public.radio_stations FOR UPDATE TO public
  USING (true);

CREATE POLICY "Service role can delete radio stations"
  ON public.radio_stations FOR DELETE TO public
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_stations;
