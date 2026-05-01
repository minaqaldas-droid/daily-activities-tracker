-- ============================================
-- MIGRATION: Remove legacy single-team schema
-- ============================================
-- Copies any remaining legacy activities/settings into the team-scoped schema,
-- ensures every user belongs to at least one team, then drops obsolete tables
-- and columns that the app no longer uses.

BEGIN;

DO $$
DECLARE
  default_team_id UUID;
BEGIN
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
    RAISE EXCEPTION 'No active team exists in public.app_teams. Create at least one team before running legacy cleanup.';
  END IF;

  IF to_regclass('public.activities') IS NOT NULL THEN
    INSERT INTO public.team_activities (
      id,
      team_id,
      date,
      performer,
      system,
      shift,
      permit_number,
      instrument_type,
      "activityType",
      tag,
      problem,
      action,
      comments,
      "editedBy",
      created_at,
      edited_at
    )
    SELECT
      legacy_activity.id,
      default_team_id,
      legacy_activity.date,
      legacy_activity.performer,
      COALESCE(legacy_activity.system, ''),
      COALESCE(legacy_activity.shift, ''),
      COALESCE(legacy_activity.permit_number, ''),
      COALESCE(legacy_activity.instrument_type, ''),
      COALESCE(legacy_activity."activityType", ''),
      COALESCE(legacy_activity.tag, ''),
      legacy_activity.problem,
      legacy_activity.action,
      COALESCE(legacy_activity.comments, ''),
      legacy_activity."editedBy",
      COALESCE(legacy_activity.created_at, timezone('utc', now())),
      legacy_activity.edited_at
    FROM public.activities AS legacy_activity
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.team_activities AS scoped_activity
      WHERE scoped_activity.id = legacy_activity.id
    );
  END IF;

  IF to_regclass('public.settings') IS NOT NULL THEN
    INSERT INTO public.team_settings (
      team_id,
      webapp_name,
      logo_url,
      browser_tab_name,
      favicon_url,
      primary_color,
      performer_mode,
      header_font_family,
      subheader_font_family,
      sidebar_font_family,
      activity_field_config,
      dashboard_chart_config,
      updated_at,
      updated_by
    )
    SELECT
      default_team_id,
      COALESCE(legacy_settings.webapp_name, 'Daily Activities Tracker'),
      COALESCE(legacy_settings.logo_url, ''),
      COALESCE(legacy_settings.browser_tab_name, legacy_settings.webapp_name, 'Daily Activities Tracker'),
      COALESCE(legacy_settings.favicon_url, legacy_settings.logo_url, ''),
      COALESCE(legacy_settings.primary_color, '#667eea'),
      COALESCE(legacy_settings.performer_mode, 'manual'),
      COALESCE(legacy_settings.header_font_family, ''),
      COALESCE(legacy_settings.subheader_font_family, ''),
      COALESCE(legacy_settings.sidebar_font_family, ''),
      COALESCE(
        legacy_settings.activity_field_config,
        '{"date": {"enabled": true, "required": true, "order": 10}, "performer": {"enabled": true, "required": true, "order": 20}, "system": {"enabled": true, "required": true, "order": 30}, "shift": {"enabled": false, "required": false, "order": 40}, "permitNumber": {"enabled": false, "required": false, "order": 50}, "instrumentType": {"enabled": false, "required": false, "order": 60}, "activityType": {"enabled": true, "required": true, "order": 70}, "tag": {"enabled": true, "required": true, "order": 80}, "problem": {"enabled": true, "required": true, "order": 90}, "action": {"enabled": true, "required": true, "order": 100}, "comments": {"enabled": true, "required": false, "order": 110}}'::jsonb
      ),
      COALESCE(
        legacy_settings.dashboard_chart_config,
        '{"activityType": {"enabled": true, "order": 1}, "performer": {"enabled": true, "order": 2}, "system": {"enabled": true, "order": 3}, "shift": {"enabled": true, "order": 4}, "instrumentType": {"enabled": true, "order": 5}, "topTags": {"enabled": true, "order": 6}}'::jsonb
      ),
      COALESCE(legacy_settings.updated_at, timezone('utc', now())),
      legacy_settings.updated_by
    FROM (
      SELECT *
      FROM public.settings
      ORDER BY updated_at DESC NULLS LAST, id
      LIMIT 1
    ) AS legacy_settings
    ON CONFLICT (team_id) DO UPDATE
    SET
      webapp_name = EXCLUDED.webapp_name,
      logo_url = EXCLUDED.logo_url,
      browser_tab_name = EXCLUDED.browser_tab_name,
      favicon_url = EXCLUDED.favicon_url,
      primary_color = EXCLUDED.primary_color,
      performer_mode = EXCLUDED.performer_mode,
      header_font_family = EXCLUDED.header_font_family,
      subheader_font_family = EXCLUDED.subheader_font_family,
      sidebar_font_family = EXCLUDED.sidebar_font_family,
      activity_field_config = EXCLUDED.activity_field_config,
      dashboard_chart_config = EXCLUDED.dashboard_chart_config,
      updated_at = EXCLUDED.updated_at,
      updated_by = EXCLUDED.updated_by;
  END IF;

  INSERT INTO public.team_memberships (
    team_id,
    user_id,
    role,
    permissions,
    is_default
  )
  SELECT
    default_team_id,
    app_user.id,
    CASE
      WHEN app_user.role IN ('admin', 'editor', 'viewer') THEN app_user.role
      WHEN app_user.role = 'superadmin' THEN 'admin'
      ELSE 'viewer'
    END,
    COALESCE(
      app_user.permissions,
      '{"dashboard": true, "add": false, "edit": false, "search": true, "import": false, "export": true, "edit_action": false, "delete_action": false}'::jsonb
    ),
    false
  FROM public.users AS app_user
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.team_memberships AS membership
    WHERE membership.user_id = app_user.id
  );

  UPDATE public.users
  SET role = CASE
    WHEN role = 'superadmin' THEN 'admin'
    WHEN role = 'user' THEN 'viewer'
    ELSE role
  END
  WHERE role IN ('superadmin', 'user');
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

  RETURN NEW;
END;
$$;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (role IN ('viewer', 'editor', 'admin'));

DROP TRIGGER IF EXISTS set_team_membership_labels_before_write ON public.team_memberships;
DROP TRIGGER IF EXISTS refresh_team_membership_team_name_after_update ON public.app_teams;
DROP TRIGGER IF EXISTS refresh_team_membership_user_name_after_update ON public.users;

DROP FUNCTION IF EXISTS public.set_team_membership_labels();
DROP FUNCTION IF EXISTS public.refresh_team_membership_team_name();
DROP FUNCTION IF EXISTS public.refresh_team_membership_user_name();

ALTER TABLE public.team_memberships
  DROP COLUMN IF EXISTS team_name,
  DROP COLUMN IF EXISTS user_name;

ALTER TABLE public.app_teams
  DROP COLUMN IF EXISTS uses_legacy_tables;

ALTER TABLE public.team_settings
  DROP COLUMN IF EXISTS header_font_size,
  DROP COLUMN IF EXISTS subheader_font_size,
  DROP COLUMN IF EXISTS sidebar_font_size;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS approval_requested_at,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS last_sign_in_at;

DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.legacy_users CASCADE;

COMMIT;
