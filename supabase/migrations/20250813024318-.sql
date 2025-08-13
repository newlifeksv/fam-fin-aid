-- Retry: stage policies to avoid forward references

-- Ensure helper exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- FAMILIES
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Helper membership function
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm WHERE fm.user_id = _user_id AND fm.family_id = _family_id
  ) OR EXISTS (
    SELECT 1 FROM public.families f WHERE f.id = _family_id AND f.owner_id = _user_id
  );
$$;

-- Families policies
DROP POLICY IF EXISTS "Family visible to members" ON public.families;
CREATE POLICY "Family visible to members" ON public.families FOR SELECT TO authenticated USING (public.is_family_member(auth.uid(), id));
DROP POLICY IF EXISTS "Owner can insert family" ON public.families;
CREATE POLICY "Owner can insert family" ON public.families FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Owner can update family" ON public.families;
CREATE POLICY "Owner can update family" ON public.families FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Owner can delete family" ON public.families;
CREATE POLICY "Owner can delete family" ON public.families FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Family members policies (phase 1: allow owner to add themselves)
DROP POLICY IF EXISTS "Members can view family members" ON public.family_members;
CREATE POLICY "Members can view family members" ON public.family_members FOR SELECT TO authenticated USING (public.is_family_member(auth.uid(), family_id));
DROP POLICY IF EXISTS "Owner can add themselves to a family" ON public.family_members;
CREATE POLICY "Owner can add themselves to a family" ON public.family_members FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.families f WHERE f.id = family_id AND f.owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can remove themselves from a family" ON public.family_members;
CREATE POLICY "Users can remove themselves from a family" ON public.family_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- INVITES
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inviter or invited user can view invite" ON public.invites;
CREATE POLICY "Inviter or invited user can view invite" ON public.invites FOR SELECT TO authenticated USING (
  invited_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.email = invites.email)
);
DROP POLICY IF EXISTS "Members can create invites" ON public.invites;
CREATE POLICY "Members can create invites" ON public.invites FOR INSERT TO authenticated WITH CHECK (
  invited_by = auth.uid() AND public.is_family_member(auth.uid(), family_id)
);
DROP POLICY IF EXISTS "Invited user can accept invite" ON public.invites;
CREATE POLICY "Invited user can accept invite" ON public.invites FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.email = invites.email)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.email = invites.email)
);
DROP POLICY IF EXISTS "Inviter can delete invite" ON public.invites;
CREATE POLICY "Inviter can delete invite" ON public.invites FOR DELETE TO authenticated USING (invited_by = auth.uid());

-- Now upgrade family_members insert policy to also accept accepted invites
DROP POLICY IF EXISTS "Users can add themselves to a family" ON public.family_members;
CREATE POLICY "Users can add themselves to a family" ON public.family_members FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM public.families f WHERE f.id = family_id AND f.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.invites i JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.family_id = family_id AND i.email = p.email AND i.accepted = true
    )
  )
);
-- Optionally drop the owner-only policy to avoid overlap
DROP POLICY IF EXISTS "Owner can add themselves to a family" ON public.family_members;
