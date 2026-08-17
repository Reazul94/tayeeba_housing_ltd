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
