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
