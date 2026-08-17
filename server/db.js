import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'tayeeba_erp.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency & Foreign Keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'thl_salt_2026').digest('hex');
};

// Initialize Database Schema
export const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      permissions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_info (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      employee_code TEXT UNIQUE NOT NULL,
      employee_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('INITIAL', 'ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED', 'DISABLED', 'EXPIRED')),
      is_active INTEGER NOT NULL DEFAULT 1,
      is_locked INTEGER NOT NULL DEFAULT 0,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      roles_json TEXT NOT NULL,
      designation_id TEXT,
      designation_title TEXT,
      department TEXT,
      division TEXT,
      allowed_modules_json TEXT NOT NULL,
      menu_permissions_json TEXT NOT NULL,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_at TEXT,
      activated_at TEXT,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT,
      updated_by TEXT
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      role_name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      menu_permissions_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_menu (
      menu_id TEXT PRIMARY KEY,
      menu_name TEXT NOT NULL,
      module_name TEXT NOT NULL,
      parent_id TEXT,
      route TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      permission_key TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_role_menu (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      menu_id TEXT NOT NULL,
      can_view INTEGER NOT NULL DEFAULT 1,
      can_create INTEGER NOT NULL DEFAULT 0,
      can_edit INTEGER NOT NULL DEFAULT 0,
      can_delete INTEGER NOT NULL DEFAULT 0,
      can_approve INTEGER NOT NULL DEFAULT 0,
      can_export INTEGER NOT NULL DEFAULT 0,
      can_print INTEGER NOT NULL DEFAULT 0,
      assigned_by TEXT NOT NULL,
      assigned_at TEXT NOT NULL,
      FOREIGN KEY(role_id) REFERENCES user_roles(id),
      FOREIGN KEY(menu_id) REFERENCES user_menu(menu_id)
    );

    CREATE TABLE IF NOT EXISTS user_designation (
      designation_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      level INTEGER NOT NULL,
      division TEXT NOT NULL,
      department TEXT NOT NULL,
      section TEXT,
      subsection TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS user_designation_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      employee_code TEXT NOT NULL,
      designation_id TEXT NOT NULL,
      designation_title TEXT NOT NULL,
      department TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      assigned_by TEXT NOT NULL,
      created_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_additional_designation (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      designation_id TEXT NOT NULL,
      designation_title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_login_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      employee_code TEXT NOT NULL,
      user_name TEXT NOT NULL,
      login_time TEXT NOT NULL,
      logout_time TEXT,
      ip_address TEXT NOT NULL,
      device TEXT NOT NULL,
      browser TEXT NOT NULL,
      status TEXT NOT NULL,
      failure_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      location TEXT NOT NULL,
      total_land_area_decimal REAL NOT NULL,
      total_plots INTEGER NOT NULL,
      available_plots_count INTEGER NOT NULL,
      booked_plots_count INTEGER NOT NULL,
      sold_plots_count INTEGER NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      launch_date TEXT,
      expected_completion_date TEXT,
      project_manager TEXT,
      development_budget REAL NOT NULL,
      actual_development_cost REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plots (
      id TEXT PRIMARY KEY,
      plot_number TEXT NOT NULL,
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      block TEXT NOT NULL,
      zone TEXT NOT NULL,
      road TEXT NOT NULL,
      size_katha REAL NOT NULL,
      facing TEXT NOT NULL,
      per_katha_price REAL NOT NULL,
      base_price REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      final_price REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Available', 'Reserved', 'Booked', 'Sold', 'Transferred', 'Cancelled', 'On Hold')),
      customer_id TEXT,
      customer_name TEXT,
      sales_executive_id TEXT,
      sales_executive_name TEXT,
      booking_date TEXT,
      agreement_date TEXT,
      handover_status TEXT DEFAULT 'Pending',
      FOREIGN KEY(project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      father_mother_name TEXT NOT NULL,
      nid TEXT NOT NULL,
      dob TEXT,
      mobile TEXT NOT NULL,
      alt_mobile TEXT,
      email TEXT,
      present_address TEXT,
      permanent_address TEXT,
      profession TEXT,
      nominee_name TEXT,
      nominee_relation TEXT,
      nominee_nid TEXT,
      reference_name TEXT,
      sales_executive_id TEXT,
      sales_executive_name TEXT,
      linked_plot_id TEXT,
      linked_plot_number TEXT,
      linked_project_id TEXT,
      linked_project_name TEXT,
      total_plot_value REAL DEFAULT 0,
      total_paid REAL DEFAULT 0,
      total_discount REAL DEFAULT 0,
      total_due REAL DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      lead_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      source TEXT NOT NULL,
      interested_project_id TEXT,
      interested_project_name TEXT,
      interested_plot_size_katha REAL,
      budget REAL,
      assigned_sales_executive_id TEXT,
      assigned_sales_executive_name TEXT,
      status TEXT NOT NULL,
      follow_up_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_visits (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      customer_id TEXT,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      visit_time TEXT NOT NULL,
      sales_executive_id TEXT,
      sales_executive_name TEXT,
      project_id TEXT,
      project_name TEXT,
      interested_plot_number TEXT,
      remarks TEXT,
      follow_up_date TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      plot_id TEXT NOT NULL,
      plot_number TEXT NOT NULL,
      plot_size_katha REAL NOT NULL,
      total_price REAL NOT NULL,
      discount REAL NOT NULL,
      final_price REAL NOT NULL,
      booking_money REAL NOT NULL,
      down_payment REAL NOT NULL,
      remaining_amount REAL NOT NULL,
      installment_duration_months INTEGER NOT NULL,
      number_of_installments INTEGER NOT NULL,
      frequency TEXT NOT NULL,
      first_installment_date TEXT NOT NULL,
      agreement_date TEXT NOT NULL,
      sales_executive_id TEXT,
      sales_executive_name TEXT,
      booking_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(plot_id) REFERENCES plots(id)
    );

    CREATE TABLE IF NOT EXISTS installments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      installment_number INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      due_amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL,
      payment_date TEXT,
      payment_method TEXT,
      status TEXT NOT NULL CHECK(status IN ('Paid', 'Partially Paid', 'Due', 'Overdue')),
      FOREIGN KEY(booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      receipt_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      plot_id TEXT NOT NULL,
      plot_number TEXT NOT NULL,
      payment_type TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      cheque_or_txn_no TEXT,
      bank_name TEXT,
      date TEXT NOT NULL,
      received_by TEXT NOT NULL,
      authorized_signature TEXT NOT NULL,
      remarks TEXT
    );

    CREATE TABLE IF NOT EXISTS accounts (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
      sub_category TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      voucher_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      reference TEXT,
      description TEXT NOT NULL,
      lines_json TEXT NOT NULL,
      created_by TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      expense_id TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      project_id TEXT,
      project_name TEXT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      vendor_payee TEXT NOT NULL,
      approved_by TEXT NOT NULL,
      created_by TEXT NOT NULL,
      attachment_url TEXT
    );

    CREATE TABLE IF NOT EXISTS land_parcels (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      owner_phone TEXT NOT NULL,
      owner_nid TEXT NOT NULL,
      land_area_decimal REAL NOT NULL,
      mouza TEXT NOT NULL,
      dag_number TEXT NOT NULL,
      khatian_number TEXT NOT NULL,
      land_type TEXT NOT NULL,
      land_price REAL NOT NULL,
      paid_amount REAL NOT NULL,
      due_amount REAL NOT NULL,
      registration_cost REAL NOT NULL,
      legal_cost REAL NOT NULL,
      development_cost REAL NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_sequence (
      key_name TEXT PRIMARY KEY,
      current_value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      created_at TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      backup_type TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Initialize receipt counter sequence
  const seqCheck = db.prepare(`SELECT current_value FROM system_sequence WHERE key_name = 'receipt_seq'`).get();
  if (!seqCheck) {
    db.prepare(`INSERT INTO system_sequence (key_name, current_value) VALUES ('receipt_seq', 1000)`).run();
  }

  // Seed default Super Admin user if not exists
  const adminCheck = db.prepare(`SELECT user_id FROM user_info WHERE user_id = 'THL-EMP-00001'`).get();
  if (!adminCheck) {
    const adminHash = hashPassword('Admin@12345');
    db.prepare(`
      INSERT INTO user_info (
        id, user_id, employee_code, employee_id, display_name, email, mobile, password_hash,
        status, is_active, is_locked, must_change_password, roles_json, designation_title,
        department, division, allowed_modules_json, menu_permissions_json, created_at, created_by
      ) VALUES (
        'USER-001', 'THL-EMP-00001', 'THL-EMP-00001', 'EMP-001', 'Al-Haj Engr. Tayeebur Rahman', 'admin@tayeebahousing.com',
        '+880 1711-000001', ?, 'ACTIVE', 1, 0, 0,
        '["SUPER ADMIN"]', 'Managing Director & CEO', 'Executive', 'Management',
        '["ALL"]', '{"*":{"view":true,"create":true,"edit":true,"delete":true,"approve":true,"export":true,"print":true}}',
        datetime('now'), 'SYSTEM'
      )
    `).run(adminHash);

    // Seed Accounts User
    const acctHash = hashPassword('Acct@12345');
    db.prepare(`
      INSERT INTO user_info (
        id, user_id, employee_code, employee_id, display_name, email, mobile, password_hash,
        status, is_active, is_locked, must_change_password, roles_json, designation_title,
        department, division, allowed_modules_json, menu_permissions_json, created_at, created_by
      ) VALUES (
        'USER-002', 'THL-EMP-00021', 'THL-EMP-00021', 'EMP-002', 'Mahmudul Hasan (Accounts)', 'accounts@tayeebahousing.com',
        '+880 1812-334455', ?, 'ACTIVE', 1, 0, 0,
        '["ACCOUNTS MANAGER"]', 'Senior Accounts Manager', 'Accounts & Finance', 'Operations',
        '["accounting","expenses","collections","dues","vendors","reports"]',
        '{"accounting":{"view":true,"create":true,"edit":true,"delete":false,"approve":true,"export":true,"print":true},"collections":{"view":true,"create":true,"edit":true,"delete":false,"approve":true,"export":true,"print":true}}',
        datetime('now'), 'THL-EMP-00001'
      )
    `).run(acctHash);

    // Seed Sales Executive User
    const salesHash = hashPassword('Sales@12345');
    db.prepare(`
      INSERT INTO user_info (
        id, user_id, employee_code, employee_id, display_name, email, mobile, password_hash,
        status, is_active, is_locked, must_change_password, roles_json, designation_title,
        department, division, allowed_modules_json, menu_permissions_json, created_at, created_by
      ) VALUES (
        'USER-003', 'THL-EMP-00045', 'THL-EMP-00045', 'EMP-003', 'Rashidul Islam (Sales)', 'sales@tayeebahousing.com',
        '+880 1913-998877', ?, 'ACTIVE', 1, 0, 0,
        '["SALES EXECUTIVE"]', 'Senior Sales Executive', 'Sales & Marketing', 'Operations',
        '["dashboard","projects","inventory","crm","bookings","installments","collections","dues","sales"]',
        '{"crm":{"view":true,"create":true,"edit":true,"delete":false,"approve":false,"export":true,"print":true},"bookings":{"view":true,"create":true,"edit":false,"delete":false,"approve":false,"export":true,"print":true}}',
        datetime('now'), 'THL-EMP-00001'
      )
    `).run(salesHash);
  }
};

// ATOMIC TRANSACTION: BOOK PLOT MUTEX LOCK
export const bookPlotAtomic = db.transaction((bookingData) => {
  // 1. Lock & check Plot status
  const plot = db.prepare(`SELECT status, plot_number, base_price, size_katha FROM plots WHERE id = ?`).get(bookingData.plotId);
  if (!plot) {
    throw new Error(`Plot ID ${bookingData.plotId} not found.`);
  }

  if (plot.status !== 'Available') {
    throw new Error(`CONFLICT: Plot ${plot.plot_number} is no longer available! Status: ${plot.status}. Booked by another user on the network.`);
  }

  // 2. Fetch Customer & Project
  const customer = db.prepare(`SELECT name, customer_id FROM customers WHERE id = ?`).get(bookingData.customerId);
  const project = db.prepare(`SELECT name, code FROM projects WHERE id = ?`).get(bookingData.projectId);

  if (!customer || !project) {
    throw new Error('Customer or Project record missing.');
  }

  // 3. Atomically Increment & Fetch Receipt Counter
  db.prepare(`UPDATE system_sequence SET current_value = current_value + 1 WHERE key_name = 'receipt_seq'`).run();
  const seqObj = db.prepare(`SELECT current_value FROM system_sequence WHERE key_name = 'receipt_seq'`).get();
  const receiptNum = `THL-MR-2026-${seqObj.current_value}`;

  const bookingNum = `THL-BK-2026-${Math.floor(100 + Math.random() * 900)}`;
  const bookingId = `BKG-${Date.now()}`;
  const finalPrice = bookingData.totalPrice - bookingData.discount;
  const remainingForInstallments = finalPrice - (bookingData.bookingMoney + bookingData.downPayment);

  // 4. Update Plot Status to 'Booked'
  db.prepare(`
    UPDATE plots 
    SET status = 'Booked', customer_id = ?, customer_name = ?, sales_executive_id = ?, sales_executive_name = ?, booking_date = ?, final_price = ?
    WHERE id = ?
  `).run(
    customer.id, customer.name, bookingData.salesExecutiveId, bookingData.salesExecutiveName, 
    new Date().toISOString().split('T')[0], finalPrice, bookingData.plotId
  );

  // 5. Insert Booking Record
  db.prepare(`
    INSERT INTO bookings (
      id, booking_number, customer_id, customer_name, project_id, project_name, plot_id, plot_number,
      plot_size_katha, total_price, discount, final_price, booking_money, down_payment, remaining_amount,
      installment_duration_months, number_of_installments, frequency, first_installment_date, agreement_date,
      sales_executive_id, sales_executive_name, booking_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
  `).run(
    bookingId, bookingNum, customer.id, customer.name, project.id, project.name, bookingData.plotId, plot.plot_number,
    plot.size_katha, bookingData.totalPrice, bookingData.discount, finalPrice, bookingData.bookingMoney, bookingData.downPayment, remainingForInstallments,
    bookingData.durationMonths, Math.ceil(bookingData.durationMonths / (bookingData.frequency === 'Monthly' ? 1 : 3)), bookingData.frequency,
    bookingData.firstInstallmentDate, new Date().toISOString().split('T')[0], bookingData.salesExecutiveId, bookingData.salesExecutiveName,
    new Date().toISOString().split('T')[0]
  );

  // 6. Generate Installment Schedule
  const numInstallments = Math.ceil(bookingData.durationMonths / (bookingData.frequency === 'Monthly' ? 1 : 3));
  const installmentAmount = Math.round(remainingForInstallments / numInstallments);
  const startDate = new Date(bookingData.firstInstallmentDate);

  const insertInsStmt = db.prepare(`
    INSERT INTO installments (id, booking_id, installment_number, due_date, due_amount, paid_amount, remaining_amount, status)
    VALUES (?, ?, ?, ?, ?, 0, ?, 'Due')
  `);

  for (let i = 1; i <= numInstallments; i++) {
    const dueDateObj = new Date(startDate);
    dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1) * (bookingData.frequency === 'Monthly' ? 1 : 3));
    const insDueAmt = i === numInstallments ? remainingForInstallments - (installmentAmount * (numInstallments - 1)) : installmentAmount;

    insertInsStmt.run(`INS-${Date.now()}-${i}`, bookingId, i, dueDateObj.toISOString().split('T')[0], insDueAmt, insDueAmt);
  }

  // 7. Generate Payment Receipt for Booking Money
  db.prepare(`
    INSERT INTO receipts (id, receipt_number, customer_id, customer_name, project_id, project_name, plot_id, plot_number, payment_type, amount, payment_method, date, received_by, authorized_signature, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booking Money', ?, 'Cash', ?, 'Accounts Officer', 'Signed', 'Booking Money Received')
  `).run(`RCP-${Date.now()}`, receiptNum, customer.id, customer.name, project.id, project.name, bookingData.plotId, plot.plot_number, bookingData.bookingMoney, new Date().toISOString().split('T')[0]);

  // 8. Update Accounts Balances
  db.prepare(`UPDATE accounts SET balance = balance + ? WHERE code = '1010'`).run(bookingData.bookingMoney);
  db.prepare(`UPDATE accounts SET balance = balance + ? WHERE code = '4010'`).run(finalPrice);

  // 9. Write Audit Log
  db.prepare(`
    INSERT INTO audit_logs (id, user_name, user_role, date, time, action, module, record_id, old_value, new_value, ip_address)
    VALUES (?, 'LAN User', 'Sales Executive', ?, ?, 'Atomic Plot Booking', 'Bookings', ?, 'Available', ?)
  `).run(
    `LOG-${Date.now()}`, new Date().toISOString().split('T')[0], new Date().toLocaleTimeString(), bookingNum,
    `Plot ${plot.plot_number} booked for ${customer.name}. Receipt: ${receiptNum}`
  );

  return { bookingId, bookingNum, receiptNum, finalPrice };
});

export default db;
