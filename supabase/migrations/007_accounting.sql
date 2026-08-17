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
