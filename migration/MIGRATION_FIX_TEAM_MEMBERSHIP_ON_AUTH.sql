-- ============================================
-- MIGRATION: Auto-assign default team membership
-- ============================================
-- Ensures users created or synced through auth always have at least one
-- team_memberships row so the team-scoped app can load activities/settings.

BEGIN;

CREATE OR REPLACE FUNCTION public.assign_default_team_membership(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_team_id UUID;
  profile_role TEXT;
  profile_permissions JSONB;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.team_memberships
    WHERE user_id = target_user_id
  ) THEN
    RETURN;
  END IF;

  SELECT id
  INTO default_team_id
  FROM public.app_teams
  WHERE is_active = true
  ORDER BY
    CASE WHEN slug = 'automation' THEN 0 ELSE 1 END,
    created_at ASC,
    name ASC
  LIMIT 1;

  IF default_team_id IS NULL THEN
    RETURN;
  END IF;

  SELECT
    CASE
      WHEN role = 'admin' THEN 'admin'
      WHEN role = 'editor' THEN 'editor'
      ELSE 'viewer'
    END,
    COALESCE(
      permissions,
      '{"dashboard": true, "add": false, "edit": false, "search": true, "import": false, "export": true, "edit_action": false, "delete_action": false}'::jsonb
    )
  INTO profile_role, profile_permissions
  FROM public.users
  WHERE id = target_user_id;

  IF profile_role IS NULL THEN
    profile_role := 'viewer';
  END IF;

  INSERT INTO public.team_memberships (
    team_id,
    user_id,
    role,
    permissions,
    is_default
  )
  VALUES (
    default_team_id,
    target_user_id,
    profile_role,
    profile_permissions,
    true
  )
  ON CONFLICT (team_id, user_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_auth_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    is_approved,
    approved_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'name', ''), split_part(NEW.email, '@', 1)),
    'viewer',
    false,
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name);

  UPDATE public.users
  SET
    is_approved = false,
    approved_at = NULL
  WHERE id = NEW.id
    AND (
      TG_OP = 'INSERT'
      OR (public.users.is_approved IS TRUE AND NEW.confirmed_at IS NULL)
    );

  PERFORM public.assign_default_team_membership(NEW.id);

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  profile_row RECORD;
BEGIN
  FOR profile_row IN
    SELECT id
    FROM public.users
  LOOP
    PERFORM public.assign_default_team_membership(profile_row.id);
  END LOOP;
END;
$$;

COMMIT;
