-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 001: Core Schema â€” HR Employee & User Authentication
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
-- USER_USER_ROLE: Many-to-many user â†” role assignments
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
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 002: Full RBAC â€” Modules, Menus, Permissions,
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
-- USER_ROLE_MODULE: Role â†” Module access
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
-- USER_ROLE_MENU: Role â†” Menu access with action permissions
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
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 003: Projects, Blocks, Zones, Roads
-- ============================================================

CREATE TABLE IF NOT EXISTS project (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code              TEXT UNIQUE NOT NULL,       -- e.g. THL-PRJ-001
  project_name              TEXT NOT NULL,
  location                  TEXT NOT NULL,
  land_area_decimal         NUMERIC(10,4) DEFAULT 0,
  land_area_katha           NUMERIC(10,4) DEFAULT 0,
  total_plots               INTEGER NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'Planning'
                              CHECK (status IN ('Planning','Ongoing','Near Completion','Completed','Cancelled')),
  launch_date               DATE,
  expected_completion       DATE,
  manager_id                UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  manager_name              TEXT,
  development_budget        NUMERIC(18,2) DEFAULT 0,
  actual_development_cost   NUMERIC(18,2) DEFAULT 0,
  description               TEXT,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_status ON project(status, is_active);

CREATE TABLE IF NOT EXISTS project_block (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  block_name    TEXT NOT NULL,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, block_name)
);

