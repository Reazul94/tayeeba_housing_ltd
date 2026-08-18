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
