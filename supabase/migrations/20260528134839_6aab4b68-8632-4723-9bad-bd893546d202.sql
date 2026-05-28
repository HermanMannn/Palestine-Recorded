-- Recreate messages with new schema
DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- For now: everyone can read all messages
CREATE POLICY "Messages are readable by everyone"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Authed users can insert messages as themselves"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

CREATE INDEX idx_messages_chat_created ON public.messages(chat_id, created_at);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;