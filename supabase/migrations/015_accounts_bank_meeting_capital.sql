-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.7
-- Migration 015: Accounts, Bank, Meeting, and Capital Modules
-- Requirement: Sections 127–169 of Master Specification
-- ============================================================

-- ============================================================
-- 1. CASH BOOK TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS cash_book (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_code           TEXT UNIQUE NOT NULL DEFAULT 'CB-MAIN',
  book_name           TEXT NOT NULL DEFAULT 'Main Office Cash Book',
  opening_balance     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  current_balance     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  fiscal_year         TEXT NOT NULL DEFAULT '2026-2027',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_book_transaction (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_book_id        UUID REFERENCES cash_book(id) ON DELETE RESTRICT,
  voucher_no          TEXT UNIQUE NOT NULL,            -- e.g. CV-2026-0001 or CR-2026-0001
  transaction_type    TEXT NOT NULL CHECK (transaction_type IN ('RECEIPT', 'PAYMENT')),
  date                DATE NOT NULL,
  particulars         TEXT NOT NULL,
  account_head        TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'General', -- Customer Collection, Booking, Salary, Office Expense, Site Expense, Land, etc.
  project_id          UUID REFERENCES project(id) ON DELETE SET NULL,
  party_name          TEXT,                            -- Customer, Vendor, Employee, Shareholder
  reference_no        TEXT,                            -- MR No, Cheque No, Expense Slip No
  payment_method      TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Cheque', 'bKash', 'Nagad', 'Rocket', 'Other')),
  debit_amount        NUMERIC(15,2) NOT NULL DEFAULT 0.00,  -- Receipt Amount
  credit_amount       NUMERIC(15,2) NOT NULL DEFAULT 0.00,  -- Payment Amount
  running_balance     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  prepared_by         TEXT NOT NULL DEFAULT 'SYSTEM',
  approved_by         TEXT,
  approval_status     TEXT NOT NULL DEFAULT 'APPROVED' CHECK (approval_status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. BANK MODULE TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_account (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code        TEXT UNIQUE NOT NULL,            -- e.g. BA-IBBL-01
  bank_name           TEXT NOT NULL,                   -- e.g. Islami Bank Bangladesh Ltd.
  branch_name         TEXT NOT NULL,                   -- e.g. Gulshan Branch, Dhaka
  account_name        TEXT NOT NULL,                   -- e.g. Tayeeba Housing Ltd.
  account_number      TEXT NOT NULL,                   -- e.g. 2050123456789012
  account_type        TEXT NOT NULL DEFAULT 'Current' CHECK (account_type IN ('Current', 'Savings', 'SND', 'FDR', 'Other')),
  currency            TEXT NOT NULL DEFAULT 'BDT',
  routing_number      TEXT,
  swift_code          TEXT,
  opening_balance     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  current_balance     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  is_default          BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_transaction (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id     UUID NOT NULL REFERENCES bank_account(id) ON DELETE RESTRICT,
  transaction_id      TEXT UNIQUE NOT NULL,            -- e.g. BT-2026-0001
  transaction_type    TEXT NOT NULL CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'INTEREST', 'BANK_CHARGE')),
  date                DATE NOT NULL,
  particulars         TEXT NOT NULL,
  reference_no        TEXT,                            -- e.g. Deposit Slip, Cheque #, RTGS Ref
  cheque_number       TEXT,
  payment_method      TEXT NOT NULL DEFAULT 'Bank Transfer',
  deposit_amount      NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  withdrawal_amount   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  balance_after       NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  is_reconciled       BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled_at       TIMESTAMPTZ,
  reconciled_by       TEXT,
  created_by          TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_reconciliation (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_no   TEXT UNIQUE NOT NULL,            -- e.g. BR-2026-08
  bank_account_id     UUID NOT NULL REFERENCES bank_account(id) ON DELETE RESTRICT,
  statement_date      DATE NOT NULL,
  book_balance        NUMERIC(15,2) NOT NULL,
  bank_statement_balance NUMERIC(15,2) NOT NULL,
  difference_amount   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status              TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'RECONCILED', 'DISCREPANCY')),
  notes               TEXT,
  performed_by        TEXT NOT NULL,
  approved_by         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. SALARY & DIRECTORS' HONORARIUM TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS salary_sheet (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_code          TEXT UNIQUE NOT NULL,            -- e.g. SAL-2026-08
  month               TEXT NOT NULL,                   -- e.g. '2026-08' or 'August 2026'
  year                INTEGER NOT NULL DEFAULT 2026,
  total_staff_count   INTEGER NOT NULL DEFAULT 0,
  total_gross_salary  NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_deductions    NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_net_payable   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_paid_amount   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  approval_status     TEXT NOT NULL DEFAULT 'PREPARED' CHECK (approval_status IN ('PREPARED', 'REVIEWED', 'APPROVED', 'PAID', 'CANCELLED')),
  prepared_by         TEXT NOT NULL,
  approved_by         TEXT,
  payment_date        DATE,
  payment_method      TEXT DEFAULT 'Bank Transfer',
  bank_account_id     UUID REFERENCES bank_account(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_detail (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_sheet_id     UUID NOT NULL REFERENCES salary_sheet(id) ON DELETE CASCADE,
  employee_id         UUID NOT NULL REFERENCES hr_employee(employee_id) ON DELETE RESTRICT,
  employee_code       TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  department          TEXT NOT NULL,
  designation         TEXT NOT NULL,
  basic_salary        NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  house_rent          NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  medical_allowance   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  conveyance          NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  bonus               NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  overtime_amount     NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  gross_salary        NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  provident_fund      NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  advance_deduction   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  tax_deduction       NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  other_deductions    NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  total_deductions    NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  net_payable         NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  payment_status      TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'HOLD')),
  payment_date        DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS director_honorarium (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  honorarium_code     TEXT UNIQUE NOT NULL,            -- e.g. DH-2026-08-01
  director_name       TEXT NOT NULL,
  director_designation TEXT NOT NULL,                  -- Chairman, Managing Director, Director
  month               TEXT NOT NULL,                   -- e.g. '2026-08'
  year                INTEGER NOT NULL DEFAULT 2026,
  meeting_count       INTEGER DEFAULT 1,
  honorarium_amount   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  tax_deduction       NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  net_amount          NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  approval_status     TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED')),
  voucher_no          TEXT,
  payment_date        DATE,
  payment_method      TEXT DEFAULT 'Bank Transfer',
  bank_account_id     UUID REFERENCES bank_account(id) ON DELETE SET NULL,
  remarks             TEXT,
  approved_by         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. MEETING MODULE TABLES (EC & BOARD MEETINGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_no          TEXT UNIQUE NOT NULL,            -- e.g. ECM-2026-01 or BM-2026-01
  meeting_type        TEXT NOT NULL CHECK (meeting_type IN ('EC_MEETING', 'BOARD_MEETING', 'ANNUAL_GENERAL_MEETING', 'SPECIAL_MEETING')),
  title               TEXT NOT NULL,
  meeting_date        DATE NOT NULL,
  meeting_time        TIME NOT NULL,
  location            TEXT NOT NULL DEFAULT 'Boardroom, Gulshan-2, Dhaka',
  chairperson         TEXT NOT NULL,
  secretary           TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'HELD', 'MINUTES_PENDING', 'APPROVED', 'CANCELLED')),
  agenda_summary      TEXT,
  discussion_notes    TEXT,
  resolutions_text    TEXT,
  minutes_text        TEXT,
  minutes_status      TEXT NOT NULL DEFAULT 'DRAFT' CHECK (minutes_status IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED')),
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ,
  created_by          TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_member (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id          UUID NOT NULL REFERENCES meeting(id) ON DELETE CASCADE,
  member_name         TEXT NOT NULL,
  designation         TEXT NOT NULL,
  role_in_meeting     TEXT NOT NULL DEFAULT 'Member' CHECK (role_in_meeting IN ('Chairperson', 'Member', 'Secretary', 'Invited Guest', 'Observer')),
  attendance_status   TEXT NOT NULL DEFAULT 'PRESENT' CHECK (attendance_status IN ('PRESENT', 'ABSENT', 'LEAVE_OF_ABSENCE', 'ONLINE')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_agenda (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id          UUID NOT NULL REFERENCES meeting(id) ON DELETE CASCADE,
  item_number         INTEGER NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  presenter           TEXT,
  decision_outcome    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_action_item (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id          UUID NOT NULL REFERENCES meeting(id) ON DELETE CASCADE,
  action_code         TEXT UNIQUE NOT NULL,            -- e.g. ACT-2026-001
  title               TEXT NOT NULL,
  description         TEXT,
  responsible_person  TEXT NOT NULL,
  department          TEXT NOT NULL,
  due_date            DATE NOT NULL,
  priority            TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status              TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED')),
  completion_date     DATE,
  remarks             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. CAPITAL MODULE TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS capital_account (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_code    TEXT UNIQUE NOT NULL,            -- e.g. SH-001
  contributor_name    TEXT NOT NULL,
  contributor_type    TEXT NOT NULL DEFAULT 'Shareholder' CHECK (contributor_type IN ('Director', 'Shareholder', 'Sponsor Investor', 'Institutional Partner')),
  nid_or_passport     TEXT,
  phone               TEXT,
  email               TEXT,
  share_percentage    NUMERIC(5,2) DEFAULT 0.00,
  committed_capital   NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  received_capital    NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  due_capital         NUMERIC(15,2) GENERATED ALWAYS AS (committed_capital - received_capital) STORED,
  status              TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID', 'DUE', 'INACTIVE')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capital_transaction (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code    TEXT UNIQUE NOT NULL,            -- e.g. CAP-TXN-2026-0001
  capital_account_id  UUID NOT NULL REFERENCES capital_account(id) ON DELETE RESTRICT,
  contributor_name    TEXT NOT NULL,
  transaction_type    TEXT NOT NULL CHECK (transaction_type IN ('CAPITAL_RECEIVED', 'CAPITAL_ADJUSTMENT', 'CAPITAL_REFUND', 'CAPITAL_TRANSFER', 'DIVIDEND_PAYOUT')),
  date                DATE NOT NULL,
  amount              NUMERIC(15,2) NOT NULL,
  payment_method      TEXT NOT NULL DEFAULT 'Bank Transfer' CHECK (payment_method IN ('Bank Transfer', 'Cheque', 'Pay Order', 'Cash', 'Other')),
  bank_account_id     UUID REFERENCES bank_account(id) ON DELETE SET NULL,
  receipt_voucher_no  TEXT,                            -- e.g. MR-CAP-2026-001
  reference_details   TEXT,
  project_id          UUID REFERENCES project(id) ON DELETE SET NULL,
  remarks             TEXT,
  status              TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REVERSED')),
  approved_by         TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. SYSTEM MODULE & RBAC PERMISSIONS SEEDING
-- ============================================================
INSERT INTO user_module (module_key, module_name, description, icon_name, sort_order)
VALUES 
  ('accounts', 'Accounts & Finance', 'Cash book, daily/monthly receipts, payments, financial statements, and salary', 'Calculator', 12),
  ('bank', 'Bank Management', 'Bank accounts, multi-bank statements, deposits, withdrawals, and reconciliation', 'Landmark', 13),
  ('meetings', 'EC & Board Meetings', 'Executive Committee & Board meetings, agendas, resolutions, minutes, and action items', 'Users', 14),
  ('capital', 'Capital Management', 'Shareholder capital commitments, receipts, due list, and capital ledger', 'DollarSign', 15)
ON CONFLICT (module_key) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  sort_order = EXCLUDED.sort_order;

-- Enable permissions for Super Admin on new modules
INSERT INTO user_role_module_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_print)
SELECT ur.id, m.module_key, true, true, true, true, true, true, true
FROM user_roles ur
CROSS JOIN (
  VALUES ('accounts'), ('bank'), ('meetings'), ('capital')
) AS m(module_key)
WHERE ur.role_name = 'Super Admin'
ON CONFLICT (role_id, module_key) DO UPDATE SET
  can_view = true,
  can_create = true,
  can_edit = true,
  can_delete = true,
  can_approve = true,
  can_export = true,
  can_print = true;
