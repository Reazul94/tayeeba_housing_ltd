-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 002: Full RBAC — Modules, Menus, Permissions,
--                Designations, Login History
-- ============================================================

-- ============================================================
-- USER_MODULE: Available ERP modules
-- ============================================================
CREATE TABLE IF NOT EXISTS user_module (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key    TEXT UNIQUE NOT NULL,    -- e.g. 'accounting', 'crm'
  module_name   TEXT NOT NULL,
  description   TEXT,
  icon_name     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_ROLE_MODULE: Role ↔ Module access
-- ============================================================
CREATE TABLE IF NOT EXISTS user_role_module (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  module_id     UUID NOT NULL REFERENCES user_module(id) ON DELETE CASCADE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by   TEXT NOT NULL DEFAULT 'SYSTEM',
  UNIQUE (role_id, module_id)
);

-- ============================================================
-- USER_MENU: All navigable menu items
-- ============================================================
CREATE TABLE IF NOT EXISTS user_menu (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key      TEXT UNIQUE NOT NULL,    -- e.g. 'accounting.chart-of-accounts'
  menu_name     TEXT NOT NULL,
  module_id     UUID REFERENCES user_module(id) ON DELETE SET NULL,
  module_key    TEXT NOT NULL,
  parent_id     UUID REFERENCES user_menu(id) ON DELETE SET NULL,
  route         TEXT NOT NULL,
  icon_name     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  permission_key TEXT NOT NULL,          -- used for frontend/backend guards
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_menu_module ON user_menu(module_key, is_active);

-- ============================================================
-- USER_ROLE_MENU: Role ↔ Menu access with action permissions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_role_menu (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  menu_id       UUID NOT NULL REFERENCES user_menu(id) ON DELETE CASCADE,
  can_view      BOOLEAN NOT NULL DEFAULT FALSE,
  can_create    BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit      BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete    BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve   BOOLEAN NOT NULL DEFAULT FALSE,
  can_export    BOOLEAN NOT NULL DEFAULT FALSE,
  can_print     BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by   TEXT NOT NULL DEFAULT 'SYSTEM',
  UNIQUE (role_id, menu_id)
);

-- ============================================================
-- USER_PERMISSION: User-level permission overrides
-- (overrides role permissions for specific menus)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_permission (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_info(id) ON DELETE CASCADE,
  menu_id       UUID NOT NULL REFERENCES user_menu(id) ON DELETE CASCADE,
  can_view      BOOLEAN,                -- NULL = inherit from role
  can_create    BOOLEAN,
  can_edit      BOOLEAN,
  can_delete    BOOLEAN,
  can_approve   BOOLEAN,
  can_export    BOOLEAN,
  can_print     BOOLEAN,
  is_deny       BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = explicit deny (overrides all allows)
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by   TEXT NOT NULL DEFAULT 'SYSTEM',
  UNIQUE (user_id, menu_id)
);

-- ============================================================
-- USER_DESIGNATION: Designation hierarchy (organogram)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_designation (
  designation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  parent_id       UUID REFERENCES user_designation(designation_id) ON DELETE SET NULL,
  level           INTEGER NOT NULL DEFAULT 0,  -- 0=Company, 1=Division, 2=Dept, 3=Section, etc.
  department      TEXT,
  division        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_DESIGNATION_HISTORY: Immutable designation assignment log
-- ============================================================
CREATE TABLE IF NOT EXISTS user_designation_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_info(id) ON DELETE RESTRICT,
  designation_id  UUID NOT NULL REFERENCES user_designation(designation_id) ON DELETE RESTRICT,
  start_date      DATE NOT NULL,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','TRANSFERRED','RESIGNED','RETIRED','TERMINATED')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  remarks         TEXT,
  assigned_by     TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_designation_history_user ON user_designation_history(user_id, is_active);

-- ============================================================
-- USER_ADDITIONAL_DESIGNATION: Temporary secondary responsibilities
-- ============================================================
CREATE TABLE IF NOT EXISTS user_additional_designation (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_info(id) ON DELETE CASCADE,
  designation_id  UUID NOT NULL REFERENCES user_designation(designation_id),
  start_date      DATE NOT NULL,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'ACTIVE',
  reason          TEXT,
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_LOGIN_HISTORY: Immutable login/logout audit
-- ============================================================
CREATE TABLE IF NOT EXISTS user_login_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES user_info(id) ON DELETE SET NULL,
  user_id_text    TEXT NOT NULL,                   -- preserve even if user deleted
  login_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  logout_at       TIMESTAMPTZ,
  ip_address      TEXT,
  user_agent      TEXT,
  device_info     TEXT,
  success         BOOLEAN NOT NULL DEFAULT TRUE,
  failure_reason  TEXT,
  session_id      UUID REFERENCES user_session(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON user_login_history(user_id, login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_date ON user_login_history(login_at DESC);
