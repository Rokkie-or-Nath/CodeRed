-- Run this in your Supabase dashboard SQL Editor
-- https://supabase.com/dashboard/project/dsbbdpzdrtabdimziujx/sql/new

CREATE TABLE IF NOT EXISTS public.hospital_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  hospital_lon DOUBLE PRECISION NOT NULL,
  hospital_lat DOUBLE PRECISION NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('wait_time', 'overcrowded', 'closed', 'renovation', 'other')),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hospital_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reports" ON public.hospital_reports;
CREATE POLICY "Anyone can read reports" ON public.hospital_reports
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own reports" ON public.hospital_reports;
CREATE POLICY "Users can insert their own reports" ON public.hospital_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reports" ON public.hospital_reports;
CREATE POLICY "Users can delete their own reports" ON public.hospital_reports
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_hospital_reports_coords ON public.hospital_reports (hospital_lon, hospital_lat);
CREATE INDEX IF NOT EXISTS idx_hospital_reports_user ON public.hospital_reports (user_id);