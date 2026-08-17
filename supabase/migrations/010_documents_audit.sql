-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 010: Documents, Audit Log, Notifications, Settings
-- ============================================================

-- ============================================================
-- DOCUMENT: Metadata for files in Supabase Storage
-- ============================================================
CREATE TABLE IF NOT EXISTS document (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type     TEXT NOT NULL
                      CHECK (document_type IN ('Customer NID','Customer Photo','Booking Form',
                             'Agreement','Land Deed','Mutation','Allotment Letter','Receipt',
                             'Employee Document','Project Document','Land Document','Other')),
  customer_id       UUID REFERENCES customer(id) ON DELETE SET NULL,
  project_id        UUID REFERENCES project(id) ON DELETE SET NULL,
  plot_id           UUID REFERENCES plot(id) ON DELETE SET NULL,
  employee_id       UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  storage_bucket    TEXT NOT NULL,                   -- Supabase bucket name
  storage_path      TEXT NOT NULL UNIQUE,            -- full storage path/key
  original_filename TEXT NOT NULL,
  safe_filename     TEXT NOT NULL,                   -- sanitized, server-generated
  mime_type         TEXT NOT NULL,
  file_size_bytes   BIGINT NOT NULL,
  description       TEXT,
  is_private        BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by       TEXT NOT NULL DEFAULT 'SYSTEM',
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  deleted_by        TEXT
);

CREATE INDEX IF NOT EXISTS idx_document_customer ON document(customer_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_document_project ON document(project_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_document_type ON document(document_type, is_deleted);

-- ============================================================
-- AUDIT_LOG: Immutable system audit trail
-- (Only SYSTEM writes to this. No UPDATE/DELETE allowed by users.)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES user_info(id) ON DELETE SET NULL,
  user_id_text    TEXT,                              -- preserved even if user deleted
  action          TEXT NOT NULL,                     -- e.g. 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  module          TEXT NOT NULL,                     -- e.g. 'booking', 'payment', 'user'
  entity_type     TEXT,                              -- e.g. 'booking', 'customer'
  entity_id       TEXT,
  old_value       JSONB,
  new_value       JSONB,
  description     TEXT,
  ip_address      TEXT,
  user_agent      TEXT,
  severity        TEXT NOT NULL DEFAULT 'INFO'
                    CHECK (severity IN ('INFO','WARNING','ERROR','CRITICAL')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_log(module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at DESC);

-- ============================================================
-- NOTIFICATION: In-app notification system
-- ============================================================
CREATE TABLE IF NOT EXISTS notification (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id  UUID REFERENCES user_info(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'info'
                    CHECK (type IN ('info','success','warning','error','payment','due','booking')),
  reference_type  TEXT,
  reference_id    UUID,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification(target_user_id, is_read, created_at DESC);

-- ============================================================
-- SYSTEM_SETTINGS: Global ERP configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  key             TEXT PRIMARY KEY,
  value           TEXT,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      TEXT
);

-- Default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('company_name',          'TAYEEBA HOUSING LTD.',              'Company full name'),
  ('company_address',       'Gulshan Tower (Level 8), Plot 44, Gulshan-2, Dhaka-1212', 'Company address'),
  ('company_phone',         '+880 9612-889900',                  'Company phone'),
  ('company_email',         'info@tayeebahousing.com',           'Company email'),
  ('currency',              'BDT',                               'Currency code'),
  ('currency_symbol',       '৳',                                  'Currency symbol'),
  ('timezone',              'Asia/Dhaka',                        'System timezone'),
  ('date_format',           'DD MMM YYYY',                       'Date display format'),
  ('language',              'en',                                 'Default language'),
  ('receipt_prefix',        'THL-MR',                            'Money receipt prefix'),
  ('financial_year_start',  '07-01',                             'Financial year start MM-DD'),
  ('session_timeout_minutes', '30',                              'JWT session timeout in minutes'),
  ('max_failed_logins',     '5',                                 'Max failed login attempts before lockout'),
  ('password_expiry_days',  '90',                                'Password expiry in days (0=never)'),
  ('min_password_length',   '8',                                 'Minimum password length')
ON CONFLICT (key) DO NOTHING;
