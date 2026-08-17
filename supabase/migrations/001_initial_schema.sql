-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 001: Core Schema — HR Employee & User Authentication
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HR_EMPLOYEE: The authoritative source of employee records
-- ============================================================
CREATE TABLE IF NOT EXISTS hr_employee (
  employee_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code     TEXT UNIQUE NOT NULL,            -- e.g. THL-EMP-00001
  name              TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  signature         TEXT,                            -- storage path for signature image
  registration_status TEXT DEFAULT 'ACTIVE',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  joining_date      DATE,
  department        TEXT,
  designation       TEXT,
  employment_status TEXT NOT NULL DEFAULT 'Permanent' 
                      CHECK (employment_status IN ('Permanent','Contractual','Part-Time','Probation','Intern')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_INFO: ERP login accounts linked to employees
-- ============================================================
CREATE TABLE IF NOT EXISTS user_info (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT UNIQUE NOT NULL,          -- e.g. THL-EMP-00001 (equals employee_code by convention)
  employee_id         UUID REFERENCES hr_employee(employee_id) ON DELETE RESTRICT,
  employee_code       TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  email               TEXT NOT NULL,
  mobile              TEXT,
  password_hash       TEXT NOT NULL,                 -- bcrypt hash, NEVER plain text
  status              TEXT NOT NULL DEFAULT 'INITIAL'
                        CHECK (status IN ('INITIAL','ACTIVE','INACTIVE','LOCKED','SUSPENDED','DISABLED','EXPIRED')),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  last_login_at       TIMESTAMPTZ,
  last_logout_at      TIMESTAMPTZ,
  last_password_change_at TIMESTAMPTZ,
  password_expires_at TIMESTAMPTZ,
  locked_at           TIMESTAMPTZ,
  activated_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          TEXT NOT NULL DEFAULT 'SYSTEM',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by          TEXT
);

-- Index for fast login lookup
CREATE INDEX IF NOT EXISTS idx_user_info_user_id ON user_info(user_id);
CREATE INDEX IF NOT EXISTS idx_user_info_employee_id ON user_info(employee_id);
CREATE INDEX IF NOT EXISTS idx_user_info_status ON user_info(status, is_active);

-- ============================================================
-- USER_ROLES: Role definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name     TEXT UNIQUE NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,       -- system roles cannot be deleted
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_USER_ROLE: Many-to-many user ↔ role assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS user_user_role (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_info(id) ON DELETE CASCADE,
  role_id       UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by   TEXT NOT NULL DEFAULT 'SYSTEM',
  UNIQUE (user_id, role_id)
);

-- ============================================================
-- USER_SESSION: JWT session tracking for invalidation
-- ============================================================
CREATE TABLE IF NOT EXISTS user_session (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_info(id) ON DELETE CASCADE,
  refresh_token   TEXT UNIQUE NOT NULL,
  is_valid        BOOLEAN NOT NULL DEFAULT TRUE,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  invalidated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_session_token ON user_session(refresh_token, is_valid);
CREATE INDEX IF NOT EXISTS idx_user_session_user ON user_session(user_id, is_valid);

-- ============================================================
-- Trigger: auto-update updated_at on hr_employee and user_info
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_hr_employee_updated_at
  BEFORE UPDATE ON hr_employee
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_user_info_updated_at
  BEFORE UPDATE ON user_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
