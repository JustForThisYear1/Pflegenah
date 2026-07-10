
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'family',
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_match_id_created_at_idx ON public.messages (match_id, created_at);

GRANT SELECT, INSERT ON public.messages TO anon, authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prototype: anyone can read messages"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Prototype: anyone can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
