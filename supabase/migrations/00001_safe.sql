-- Safe SQL to run in Supabase dashboard
-- https://supabase.com/dashboard/project/dsbbdpzdrtabdimziujx/sql/new

CREATE TABLE IF NOT EXISTS public.hospital_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  hospital_name TEXT NOT NULL,
  hospital_lon DOUBLE PRECISION NOT NULL,
  hospital_lat DOUBLE PRECISION NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hospital_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports"
  ON public.hospital_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own reports"
  ON public.hospital_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.hospital_reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);