
-- Settings per user
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY,
  school_name TEXT NOT NULL DEFAULT 'Minha escola',
  auto_match BOOLEAN NOT NULL DEFAULT true,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_push BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select_own" ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON public.user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "settings_delete_own" ON public.user_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Teachers
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX teachers_owner_idx ON public.teachers(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers_select_own" ON public.teachers FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "teachers_insert_own" ON public.teachers FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "teachers_update_own" ON public.teachers FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "teachers_delete_own" ON public.teachers FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT '',
  students INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX classes_owner_idx ON public.classes(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes_select_own" ON public.classes FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "classes_insert_own" ON public.classes FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "classes_update_own" ON public.classes FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "classes_delete_own" ON public.classes FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'Sala comum',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rooms_owner_idx ON public.rooms(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select_own" ON public.rooms FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "rooms_insert_own" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "rooms_update_own" ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "rooms_delete_own" ON public.rooms FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Schedule blocks
CREATE TABLE public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL DEFAULT '',
  teacher TEXT NOT NULL DEFAULT '',
  room TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'normal',
  substitute TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, day, time)
);
CREATE INDEX schedule_owner_idx ON public.schedule_blocks(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_blocks TO authenticated;
GRANT ALL ON public.schedule_blocks TO service_role;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sched_select_own" ON public.schedule_blocks FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "sched_insert_own" ON public.schedule_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "sched_update_own" ON public.schedule_blocks FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "sched_delete_own" ON public.schedule_blocks FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-muted-foreground',
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX logs_owner_idx ON public.activity_logs(owner_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_select_own" ON public.activity_logs FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "logs_insert_own" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "logs_delete_own" ON public.activity_logs FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_user_settings_updated BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_schedule_blocks_updated BEFORE UPDATE ON public.schedule_blocks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
