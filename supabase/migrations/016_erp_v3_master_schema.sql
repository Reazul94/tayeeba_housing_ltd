-- ============================================================
-- MIGRATION 016: TAYEEBA HOUSING LTD. ERP v3.0 MASTER SCHEMA
-- PLOT DISTRIBUTIONS, COMMISSIONS, REFUNDS & REVERSALS
-- ============================================================

-- 1. DIRECTOR PLOT DISTRIBUTION TABLE
CREATE TABLE IF NOT EXISTS director_plot_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    director_name VARCHAR(150) NOT NULL,
    director_code VARCHAR(50),
    project_id UUID REFERENCES project(id) ON DELETE SET NULL,
    project_name VARCHAR(150) NOT NULL,
    block VARCHAR(50) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    plot_size NUMERIC(10, 2) NOT NULL,
    size_unit VARCHAR(20) DEFAULT 'Katha',
    booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name VARCHAR(150),
    booking_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Allotted',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLIENT PLOT DISTRIBUTION TABLE
CREATE TABLE IF NOT EXISTS client_plot_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(150) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    project_id UUID REFERENCES project(id) ON DELETE SET NULL,
    project_name VARCHAR(150) NOT NULL,
    block VARCHAR(50) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    plot_size NUMERIC(10, 2) NOT NULL,
    size_unit VARCHAR(20) DEFAULT 'Katha',
    booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    booking_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    installment_status VARCHAR(50) NOT NULL DEFAULT 'REGULAR',
    sales_executive VARCHAR(150) NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INSTALLMENT COMMISSION TABLE
CREATE TABLE IF NOT EXISTS installment_commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_code VARCHAR(50) UNIQUE NOT NULL,
    commission_type VARCHAR(20) NOT NULL DEFAULT 'ONE_TIME', -- ONE_TIME or MONTHLY
    customer_id UUID REFERENCES customer(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    project_id UUID REFERENCES project(id) ON DELETE SET NULL,
    project_name VARCHAR(150) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    booking_id UUID REFERENCES booking(id) ON DELETE SET NULL,
    booking_no VARCHAR(50) NOT NULL,
    installment_no INTEGER,
    sales_executive_id UUID REFERENCES hr_employee(id) ON DELETE SET NULL,
    sales_executive_name VARCHAR(150) NOT NULL,
    collection_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    commission_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
    rate_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    commission_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    month VARCHAR(20),
    year INTEGER,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(150),
    paid_date DATE,
    payment_method VARCHAR(50),
    voucher_no VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COMMISSION REFUND TABLE
CREATE TABLE IF NOT EXISTS commission_refund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_code VARCHAR(50) UNIQUE NOT NULL,
    original_commission_id UUID REFERENCES installment_commission(id) ON DELETE SET NULL,
    commission_code VARCHAR(50) NOT NULL,
    commission_type VARCHAR(50) NOT NULL,
    sales_executive_id UUID REFERENCES hr_employee(id) ON DELETE SET NULL,
    sales_executive_name VARCHAR(150) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    original_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    refund_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(150),
    journal_entry_id UUID REFERENCES journal_entry(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BOOKING COMMISSION TABLE
CREATE TABLE IF NOT EXISTS booking_commission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_commission_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id UUID REFERENCES booking(id) ON DELETE SET NULL,
    booking_no VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    sales_executive_id UUID REFERENCES hr_employee(id) ON DELETE SET NULL,
    sales_executive_name VARCHAR(150) NOT NULL,
    booking_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_sale_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    commission_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
    rate_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    commission_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(150),
    paid_date DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BOOKING COMMISSION REFUND TABLE
CREATE TABLE IF NOT EXISTS booking_commission_refund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_code VARCHAR(50) UNIQUE NOT NULL,
    original_booking_commission_id UUID REFERENCES booking_commission(id) ON DELETE SET NULL,
    booking_commission_code VARCHAR(50) NOT NULL,
    booking_no VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    sales_executive_name VARCHAR(150) NOT NULL,
    original_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    refund_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(150),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INSTALLMENT REFUND TABLE
CREATE TABLE IF NOT EXISTS installment_refund (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_code VARCHAR(50) UNIQUE NOT NULL,
    original_receipt_id UUID REFERENCES receipt(id) ON DELETE SET NULL,
    receipt_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    installment_no INTEGER NOT NULL DEFAULT 1,
    original_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    refund_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deduction_penalty NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_refund_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    payment_source VARCHAR(20) NOT NULL DEFAULT 'Bank',
    bank_account_id UUID REFERENCES bank_account(id) ON DELETE SET NULL,
    refund_date DATE NOT NULL DEFAULT CURRENT_DATE,
    requested_by VARCHAR(150) NOT NULL,
    approved_by VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    journal_entry_id UUID REFERENCES journal_entry(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_dir_plot_dist_project ON director_plot_distribution(project_name);
CREATE INDEX IF NOT EXISTS idx_client_plot_dist_customer ON client_plot_distribution(customer_id);
CREATE INDEX IF NOT EXISTS idx_inst_commission_exec ON installment_commission(sales_executive_name);
CREATE INDEX IF NOT EXISTS idx_inst_refund_receipt ON installment_refund(receipt_number);
