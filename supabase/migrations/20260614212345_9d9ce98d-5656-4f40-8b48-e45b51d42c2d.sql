
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Event comments
CREATE TYPE public.comment_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  status public.comment_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX event_comments_event_id_idx ON public.event_comments(event_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_comments TO authenticated;
GRANT SELECT ON public.event_comments TO anon;
GRANT ALL ON public.event_comments TO service_role;

ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can see approved comments
CREATE POLICY "Approved comments are public" ON public.event_comments
  FOR SELECT TO anon, authenticated USING (status = 'approved');

-- Authors can see their own (pending/rejected included)
CREATE POLICY "Authors can view their own comments" ON public.event_comments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Moderators/admins can view all
CREATE POLICY "Moderators can view all comments" ON public.event_comments
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
  );

-- Authors can insert their own comments
CREATE POLICY "Users can post comments" ON public.event_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Authors can delete their own
CREATE POLICY "Authors can delete their own comments" ON public.event_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Moderators/admins can update (to approve/reject) and delete any
CREATE POLICY "Moderators can update any comment" ON public.event_comments
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
  ) WITH CHECK (
    public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Moderators can delete any comment" ON public.event_comments
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
  );

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER event_comments_set_updated_at
  BEFORE UPDATE ON public.event_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
