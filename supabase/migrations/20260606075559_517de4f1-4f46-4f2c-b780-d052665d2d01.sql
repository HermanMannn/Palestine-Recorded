
CREATE TABLE public.event_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_title text,
  user_id uuid NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.event_submissions TO authenticated;
GRANT ALL ON public.event_submissions TO service_role;

ALTER TABLE public.event_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own submissions" ON public.event_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own submissions" ON public.event_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Storage policies for event-submissions bucket (files keyed by <user_id>/...)
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own submissions" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'event-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
