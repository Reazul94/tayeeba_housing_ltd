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