CREATE TABLE IF NOT EXISTS project_zone (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id      UUID NOT NULL REFERENCES project_block(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  zone_name     TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (block_id, zone_name)
);

CREATE TABLE IF NOT EXISTS project_road (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id       UUID REFERENCES project_zone(id) ON DELETE SET NULL,
  block_id      UUID REFERENCES project_block(id) ON DELETE SET NULL,
  project_id    UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  road_name     TEXT NOT NULL,
  width_feet    NUMERIC(6,2),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_project_updated_at
  BEFORE UPDATE ON project
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 004: Plot Inventory
-- ============================================================

CREATE TYPE plot_status AS ENUM (
  'Available', 'Reserved', 'Booked', 'Sold',
  'Transferred', 'Cancelled', 'On Hold'
);

CREATE TABLE IF NOT EXISTS plot (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_number         TEXT NOT NULL,
  project_id          UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  block_id            UUID REFERENCES project_block(id) ON DELETE SET NULL,
  zone_id             UUID REFERENCES project_zone(id) ON DELETE SET NULL,
  road_id             UUID REFERENCES project_road(id) ON DELETE SET NULL,
  block_name          TEXT,
  zone_name           TEXT,
  road_name           TEXT,
  size_katha          NUMERIC(10,4) NOT NULL DEFAULT 0,
  size_decimal        NUMERIC(10,4),
  facing              TEXT CHECK (facing IN ('North','South','East','West','North-East','South-East','North-West','South-West')),
  price_per_katha     NUMERIC(18,2) NOT NULL DEFAULT 0,
  base_price          NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount            NUMERIC(18,2) NOT NULL DEFAULT 0,
  final_price         NUMERIC(18,2) GENERATED ALWAYS AS (base_price - discount) STORED,
  status              plot_status NOT NULL DEFAULT 'Available',
  customer_id         UUID,                              -- set on booking
  customer_name       TEXT,
  booking_id          UUID,
  booking_date        DATE,
  agreement_date      DATE,
  handover_status     TEXT DEFAULT 'Pending',
  sales_executive_id  UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  sales_executive_name TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, plot_number)                       -- prevent duplicate plot numbers within a project
);

CREATE INDEX IF NOT EXISTS idx_plot_project_status ON plot(project_id, status);
CREATE INDEX IF NOT EXISTS idx_plot_status ON plot(status);
CREATE INDEX IF NOT EXISTS idx_plot_customer ON plot(customer_id);

CREATE OR REPLACE TRIGGER trg_plot_updated_at
  BEFORE UPDATE ON plot
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 005: Customers, Leads, Follow-ups, Site Visits
-- ============================================================

CREATE TABLE IF NOT EXISTS customer (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code         TEXT UNIQUE NOT NULL,          -- e.g. THL-CUST-00001
  name                  TEXT NOT NULL,
  father_name           TEXT,
  mother_name           TEXT,
  nid                   TEXT,
  dob                   DATE,
  mobile                TEXT NOT NULL,
  alt_mobile            TEXT,
  email                 TEXT,
  present_address       TEXT,
  permanent_address     TEXT,
  profession            TEXT,
  reference             TEXT,
  linked_project_id     UUID REFERENCES project(id) ON DELETE SET NULL,
  linked_project_name   TEXT,
  linked_plot_id        UUID REFERENCES plot(id) ON DELETE SET NULL,
  linked_plot_number    TEXT,
  sales_executive_id    UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  sales_executive_name  TEXT,
  total_plot_value      NUMERIC(18,2) DEFAULT 0,
  total_discount        NUMERIC(18,2) DEFAULT 0,
  total_paid            NUMERIC(18,2) DEFAULT 0,
  total_due             NUMERIC(18,2) DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'Active'
                          CHECK (status IN ('Active','Inactive','Cancelled','Transferred')),
  notes                 TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_code ON customer(customer_code);
CREATE INDEX IF NOT EXISTS idx_customer_mobile ON customer(mobile);
CREATE INDEX IF NOT EXISTS idx_customer_nid ON customer(nid);
CREATE INDEX IF NOT EXISTS idx_customer_name ON customer(name);

CREATE TABLE IF NOT EXISTS customer_nominee (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  nominee_name    TEXT NOT NULL,
  relation        TEXT NOT NULL,
  nid             TEXT,
  mobile          TEXT,
  address         TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEAD: CRM Lead Management
-- ============================================================
CREATE TABLE IF NOT EXISTS lead (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code             TEXT UNIQUE NOT NULL,           -- e.g. THL-LEAD-00001
  name                  TEXT NOT NULL,
  mobile                TEXT NOT NULL,
  email                 TEXT,
  source                TEXT,                           -- e.g. Facebook, Referral, Walk-in
  project_id            UUID REFERENCES project(id) ON DELETE SET NULL,
  interested_project    TEXT,
  budget                NUMERIC(18,2),
  plot_size_katha       NUMERIC(10,4),
  stage                 TEXT NOT NULL DEFAULT 'New'
                          CHECK (stage IN ('New','Contacted','Site Visit Scheduled','Site Visit Done','Negotiation','Booking Intent','Booked','Lost')),
  sales_executive_id    UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  sales_executive_name  TEXT,
  next_follow_up_date   DATE,
  lost_reason           TEXT,
  converted_customer_id UUID REFERENCES customer(id) ON DELETE SET NULL,
  remarks               TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_stage ON lead(stage, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_mobile ON lead(mobile);
CREATE INDEX IF NOT EXISTS idx_lead_executive ON lead(sales_executive_id);

CREATE TABLE IF NOT EXISTS follow_up (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           UUID REFERENCES lead(id) ON DELETE CASCADE,
  customer_id       UUID REFERENCES customer(id) ON DELETE CASCADE,
  follow_up_date    DATE NOT NULL,
  contact_method    TEXT,
  summary           TEXT,
  next_follow_up    DATE,
  done_by_id        UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  done_by_name      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SITE_VISIT: Scheduled and completed project site visits
-- ============================================================
CREATE TABLE IF NOT EXISTS site_visit (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               UUID REFERENCES lead(id) ON DELETE SET NULL,
  customer_id           UUID REFERENCES customer(id) ON DELETE SET NULL,
  visit_date            DATE NOT NULL,
  visit_time            TIME,
  project_id            UUID REFERENCES project(id) ON DELETE SET NULL,
  project_name          TEXT,
  interested_plot       TEXT,
  sales_executive_id    UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  sales_executive_name  TEXT,
  transport_arranged    BOOLEAN DEFAULT FALSE,
  transport_details     TEXT,
  status                TEXT NOT NULL DEFAULT 'Scheduled'
                          CHECK (status IN ('Scheduled','Completed','Cancelled','No Show')),
  outcome               TEXT,
  follow_up_date        DATE,
  remarks               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_customer_updated_at
  BEFORE UPDATE ON customer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 006: Booking, Installments, Payments, Receipts
-- ============================================================

-- Receipt number sequence (PostgreSQL guarantees uniqueness under concurrency)
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

-- ============================================================
-- BOOKING
-- ============================================================
CREATE TABLE IF NOT EXISTS booking (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number        TEXT UNIQUE NOT NULL,           -- e.g. THL-BKG-2026-0001
  customer_id           UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  customer_name         TEXT NOT NULL,
  project_id            UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  project_name          TEXT NOT NULL,
  plot_id               UUID NOT NULL REFERENCES plot(id) ON DELETE RESTRICT,
  plot_number           TEXT NOT NULL,
  total_price           NUMERIC(18,2) NOT NULL,
  discount              NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_price             NUMERIC(18,2) NOT NULL,         -- total_price - discount
  booking_money         NUMERIC(18,2) NOT NULL DEFAULT 0,
  down_payment          NUMERIC(18,2) NOT NULL DEFAULT 0,
  installment_principal NUMERIC(18,2) NOT NULL,         -- net_price - booking_money - down_payment
  duration_months       INTEGER NOT NULL DEFAULT 12,
  frequency             TEXT NOT NULL DEFAULT 'Monthly'
                          CHECK (frequency IN ('Monthly','Quarterly','Half-Yearly','Custom')),
  first_installment_date DATE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'Active'
                          CHECK (status IN ('Active','Completed','Cancelled','Transferred')),
  sales_executive_id    UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  sales_executive_name  TEXT,
  cancellation_reason   TEXT,
  cancellation_charge   NUMERIC(18,2) DEFAULT 0,
  cancelled_at          TIMESTAMPTZ,
  cancelled_by          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by            TEXT NOT NULL DEFAULT 'SYSTEM'
);

CREATE INDEX IF NOT EXISTS idx_booking_customer ON booking(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_plot ON booking(plot_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status);
CREATE INDEX IF NOT EXISTS idx_booking_number ON booking(booking_number);

-- ============================================================
-- INSTALLMENT: Generated installment schedule
-- ============================================================
CREATE TABLE IF NOT EXISTS installment (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  plot_id           UUID NOT NULL REFERENCES plot(id) ON DELETE RESTRICT,
  installment_number INTEGER NOT NULL,
  due_date          DATE NOT NULL,
  due_amount        NUMERIC(18,2) NOT NULL,
  paid_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,
  remaining_amount  NUMERIC(18,2) GENERATED ALWAYS AS (due_amount - paid_amount) STORED,
  status            TEXT NOT NULL DEFAULT 'Due'
                      CHECK (status IN ('Due','Partially Paid','Paid','Overdue','Waived')),
  last_paid_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_installment_booking ON installment(booking_id);
CREATE INDEX IF NOT EXISTS idx_installment_due_date ON installment(due_date, status);
CREATE INDEX IF NOT EXISTS idx_installment_status ON installment(status);

-- ============================================================
-- PAYMENT: Individual payment records
-- ============================================================
CREATE TABLE IF NOT EXISTS payment (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  booking_id        UUID REFERENCES booking(id) ON DELETE SET NULL,
  installment_id    UUID REFERENCES installment(id) ON DELETE SET NULL,
  project_id        UUID REFERENCES project(id) ON DELETE SET NULL,
  plot_id           UUID REFERENCES plot(id) ON DELETE SET NULL,
  payment_type      TEXT NOT NULL
                      CHECK (payment_type IN ('Booking Money','Down Payment','Installment',
                             'Development Charge','Registration Fee','Transfer Fee','Other Income')),
  amount            NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  payment_method    TEXT NOT NULL
                      CHECK (payment_method IN ('Cash','Bank Transfer','Cheque','Pay Order','bKash','Nagad','Rocket','Other')),
  bank_name         TEXT,
  cheque_or_txn_no  TEXT,
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  remarks           TEXT,
  receipt_id        UUID,                              -- set after receipt generated
  is_voided         BOOLEAN NOT NULL DEFAULT FALSE,
  voided_at         TIMESTAMPTZ,
  voided_by         TEXT,
  void_reason       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        TEXT NOT NULL DEFAULT 'SYSTEM'
);

CREATE INDEX IF NOT EXISTS idx_payment_customer ON payment(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_booking ON payment(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_date ON payment(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_type ON payment(payment_type);

-- ============================================================
-- RECEIPT: Money receipt records
-- ============================================================
CREATE TABLE IF NOT EXISTS receipt (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number    TEXT UNIQUE NOT NULL,              -- e.g. THL-MR-2026-0001
  payment_id        UUID UNIQUE REFERENCES payment(id) ON DELETE RESTRICT,
  customer_id       UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  customer_name     TEXT NOT NULL,
  project_id        UUID REFERENCES project(id) ON DELETE SET NULL,
  project_name      TEXT,
  plot_id           UUID REFERENCES plot(id) ON DELETE SET NULL,
  plot_number       TEXT,
  booking_id        UUID REFERENCES booking(id) ON DELETE SET NULL,
  payment_type      TEXT NOT NULL,
  amount            NUMERIC(18,2) NOT NULL,
  payment_method    TEXT NOT NULL,
  bank_name         TEXT,
  cheque_or_txn_no  TEXT,
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by_id    UUID REFERENCES hr_employee(employee_id) ON DELETE SET NULL,
  received_by_name  TEXT,
  remarks           TEXT,
  is_cancelled      BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at      TIMESTAMPTZ,
  cancelled_by      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        TEXT NOT NULL DEFAULT 'SYSTEM'
);

CREATE INDEX IF NOT EXISTS idx_receipt_number ON receipt(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipt_customer ON receipt(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_date ON receipt(payment_date DESC);

-- ============================================================
-- FUNCTION: Atomic booking with plot locking
-- ============================================================
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_customer_id       UUID,
  p_project_id        UUID,
  p_plot_id           UUID,
  p_total_price       NUMERIC,
  p_discount          NUMERIC,
  p_booking_money     NUMERIC,
  p_down_payment      NUMERIC,
  p_duration_months   INTEGER,
  p_frequency         TEXT,
  p_first_inst_date   DATE,
  p_sales_exec_id     UUID,
  p_sales_exec_name   TEXT,
  p_created_by        TEXT
) RETURNS JSONB AS $$
DECLARE
  v_plot              plot%ROWTYPE;
  v_customer          customer%ROWTYPE;
  v_project           project%ROWTYPE;
  v_booking_number    TEXT;
  v_booking_id        UUID;
  v_net_price         NUMERIC;
  v_installment_principal NUMERIC;
  v_num_installments  INTEGER;
  v_inst_amount       NUMERIC;
  v_inst_date         DATE;
  i                   INTEGER;
BEGIN
  -- Lock the plot row to prevent concurrent booking
  SELECT * INTO v_plot FROM plot WHERE id = p_plot_id FOR UPDATE;
  
  -- Validate plot status
  IF v_plot.status != 'Available' AND v_plot.status != 'Reserved' THEN
    RAISE EXCEPTION 'CONFLICT: Plot % is no longer available (status: %)', v_plot.plot_number, v_plot.status;
  END IF;
  
  -- Get customer and project info
  SELECT * INTO v_customer FROM customer WHERE id = p_customer_id;
  SELECT * INTO v_project FROM project WHERE id = p_project_id;
  
  -- Generate booking number
  v_booking_number := 'THL-BKG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('receipt_number_seq')::TEXT, 4, '0');
  
  -- Calculate financials
  v_net_price := p_total_price - p_discount;
  v_installment_principal := v_net_price - p_booking_money - p_down_payment;
  
  -- Number of installments
  v_num_installments := CASE 
    WHEN p_frequency = 'Monthly' THEN p_duration_months
    WHEN p_frequency = 'Quarterly' THEN FLOOR(p_duration_months / 3)
    WHEN p_frequency = 'Half-Yearly' THEN FLOOR(p_duration_months / 6)
    ELSE p_duration_months
  END;
  
  v_inst_amount := CASE WHEN v_num_installments > 0 THEN ROUND(v_installment_principal / v_num_installments, 2) ELSE 0 END;
  
  -- Create booking record
  v_booking_id := gen_random_uuid();
  INSERT INTO booking (id, booking_number, customer_id, customer_name, project_id, project_name,
    plot_id, plot_number, total_price, discount, net_price, booking_money, down_payment,
    installment_principal, duration_months, frequency, first_installment_date,
    sales_executive_id, sales_executive_name, created_by)
  VALUES (v_booking_id, v_booking_number, p_customer_id, v_customer.name, p_project_id, v_project.project_name,
    p_plot_id, v_plot.plot_number, p_total_price, p_discount, v_net_price, p_booking_money, p_down_payment,
    v_installment_principal, p_duration_months, p_frequency, p_first_inst_date,
    p_sales_exec_id, p_sales_exec_name, p_created_by);
  
  -- Generate installment schedule
  v_inst_date := p_first_inst_date;
  FOR i IN 1..v_num_installments LOOP
    INSERT INTO installment (booking_id, customer_id, plot_id, installment_number, due_date, due_amount)
    VALUES (v_booking_id, p_customer_id, p_plot_id, i, v_inst_date, v_inst_amount);
    
    v_inst_date := CASE
      WHEN p_frequency = 'Monthly' THEN v_inst_date + INTERVAL '1 month'
      WHEN p_frequency = 'Quarterly' THEN v_inst_date + INTERVAL '3 months'
      WHEN p_frequency = 'Half-Yearly' THEN v_inst_date + INTERVAL '6 months'
      ELSE v_inst_date + INTERVAL '1 month'
    END;
  END LOOP;
  
  -- Update plot status
  UPDATE plot SET
    status = 'Booked',
    customer_id = p_customer_id,
    customer_name = v_customer.name,
    booking_id = v_booking_id,
    booking_date = CURRENT_DATE,
    sales_executive_id = p_sales_exec_id,
    sales_executive_name = p_sales_exec_name
  WHERE id = p_plot_id;
  
  -- Update customer linked plot/project
  UPDATE customer SET
    linked_plot_id = p_plot_id,
    linked_plot_number = v_plot.plot_number,
    linked_project_id = p_project_id,
    linked_project_name = v_project.project_name,
    total_plot_value = p_total_price,
    total_discount = p_discount,
    total_due = v_net_price - p_booking_money
  WHERE id = p_customer_id;
  
  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_number', v_booking_number,
    'net_price', v_net_price,
    'installments', v_num_installments,
    'installment_amount', v_inst_amount
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Generate unique receipt number
-- ============================================================
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'THL-MR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('receipt_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_booking_updated_at
  BEFORE UPDATE ON booking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_installment_updated_at
  BEFORE UPDATE ON installment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 007: Double-Entry Accounting
-- ============================================================

-- ============================================================
-- ACCOUNT: Chart of Accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS account (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code    TEXT UNIQUE NOT NULL,              -- e.g. 1001, 2001, 4001
  account_name    TEXT NOT NULL,
  account_type    TEXT NOT NULL
                    CHECK (account_type IN ('Asset','Liability','Equity','Revenue','Expense')),
  parent_id       UUID REFERENCES account(id) ON DELETE SET NULL,
  is_header       BOOLEAN NOT NULL DEFAULT FALSE,    -- header/group accounts don't post directly
  description     TEXT,
  opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_type ON account(account_type, is_active);
CREATE INDEX IF NOT EXISTS idx_account_code ON account(account_code);

-- ============================================================
-- JOURNAL_ENTRY: Voucher header
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number  TEXT UNIQUE NOT NULL,              -- e.g. THL-JV-2026-0001
  voucher_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  voucher_type    TEXT NOT NULL DEFAULT 'General'
                    CHECK (voucher_type IN ('General','Payment','Receipt','Contra','Journal')),
  reference_type  TEXT,                              -- e.g. 'booking', 'payment', 'expense'
  reference_id    UUID,                              -- FK to relevant record
  narration       TEXT NOT NULL,
  total_debit     NUMERIC(18,2) NOT NULL,
  total_credit    NUMERIC(18,2) NOT NULL,
  is_posted       BOOLEAN NOT NULL DEFAULT FALSE,
  is_reversed     BOOLEAN NOT NULL DEFAULT FALSE,
  reversal_of_id  UUID REFERENCES journal_entry(id) ON DELETE SET NULL,
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_balanced CHECK (total_debit = total_credit)
);

CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entry(voucher_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_reference ON journal_entry(reference_type, reference_id);

-- ============================================================
-- JOURNAL_ENTRY_LINE: Voucher line items
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entry_line (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id      UUID NOT NULL REFERENCES journal_entry(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES account(id) ON DELETE RESTRICT,
  account_code    TEXT NOT NULL,
  account_name    TEXT NOT NULL,
  debit_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
  narration       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (debit_amount >= 0 AND credit_amount >= 0),
  CHECK (NOT (debit_amount > 0 AND credit_amount > 0))  -- can't have both
);

CREATE INDEX IF NOT EXISTS idx_journal_line_account ON journal_entry_line(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_line_journal ON journal_entry_line(journal_id);

-- ============================================================
-- LEDGER: Running account balances (materialized/denormalized)
-- ============================================================
CREATE TABLE IF NOT EXISTS ledger_entry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES account(id) ON DELETE RESTRICT,
  journal_line_id UUID NOT NULL REFERENCES journal_entry_line(id) ON DELETE RESTRICT,
  journal_id      UUID NOT NULL REFERENCES journal_entry(id) ON DELETE RESTRICT,
  entry_date      DATE NOT NULL,
  debit_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
  running_balance NUMERIC(18,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_account_date ON ledger_entry(account_id, entry_date DESC);

-- Voucher number sequence
CREATE SEQUENCE IF NOT EXISTS voucher_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_voucher_number(prefix TEXT DEFAULT 'JV')
RETURNS TEXT AS $$
BEGIN
  RETURN 'THL-' || prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('voucher_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_journal_updated_at
  BEFORE UPDATE ON journal_entry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 008: Operations â€” Expenses, Vendors, Purchases,
--                Land Acquisition, Site Development
-- ============================================================

-- ============================================================
-- EXPENSE
-- ============================================================
CREATE TABLE IF NOT EXISTS expense (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_code    TEXT UNIQUE NOT NULL,
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  category        TEXT NOT NULL
                    CHECK (category IN ('Office','Rent','Salary','Marketing','Advertising',
                           'Transport','Site Development','Land','Legal','Utilities',
                           'Security','Maintenance','Other')),
  description     TEXT NOT NULL,
  project_id      UUID REFERENCES project(id) ON DELETE SET NULL,
  project_name    TEXT,
  vendor_id       UUID,                              -- ref to vendor
  vendor_name     TEXT,
  amount          NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  payment_method  TEXT NOT NULL DEFAULT 'Cash',
  bank_name       TEXT,
  cheque_or_txn_no TEXT,
  attachment_path TEXT,                              -- Supabase Storage path
  status          TEXT NOT NULL DEFAULT 'Approved'
                    CHECK (status IN ('Pending','Approved','Rejected','Paid')),
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_date ON expense(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_project ON expense(project_id);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expense(category);

-- ============================================================
-- VENDOR
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code     TEXT UNIQUE NOT NULL,
  vendor_name     TEXT NOT NULL,
  contact_person  TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  trade_license   TEXT,
  category        TEXT,
  bank_name       TEXT,
  bank_account    TEXT,
  total_billed    NUMERIC(18,2) DEFAULT 0,
  total_paid      NUMERIC(18,2) DEFAULT 0,
  total_due       NUMERIC(18,2) GENERATED ALWAYS AS (total_billed - total_paid) STORED,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PURCHASE
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_no TEXT UNIQUE NOT NULL,
  vendor_id         UUID REFERENCES vendor(id) ON DELETE SET NULL,
  vendor_name       TEXT,
  project_id        UUID REFERENCES project(id) ON DELETE SET NULL,
  project_name      TEXT,
  material_name     TEXT NOT NULL,
  quantity          NUMERIC(10,3) NOT NULL,
  unit              TEXT,
  unit_price        NUMERIC(18,2) NOT NULL,
  total_amount      NUMERIC(18,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  invoice_no        TEXT,
  invoice_date      DATE,
  paid_amount       NUMERIC(18,2) DEFAULT 0,
  due_amount        NUMERIC(18,2) GENERATED ALWAYS AS (quantity * unit_price - paid_amount) STORED,
  attachment_path   TEXT,
  status            TEXT NOT NULL DEFAULT 'Pending'
                      CHECK (status IN ('Pending','Received','Partial','Completed','Cancelled')),
  created_by        TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LAND_OWNER: Land sellers
-- ============================================================
CREATE TABLE IF NOT EXISTS land_owner (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_code      TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  father_name     TEXT,
  nid             TEXT,
  mobile          TEXT,
  address         TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LAND_PARCEL: Land acquisition records
-- ============================================================
CREATE TABLE IF NOT EXISTS land_parcel (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_code     TEXT UNIQUE NOT NULL,
  project_id      UUID REFERENCES project(id) ON DELETE SET NULL,
  owner_id        UUID REFERENCES land_owner(id) ON DELETE SET NULL,
  owner_name      TEXT,
  mouza           TEXT,
  khatian_no      TEXT,
  dag_no          TEXT,
  area_katha      NUMERIC(10,4),
  area_decimal    NUMERIC(10,4),
  price_per_katha NUMERIC(18,2),
  total_price     NUMERIC(18,2),
  advance_paid    NUMERIC(18,2) DEFAULT 0,
  total_paid      NUMERIC(18,2) DEFAULT 0,
  total_due       NUMERIC(18,2),
  legal_vetting   BOOLEAN DEFAULT FALSE,
  mutation_done   BOOLEAN DEFAULT FALSE,
  registration_done BOOLEAN DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'Negotiation'
                    CHECK (status IN ('Negotiation','Advance Paid','Agreement','Deed Executed','Registered','Completed')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LAND_PAYMENT: Payments to land sellers
-- ============================================================
CREATE TABLE IF NOT EXISTS land_payment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id       UUID NOT NULL REFERENCES land_parcel(id) ON DELETE RESTRICT,
  payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  amount          NUMERIC(18,2) NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'Cash',
  purpose         TEXT,
  remarks         TEXT,
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SITE_DEVELOPMENT: Infrastructure work tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS site_development (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_code        TEXT UNIQUE NOT NULL,
  project_id      UUID NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  work_type       TEXT NOT NULL
                    CHECK (work_type IN ('Earth Filling','Road','Drainage','Boundary Wall',
                           'Mosque','Solar Lighting','Gate','Landscaping','Utilities','Other')),
  description     TEXT,
  vendor_id       UUID REFERENCES vendor(id) ON DELETE SET NULL,
  vendor_name     TEXT,
  budget          NUMERIC(18,2) DEFAULT 0,
  actual_cost     NUMERIC(18,2) DEFAULT 0,
  paid_amount     NUMERIC(18,2) DEFAULT 0,
  progress_pct    INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  start_date      DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  status          TEXT NOT NULL DEFAULT 'Planned'
                    CHECK (status IN ('Planned','In Progress','Completed','On Hold','Cancelled')),
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 009: HR, Payroll, Commission, Transfer, Refund
-- ============================================================

-- ============================================================
-- EMPLOYEE (HR module - extends hr_employee)
-- ============================================================
CREATE TABLE IF NOT EXISTS hr_employee_detail (
  employee_id     UUID PRIMARY KEY REFERENCES hr_employee(employee_id) ON DELETE CASCADE,
  nid             TEXT,
  dob             DATE,
  blood_group     TEXT,
  emergency_contact TEXT,
  address         TEXT,
  bank_name       TEXT,
  bank_account    TEXT,
  base_salary     NUMERIC(18,2) DEFAULT 0,
  house_rent      NUMERIC(18,2) DEFAULT 0,
  medical         NUMERIC(18,2) DEFAULT 0,
  transport       NUMERIC(18,2) DEFAULT 0,
  gross_salary    NUMERIC(18,2) GENERATED ALWAYS AS (base_salary + house_rent + medical + transport) STORED,
  avatar_path     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES hr_employee(employee_id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in        TIME,
  check_out       TIME,
  status          TEXT NOT NULL DEFAULT 'Present'
                    CHECK (status IN ('Present','Absent','Half Day','Late','Leave','Holiday')),
  remarks         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, attendance_date)
);

-- ============================================================
-- LEAVE_REQUEST
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_request (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES hr_employee(employee_id) ON DELETE CASCADE,
  leave_type      TEXT NOT NULL
                    CHECK (leave_type IN ('Annual','Sick','Casual','Maternity','Paternity','Without Pay','Other')),
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  days            INTEGER GENERATED ALWAYS AS (to_date - from_date + 1) STORED,
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Approved','Rejected','Cancelled')),
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYROLL: Monthly salary sheet
-- ============================================================
CREATE TABLE IF NOT EXISTS payroll (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_month   TEXT NOT NULL,                     -- e.g. '2026-08'
  employee_id     UUID NOT NULL REFERENCES hr_employee(employee_id) ON DELETE RESTRICT,
  employee_name   TEXT NOT NULL,
  employee_code   TEXT NOT NULL,
  base_salary     NUMERIC(18,2) NOT NULL DEFAULT 0,
  house_rent      NUMERIC(18,2) NOT NULL DEFAULT 0,
  medical         NUMERIC(18,2) NOT NULL DEFAULT 0,
  transport       NUMERIC(18,2) NOT NULL DEFAULT 0,
  gross_salary    NUMERIC(18,2) NOT NULL DEFAULT 0,
  bonus           NUMERIC(18,2) NOT NULL DEFAULT 0,
  advance_deduction NUMERIC(18,2) NOT NULL DEFAULT 0,
  other_deduction NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_deduction   NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_salary      NUMERIC(18,2) NOT NULL DEFAULT 0,
  payment_method  TEXT DEFAULT 'Bank Transfer',
  payment_date    DATE,
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Approved','Paid','Cancelled')),
  approved_by     TEXT,
  processed_by    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payroll_month, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll(payroll_month);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);

-- ============================================================
-- COMMISSION: Sales commission tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS commission (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES booking(id) ON DELETE RESTRICT,
  employee_id     UUID NOT NULL REFERENCES hr_employee(employee_id) ON DELETE RESTRICT,
  employee_name   TEXT NOT NULL,
  commission_type TEXT NOT NULL DEFAULT 'Sales'
                    CHECK (commission_type IN ('Sales','Referral','Team Lead','Management')),
  sale_amount     NUMERIC(18,2) NOT NULL,
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(18,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Approved','Paid','Cancelled')),
  paid_at         TIMESTAMPTZ,
  approved_by     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRANSFER: Plot ownership transfer
-- ============================================================
CREATE TABLE IF NOT EXISTS transfer (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_code   TEXT UNIQUE NOT NULL,
  booking_id      UUID NOT NULL REFERENCES booking(id) ON DELETE RESTRICT,
  plot_id         UUID NOT NULL REFERENCES plot(id) ON DELETE RESTRICT,
  from_customer_id UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  from_customer_name TEXT NOT NULL,
  to_customer_id  UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  to_customer_name TEXT NOT NULL,
  transfer_fee    NUMERIC(18,2) NOT NULL DEFAULT 0,
  transfer_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Approved','Completed','Rejected')),
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REFUND: Booking cancellation and refund
-- ============================================================
CREATE TABLE IF NOT EXISTS refund (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_code     TEXT UNIQUE NOT NULL,
  booking_id      UUID NOT NULL REFERENCES booking(id) ON DELETE RESTRICT,
  customer_id     UUID NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
  customer_name   TEXT NOT NULL,
  plot_id         UUID NOT NULL REFERENCES plot(id) ON DELETE RESTRICT,
  total_paid      NUMERIC(18,2) NOT NULL,
  cancellation_charge NUMERIC(18,2) NOT NULL DEFAULT 0,
  refund_amount   NUMERIC(18,2) GENERATED ALWAYS AS (total_paid - cancellation_charge) STORED,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Approved','Processed','Rejected')),
  refund_method   TEXT DEFAULT 'Bank Transfer',
  refund_date     DATE,
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  processed_by    TEXT,
  created_by      TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
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
  ('currency_symbol',       'à§³',                                  'Currency symbol'),
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
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 011: Performance Indexes
-- ============================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_info_email ON user_info(email);
CREATE INDEX IF NOT EXISTS idx_user_info_mobile ON user_info(mobile);
CREATE INDEX IF NOT EXISTS idx_user_info_employee_code ON user_info(employee_code);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customer_name_search ON customer USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_customer_status ON customer(status, is_active);
CREATE INDEX IF NOT EXISTS idx_customer_project ON customer(linked_project_id);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_booking_created ON booking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_project ON booking(project_id);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_method ON payment(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_voided ON payment(is_voided);

-- Receipt indexes
CREATE INDEX IF NOT EXISTS idx_receipt_cancelled ON receipt(is_cancelled);
CREATE INDEX IF NOT EXISTS idx_receipt_created ON receipt(created_at DESC);

-- Plot indexes
CREATE INDEX IF NOT EXISTS idx_plot_project ON plot(project_id);
CREATE INDEX IF NOT EXISTS idx_plot_block ON plot(block_id);
CREATE INDEX IF NOT EXISTS idx_plot_number_text ON plot(plot_number);

-- Lead indexes
CREATE INDEX IF NOT EXISTS idx_lead_created ON lead(created_at DESC);

-- Expense indexes
CREATE INDEX IF NOT EXISTS idx_expense_created ON expense(created_at DESC);

-- Journal indexes
CREATE INDEX IF NOT EXISTS idx_journal_posted ON journal_entry(is_posted, voucher_date DESC);

-- Audit log index
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action, created_at DESC);
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 012: Seed Data â€” Roles, Modules, Menus, Permissions
-- ============================================================

-- ============================================================
-- SEED: ERP Roles
-- ============================================================
INSERT INTO user_roles (role_name, description, is_system) VALUES
  ('Super Admin',     'Full unrestricted system access. Bypasses all permission guards.',          TRUE),
  ('System Admin',    'User/role management and system configuration. No financial operations.',   TRUE),
  ('CEO / Director',  'Full operational oversight, financial approvals and report generation.',    FALSE),
  ('General Manager', 'Cross-department oversight and operational approvals.',                     FALSE),
  ('Accounts Manager','Journal vouchers, payment vouchers, reconciliations and balance sheets.',  FALSE),
  ('Account Officer', 'Payment recording, receipt generation and expense entry.',                 FALSE),
  ('Sales Manager',   'Customer booking approval, commission approval and lead assignment.',       FALSE),
  ('Sales Executive', 'Lead prospecting, customer registration and site visit bookings.',          FALSE),
  ('Marketing',       'Lead management and CRM activities.',                                      FALSE),
  ('HR Manager',      'Employee directory, organogram, payroll approval.',                        FALSE),
  ('HR Officer',      'Attendance, leave management and payroll entry.',                          FALSE),
  ('Project Manager', 'Project and site development management.',                                 FALSE),
  ('Read Only',       'View-only access. No create/edit/delete permissions.',                     FALSE)
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================
-- SEED: ERP Modules
-- ============================================================
INSERT INTO user_module (module_key, module_name, description, sort_order) VALUES
  ('dashboard',     'Executive Dashboard',    'CEO/Executive dashboard with KPIs and charts',  1),
  ('projects',      'Project Management',     'Real estate project portfolio management',      2),
  ('inventory',     'Plot Inventory',         'Plot status, pricing, and availability',        3),
  ('crm',           'CRM & Leads',            'Customer relationship and lead management',     4),
  ('customers',     'Customer Management',    'Customer profiles, ledger, and 360 view',       5),
  ('bookings',      'Bookings',               'Plot booking workflows',                        6),
  ('installments',  'Installments',           'Installment schedule management',               7),
  ('collections',   'Collections',            'Payment collection and receipts',               8),
  ('dues',          'Dues & Overdue',         'Overdue tracking and reminders',                9),
  ('sales',         'Sales & Commission',     'Sales tracking and commission management',      10),
  ('accounting',    'General Accounting',     'Chart of accounts, journal vouchers, ledger',   11),
  ('expenses',      'Expense Management',     'Office and project expense tracking',           12),
  ('land',          'Land Acquisition',       'Land purchase and seller ledger',               13),
  ('vendors',       'Vendors & Purchases',    'Vendor management and purchase orders',         14),
  ('development',   'Site Development',       'Infrastructure and development tracking',       15),
  ('hr',            'HR & Payroll',           'Employee management and payroll',               16),
  ('transfers',     'Plot Transfers',         'Plot ownership transfer workflows',             17),
  ('refunds',       'Refunds & Cancellations','Booking cancellation and refund processing',    18),
  ('documents',     'Document Management',    'Customer and project document storage',         19),
  ('reports',       'Reports & Analytics',    'Executive reports and data exports',            20),
  ('notifications', 'Notifications',          'In-app notification management',               21),
  ('users',         'User Management',        'ERP user accounts and access control',         22),
  ('roles',         'Role Management',        'Role definitions and permission templates',     23),
  ('permissions',   'Permission Management',  'Module, menu and action permission matrix',    24),
  ('designations',  'Designations',           'Employee designation and organogram',           25),
  ('audit',         'Audit Trail',            'System audit log and activity history',        26),
  ('server',        'Server Monitor',         'API, database and system health monitoring',   27),
  ('backup',        'Backup & Recovery',      'Database backup and restore management',        28),
  ('settings',      'System Settings',        'Company profile and system configuration',     29)
ON CONFLICT (module_key) DO NOTHING;

-- ============================================================
-- SEED: ERP Menus
-- ============================================================
INSERT INTO user_menu (menu_key, menu_name, module_key, route, icon_name, sort_order, permission_key) VALUES
  ('dashboard.main',              'Dashboard',              'dashboard',     '/dashboard',          'LayoutDashboard',   1,  'dashboard'),
  ('projects.list',               'Projects',               'projects',      '/projects',           'Building2',         2,  'projects'),
  ('inventory.map',               'Plot Inventory',         'inventory',     '/inventory',          'Map',               3,  'inventory'),
  ('crm.leads',                   'Leads',                  'crm',           '/leads',              'UserPlus',          4,  'leads'),
  ('crm.site-visits',             'Site Visits',            'crm',           '/site-visits',        'MapPin',            5,  'site-visits'),
  ('customers.list',              'Customers',              'customers',     '/customers',          'Users',             6,  'customers'),
  ('bookings.wizard',             'New Booking',            'bookings',      '/bookings',           'FileCheck',         7,  'bookings'),
  ('installments.list',           'Installments',           'installments',  '/installments',       'Calendar',          8,  'installments'),
  ('collections.payments',        'Collections',            'collections',   '/collections',        'CreditCard',        9,  'collections'),
  ('dues.overdue',                'Dues & Overdue',         'dues',          '/dues',               'AlertCircle',       10, 'dues'),
  ('sales.overview',              'Sales',                  'sales',         '/sales',              'TrendingUp',        11, 'sales'),
  ('accounting.chart',            'Chart of Accounts',      'accounting',    '/accounting/chart',   'BookOpen',          12, 'accounting'),
  ('accounting.journal',          'Journal Voucher',        'accounting',    '/accounting/journal', 'FileText',          13, 'accounting'),
  ('accounting.ledger',           'General Ledger',         'accounting',    '/accounting/ledger',  'List',              14, 'accounting'),
  ('accounting.trial',            'Trial Balance',          'accounting',    '/accounting/trial',   'Scale',             15, 'accounting'),
  ('accounting.pl',               'Profit & Loss',          'accounting',    '/accounting/pl',      'BarChart2',         16, 'accounting'),
  ('accounting.balance',          'Balance Sheet',          'accounting',    '/accounting/balance', 'BarChart3',         17, 'accounting'),
  ('expenses.list',               'Expenses',               'expenses',      '/expenses',           'DollarSign',        18, 'expenses'),
  ('land.parcels',                'Land Acquisition',       'land',          '/land',               'Landmark',          19, 'land'),
  ('vendors.list',                'Vendors',                'vendors',       '/vendors',            'Store',             20, 'vendors'),
  ('development.list',            'Site Development',       'development',   '/development',        'HardHat',           21, 'development'),
  ('hr.employees',                'Employees',              'hr',            '/hr',                 'UserCheck',         22, 'hr'),
  ('hr.payroll',                  'Payroll',                'hr',            '/hr/payroll',         'Banknote',          23, 'hr'),
  ('transfers.list',              'Plot Transfers',         'transfers',     '/transfers',          'ArrowLeftRight',    24, 'transfers'),
  ('refunds.list',                'Refunds',                'refunds',       '/refunds',            'Undo2',             25, 'refunds'),
  ('documents.list',              'Documents',              'documents',     '/documents',          'FolderOpen',        26, 'documents'),
  ('reports.list',                'Reports',                'reports',       '/reports',            'BarChart',          27, 'reports'),
  ('users.list',                  'User Management',        'users',         '/users',              'ShieldCheck',       28, 'users'),
  ('roles.list',                  'Roles',                  'roles',         '/roles',              'Shield',            29, 'roles'),
  ('permissions.matrix',          'Permissions',            'permissions',   '/permissions',        'Key',               30, 'permissions'),
  ('designations.org',            'Organogram',             'designations',  '/organogram',         'Network',           31, 'designations'),
  ('audit.log',                   'Audit Trail',            'audit',         '/audit',              'ClipboardList',     32, 'audit'),
  ('server.monitor',              'Server Monitor',         'server',        '/server-monitor',     'Server',            33, 'server'),
  ('settings.main',               'Settings',               'settings',      '/settings',           'Settings',          34, 'settings')
ON CONFLICT (menu_key) DO NOTHING;

-- ============================================================
-- SEED: Super Admin role gets ALL module access
-- ============================================================
INSERT INTO user_role_module (role_id, module_id)
SELECT r.id, m.id
FROM user_roles r, user_module m
WHERE r.role_name = 'Super Admin'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- ============================================================
-- SEED: Super Admin gets full permissions on all menus
-- ============================================================
INSERT INTO user_role_menu (role_id, menu_id, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_print)
SELECT r.id, m.id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM user_roles r, user_menu m
WHERE r.role_name = 'Super Admin'
ON CONFLICT (role_id, menu_id) DO NOTHING;

-- ============================================================
-- SEED: Demo Project (Tayeeba Smart City)
-- ============================================================
INSERT INTO project (project_code, project_name, location, land_area_katha, total_plots,
  status, launch_date, expected_completion, manager_name, development_budget, description)
VALUES (
  'THL-PRJ-001',
  'Tayeeba Smart City',
  'Ashulia, Savar, Dhaka',
  500,
  150,
  'Ongoing',
  '2024-01-01',
  '2027-12-31',
  'Project Management Team',
  150000000,
  'Premium residential township with modern amenities. 3-5 katha plots in a planned layout.'
) ON CONFLICT (project_code) DO NOTHING;

-- ============================================================
-- SEED: Default Designation Hierarchy
-- ============================================================
INSERT INTO user_designation (name, level, department, description) VALUES
  ('Managing Director',  0, 'Executive',   'Top executive leadership'),
  ('CEO',                1, 'Executive',   'Chief Executive Officer'),
  ('General Manager',    2, 'Management',  'General management oversight'),
  ('Accounts Manager',   3, 'Accounts',    'Head of Accounts Department'),
  ('Account Officer',    4, 'Accounts',    'Junior accounts staff'),
  ('Sales Manager',      3, 'Sales',       'Head of Sales Department'),
  ('Sales Executive',    4, 'Sales',       'Field sales representative'),
  ('HR Manager',         3, 'HR',          'Head of HR Department'),
  ('Project Manager',    3, 'Projects',    'Real estate project lead')
ON CONFLICT DO NOTHING;
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 013: Supabase Storage Buckets & Policies
-- ============================================================

-- Ensure storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- 1. Create Private Storage Buckets for ERP Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'customer-documents',
    'customer-documents',
    FALSE,
    10485760, -- 10 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'project-documents',
    'project-documents',
    FALSE,
    52428800, -- 50 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  ),
  (
    'land-documents',
    'land-documents',
    FALSE,
    52428800, -- 50 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
  ),
  (
    'employee-documents',
    'employee-documents',
    FALSE,
    10485760, -- 10 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
  ),
  (
    'receipts',
    'receipts',
    FALSE,
    10485760, -- 10 MB limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Security Policies
-- Private bucket security: objects can only be accessed via signed URLs or Service Role
CREATE POLICY "Service role full access to storage"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.7
-- Migration 014: Reset Operational Data (Clean Slate for Real Data Entry)
-- Preserves: Users, Roles, RBAC Modules/Menus, Designations, Chart of Accounts
-- Clears: Projects, Plots, Customers, Leads, Bookings, Receipts, Vouchers, Expenses, Land, Payroll
-- ============================================================

BEGIN;

-- 1. Truncate financial and transaction tables
TRUNCATE TABLE 
  receipt,
  payment,
  installment,
  booking,
  journal_entry_line,
  journal_entry,
  expense,
  commission,
  transfer,
  refund,
  site_visit,
  follow_up,
  lead,
  customer_nominee,
  customer,
  plot,
  project_road,
  project_zone,
  project_block,
  project,
  purchase,
  vendor,
  land_payment,
  land_parcel,
  land_owner,
  site_development,
  payroll,
  leave_request,
  attendance,
  document,
  audit_log
CASCADE;

-- 2. Reset Receipt and Voucher Sequences to 1
ALTER SEQUENCE IF EXISTS receipt_number_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS voucher_number_seq RESTART WITH 1;

-- 3. Update System Version in system_settings
INSERT INTO system_settings (key, value, description)
VALUES 
  ('system_version', '2.7.0', 'Tayeeba Housing Ltd. ERP System Version'),
  ('data_status', 'CLEAN_SLATE', 'Ready for live production data input')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value, 
  updated_at = NOW();

COMMIT;
