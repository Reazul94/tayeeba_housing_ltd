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
