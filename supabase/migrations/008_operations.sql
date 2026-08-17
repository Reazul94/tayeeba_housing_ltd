-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 008: Operations — Expenses, Vendors, Purchases,
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
