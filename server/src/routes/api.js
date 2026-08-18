// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: All ERP Resource Routes
// Users, Roles, Employees, Projects, Plots, Customers,
// Leads, Bookings, Payments, Accounting, HR, Documents
// ============================================================

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../db.js';
import { authenticate, requireModule, requireAction } from '../middleware/auth.js';
import { uploadDocument, getSignedUrl } from '../services/storageService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer: in-memory storage for Supabase Storage upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed: ${allowed.join(', ')}`));
    }
  },
});

// ============================================================
// USERS
// ============================================================
router.get('/users', authenticate, requireModule('users'), async (req, res) => {
  try {
    const result = await query(
      `SELECT ui.id, ui.user_id, ui.employee_code, ui.display_name, ui.email, ui.mobile,
              ui.status, ui.is_active, ui.is_locked, ui.must_change_password,
              ui.last_login_at, ui.created_at,
              array_agg(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles
       FROM user_info ui
       LEFT JOIN user_user_role uur ON uur.user_id = ui.id AND uur.is_active = true
       LEFT JOIN user_roles ur ON ur.id = uur.role_id AND ur.is_active = true
       GROUP BY ui.id
       ORDER BY ui.created_at DESC`
    );
    return res.json({ users: result.rows });
  } catch (err) {
    console.error('Get users error:', err.message);
    return res.status(500).json({ error: 'Failed to load users.' });
  }
});

router.post('/users', authenticate, requireModule('users'), async (req, res) => {
  const {
    userId, employeeCode, displayName, email, mobile,
    tempPassword, roles, department, designationTitle,
  } = req.body;

  if (!userId || !displayName || !tempPassword) {
    return res.status(400).json({ error: 'userId, displayName, and tempPassword are required.' });
  }

  try {
    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    await withTransaction(async (client) => {
      // Create user
      const userResult = await client.query(
        `INSERT INTO user_info (user_id, employee_code, display_name, email, mobile, password_hash,
          status, is_active, must_change_password, department, designation_title, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, 'INITIAL', true, true, $7, $8, $9)
         RETURNING id`,
        [userId, employeeCode || userId, displayName, email, mobile, passwordHash,
          department, designationTitle, req.user.userId]
      );
      const newUserId = userResult.rows[0].id;

      // Assign roles
      if (roles && roles.length > 0) {
        for (const roleName of roles) {
          const roleResult = await client.query(
            `SELECT id FROM user_roles WHERE role_name = $1 AND is_active = true`,
            [roleName]
          );
          if (roleResult.rows.length > 0) {
            await client.query(
              `INSERT INTO user_user_role (user_id, role_id, assigned_by) VALUES ($1, $2, $3)
               ON CONFLICT (user_id, role_id) DO NOTHING`,
              [newUserId, roleResult.rows[0].id, req.user.userId]
            );
          }
        }
      }

      // Audit
      await client.query(
        `INSERT INTO audit_log (user_id, user_id_text, action, module, description)
         VALUES ($1, $2, 'CREATE', 'users', $3)`,
        [req.user.id, req.user.userId, `Created user: ${userId}`]
      );

      return newUserId;
    });

    return res.status(201).json({ success: true, message: `User ${userId} created successfully.` });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `User ID '${userId}' already exists.` });
    }
    console.error('Create user error:', err.message);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

router.patch('/users/:id/status', authenticate, requireModule('users'), async (req, res) => {
  const { id } = req.params;
  const { status, isActive, isLocked, reason } = req.body;

  try {
    await query(
      `UPDATE user_info 
       SET status = COALESCE($1, status),
           is_active = COALESCE($2, is_active),
           is_locked = COALESCE($3, is_locked),
           updated_at = NOW(),
           updated_by = $4
       WHERE id = $5`,
      [status, isActive, isLocked, req.user.userId, id]
    );

    await query(
      `INSERT INTO audit_log (user_id, user_id_text, action, module, description)
       VALUES ($1, $2, 'UPDATE', 'users', $3)`,
      [req.user.id, req.user.userId, `User status updated: ${id} → ${status}`]
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

router.post('/users/:id/reset-password', authenticate, requireModule('users'), async (req, res) => {
  const { id } = req.params;
  const tempPassword = Math.random().toString(36).slice(-8).toUpperCase() + '!';
  const SALT_ROUNDS = 12;
  const hash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  try {
    await query(
      `UPDATE user_info 
       SET password_hash = $1, must_change_password = true, updated_at = NOW(), updated_by = $2
       WHERE id = $3`,
      [hash, req.user.userId, id]
    );
    return res.json({ success: true, tempPassword });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ============================================================
// ROLES
// ============================================================
router.get('/roles', authenticate, requireModule('roles'), async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*,
              COUNT(DISTINCT uur.user_id) as user_count
       FROM user_roles r
       LEFT JOIN user_user_role uur ON uur.role_id = r.id AND uur.is_active = true
       WHERE r.is_active = true
       GROUP BY r.id
       ORDER BY r.role_name`
    );
    return res.json({ roles: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load roles.' });
  }
});

// ============================================================
// EMPLOYEES (HR)
// ============================================================
router.get('/employees', authenticate, requireModule('hr'), async (req, res) => {
  try {
    const result = await query(
      `SELECT e.*, d.base_salary, d.house_rent, d.medical, d.transport, d.gross_salary
       FROM hr_employee e
       LEFT JOIN hr_employee_detail d ON d.employee_id = e.employee_id
       WHERE e.is_active = true
       ORDER BY e.employee_code`
    );
    return res.json({ employees: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load employees.' });
  }
});

router.post('/employees', authenticate, requireModule('hr'), async (req, res) => {
  const { employeeCode, name, phone, email, department, designation, employmentStatus, joiningDate } = req.body;

  if (!name) return res.status(400).json({ error: 'Employee name is required.' });

  try {
    // Auto-generate code if not provided
    const codeToUse = employeeCode || await generateEmployeeCode();

    const result = await query(
      `INSERT INTO hr_employee (employee_code, name, phone, email, department, designation, employment_status, joining_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [codeToUse, name, phone, email, department, designation, employmentStatus || 'Permanent', joiningDate || null]
    );

    return res.status(201).json({ success: true, employee: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Employee code already exists.' });
    return res.status(500).json({ error: 'Failed to create employee.' });
  }
});

async function generateEmployeeCode() {
  const result = await query(`SELECT employee_code FROM hr_employee ORDER BY created_at DESC LIMIT 1`);
  if (result.rows.length === 0) return 'THL-EMP-00001';
  const last = result.rows[0].employee_code;
  const num = parseInt(last.split('-').pop()) + 1;
  return `THL-EMP-${String(num).padStart(5, '0')}`;
}

// ============================================================
// PROJECTS
// ============================================================
router.get('/projects', authenticate, requireModule('projects'), async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*,
              COUNT(DISTINCT pl.id) as total_plots_actual,
              COUNT(DISTINCT CASE WHEN pl.status = 'Available' THEN pl.id END) as available_plots,
              COUNT(DISTINCT CASE WHEN pl.status = 'Booked' THEN pl.id END) as booked_plots,
              COUNT(DISTINCT CASE WHEN pl.status = 'Sold' THEN pl.id END) as sold_plots
       FROM project p
       LEFT JOIN plot pl ON pl.project_id = p.id AND pl.is_active = true
       WHERE p.is_active = true
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    return res.json({ projects: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load projects.' });
  }
});

router.post('/projects', authenticate, requireModule('projects'), async (req, res) => {
  const { projectCode, projectName, location, landAreaKatha, status, launchDate, expectedCompletion, description, developmentBudget } = req.body;

  if (!projectName || !location) return res.status(400).json({ error: 'Project name and location are required.' });

  try {
    const code = projectCode || await generateProjectCode();
    const result = await query(
      `INSERT INTO project (project_code, project_name, location, land_area_katha, status, launch_date, expected_completion, description, development_budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, projectName, location, landAreaKatha || 0, status || 'Planning', launchDate, expectedCompletion, description, developmentBudget || 0]
    );
    return res.status(201).json({ success: true, project: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Project code already exists.' });
    return res.status(500).json({ error: 'Failed to create project.' });
  }
});

async function generateProjectCode() {
  const result = await query(`SELECT project_code FROM project ORDER BY created_at DESC LIMIT 1`);
  if (result.rows.length === 0) return 'THL-PRJ-001';
  const last = result.rows[0].project_code;
  const num = parseInt(last.split('-').pop()) + 1;
  return `THL-PRJ-${String(num).padStart(3, '0')}`;
}

// ============================================================
// PLOTS
// ============================================================
router.get('/plots', authenticate, requireModule('inventory'), async (req, res) => {
  const { projectId, status } = req.query;
  try {
    let sql = `SELECT pl.*, p.project_name, p.project_code
               FROM plot pl
               JOIN project p ON p.id = pl.project_id
               WHERE pl.is_active = true`;
    const params = [];

    if (projectId) {
      params.push(projectId);
      sql += ` AND pl.project_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND pl.status = $${params.length}`;
    }
    sql += ` ORDER BY pl.plot_number`;

    const result = await query(sql, params);
    return res.json({ plots: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load plots.' });
  }
});

router.post('/plots', authenticate, requireModule('inventory'), async (req, res) => {
  const { plotNumber, projectId, blockId, sizeKatha, facing, pricePerKatha, discount } = req.body;

  if (!plotNumber || !projectId) return res.status(400).json({ error: 'Plot number and project are required.' });

  const basePrice = (sizeKatha || 0) * (pricePerKatha || 0);
  try {
    const result = await query(
      `INSERT INTO plot (plot_number, project_id, block_id, size_katha, facing, price_per_katha, base_price, discount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [plotNumber, projectId, blockId || null, sizeKatha, facing, pricePerKatha, basePrice, discount || 0]
    );
    return res.status(201).json({ success: true, plot: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Plot number already exists in this project.' });
    return res.status(500).json({ error: 'Failed to create plot.' });
  }
});

// ============================================================
// CUSTOMERS
// ============================================================
router.get('/customers', authenticate, requireModule('customers'), async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  try {
    let sql = `SELECT * FROM customer WHERE is_active = true`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR mobile ILIKE $${params.length} OR customer_code ILIKE $${params.length} OR nid ILIKE $${params.length})`;
    }

    const offset = (page - 1) * limit;
    params.push(limit);
    params.push(offset);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);
    return res.json({ customers: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load customers.' });
  }
});

router.post('/customers', authenticate, requireModule('customers'), async (req, res) => {
  const { name, mobile, email, nid, fatherName, address, profession, nomineeName, nomineeRelation } = req.body;

  if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required.' });

  try {
    const code = await generateCustomerCode();
    const result = await query(
      `INSERT INTO customer (customer_code, name, father_name, nid, mobile, email, present_address, profession)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, name, fatherName, nid, mobile, email, address, profession]
    );

    const customer = result.rows[0];

    // Create nominee if provided
    if (nomineeName) {
      await query(
        `INSERT INTO customer_nominee (customer_id, nominee_name, relation, is_primary) VALUES ($1, $2, $3, true)`,
        [customer.id, nomineeName, nomineeRelation || 'Family Member']
      );
    }

    return res.status(201).json({ success: true, customer });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create customer.' });
  }
});

async function generateCustomerCode() {
  const result = await query(`SELECT customer_code FROM customer ORDER BY created_at DESC LIMIT 1`);
  if (result.rows.length === 0) return 'THL-CUST-00001';
  const last = result.rows[0].customer_code;
  const num = parseInt(last.split('-').pop()) + 1;
  return `THL-CUST-${String(num).padStart(5, '0')}`;
}

// ============================================================
// LEADS
// ============================================================
router.get('/leads', authenticate, requireModule('crm'), async (req, res) => {
  const { stage, executiveId } = req.query;
  try {
    let sql = `SELECT * FROM lead WHERE is_active = true`;
    const params = [];
    if (stage) { params.push(stage); sql += ` AND stage = $${params.length}`; }
    if (executiveId) { params.push(executiveId); sql += ` AND sales_executive_id = $${params.length}`; }
    sql += ` ORDER BY created_at DESC`;
    const result = await query(sql, params);
    return res.json({ leads: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load leads.' });
  }
});

router.post('/leads', authenticate, requireModule('crm'), async (req, res) => {
  const { name, mobile, email, source, projectId, budget } = req.body;
  if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required.' });

  try {
    const code = `THL-LEAD-${Date.now().toString().slice(-6)}`;
    const result = await query(
      `INSERT INTO lead (lead_code, name, mobile, email, source, project_id, budget, sales_executive_id, sales_executive_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, name, mobile, email, source, projectId, budget, req.user.id, req.user.displayName]
    );
    return res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create lead.' });
  }
});

// ============================================================
// BOOKINGS (uses PostgreSQL atomic function)
// ============================================================
router.get('/bookings', authenticate, requireModule('bookings'), async (req, res) => {
  const { customerId, status } = req.query;
  try {
    let sql = `SELECT b.*, c.mobile as customer_mobile
               FROM booking b
               JOIN customer c ON c.id = b.customer_id
               WHERE 1=1`;
    const params = [];
    if (customerId) { params.push(customerId); sql += ` AND b.customer_id = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND b.status = $${params.length}`; }
    sql += ` ORDER BY b.created_at DESC`;
    const result = await query(sql, params);
    return res.json({ bookings: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load bookings.' });
  }
});

router.post('/bookings', authenticate, requireModule('bookings'), requireAction('bookings.wizard', 'can_create'), async (req, res) => {
  const {
    customerId, projectId, plotId,
    totalPrice, discount, bookingMoney, downPayment,
    durationMonths, frequency, firstInstallmentDate,
  } = req.body;

  if (!customerId || !projectId || !plotId || !totalPrice) {
    return res.status(400).json({ error: 'Customer, project, plot, and total price are required.' });
  }

  try {
    // Call PostgreSQL atomic booking function (handles plot locking internally)
    const result = await query(
      `SELECT create_booking_atomic($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) as result`,
      [
        customerId, projectId, plotId,
        totalPrice, discount || 0, bookingMoney || 0, downPayment || 0,
        durationMonths || 12, frequency || 'Monthly', firstInstallmentDate,
        null, req.user.displayName, req.user.userId
      ]
    );

    const bookingResult = result.rows[0].result;

    // Audit
    await query(
      `INSERT INTO audit_log (user_id, user_id_text, action, module, entity_type, entity_id, description)
       VALUES ($1, $2, 'CREATE', 'bookings', 'booking', $3, $4)`,
      [req.user.id, req.user.userId, bookingResult.booking_id, `Booking created: ${bookingResult.booking_number}`]
    );

    return res.status(201).json({ success: true, booking: bookingResult });
  } catch (err) {
    if (err.message.includes('CONFLICT')) {
      return res.status(409).json({ error: err.message });
    }
    console.error('Booking error:', err.message);
    return res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// ============================================================
// INSTALLMENTS
// ============================================================
router.get('/installments', authenticate, requireModule('installments'), async (req, res) => {
  const { bookingId, customerId, status } = req.query;
  try {
    let sql = `SELECT i.*, b.booking_number, c.name as customer_name, c.mobile
               FROM installment i
               JOIN booking b ON b.id = i.booking_id
               JOIN customer c ON c.id = i.customer_id
               WHERE 1=1`;
    const params = [];
    if (bookingId) { params.push(bookingId); sql += ` AND i.booking_id = $${params.length}`; }
    if (customerId) { params.push(customerId); sql += ` AND i.customer_id = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND i.status = $${params.length}`; }
    sql += ` ORDER BY i.due_date`;
    const result = await query(sql, params);
    return res.json({ installments: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load installments.' });
  }
});

// ============================================================
// PAYMENTS & RECEIPTS (atomic)
// ============================================================
router.post('/payments', authenticate, requireModule('collections'), requireAction('collections.payments', 'can_create'), async (req, res) => {
  const {
    customerId, bookingId, installmentId, projectId, plotId,
    paymentType, amount, paymentMethod, bankName, chequeOrTxnNo, paymentDate, remarks
  } = req.body;

  if (!customerId || !amount || !paymentType || !paymentMethod) {
    return res.status(400).json({ error: 'Customer, amount, payment type, and method are required.' });
  }

  try {
    const result = await withTransaction(async (client) => {
      // Create payment record
      const payResult = await client.query(
        `INSERT INTO payment (customer_id, booking_id, installment_id, project_id, plot_id,
          payment_type, amount, payment_method, bank_name, cheque_or_txn_no, payment_date, remarks, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [customerId, bookingId, installmentId, projectId, plotId,
         paymentType, amount, paymentMethod, bankName, chequeOrTxnNo, paymentDate || new Date(), remarks, req.user.userId]
      );
      const paymentId = payResult.rows[0].id;

      // Generate receipt number (uses sequence — guaranteed unique)
      const receiptNumResult = await client.query(`SELECT generate_receipt_number() as num`);
      const receiptNumber = receiptNumResult.rows[0].num;

      // Get customer info for receipt
      const custResult = await client.query(`SELECT name FROM customer WHERE id = $1`, [customerId]);
      const customerName = custResult.rows[0]?.name || '';

      // Get project/plot info
      let projectName = null, plotNumber = null;
      if (projectId) {
        const projResult = await client.query(`SELECT project_name FROM project WHERE id = $1`, [projectId]);
        projectName = projResult.rows[0]?.project_name;
      }
      if (plotId) {
        const plotResult = await client.query(`SELECT plot_number FROM plot WHERE id = $1`, [plotId]);
        plotNumber = plotResult.rows[0]?.plot_number;
      }

      // Create receipt
      const receiptResult = await client.query(
        `INSERT INTO receipt (receipt_number, payment_id, customer_id, customer_name, project_id, project_name,
          plot_id, plot_number, booking_id, payment_type, amount, payment_method, bank_name, cheque_or_txn_no,
          payment_date, received_by_name, remarks, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
        [receiptNumber, paymentId, customerId, customerName, projectId, projectName,
          plotId, plotNumber, bookingId, paymentType, amount, paymentMethod, bankName, chequeOrTxnNo,
          paymentDate || new Date(), req.user.displayName, remarks, req.user.userId]
      );
      const receipt = receiptResult.rows[0];

      // Link receipt to payment
      await client.query(`UPDATE payment SET receipt_id = $1 WHERE id = $2`, [receipt.id, paymentId]);

      // Update installment if provided
      if (installmentId) {
        await client.query(
          `UPDATE installment SET 
            paid_amount = paid_amount + $1,
            last_paid_at = NOW(),
            status = CASE 
              WHEN paid_amount + $1 >= due_amount THEN 'Paid'
              WHEN paid_amount + $1 > 0 THEN 'Partially Paid'
              ELSE status
            END,
            updated_at = NOW()
           WHERE id = $2`,
          [amount, installmentId]
        );
      }

      // Update customer totals
      await client.query(
        `UPDATE customer SET total_paid = total_paid + $1, total_due = GREATEST(0, total_due - $1), updated_at = NOW() WHERE id = $2`,
        [amount, customerId]
      );

      // Audit
      await client.query(
        `INSERT INTO audit_log (user_id, user_id_text, action, module, entity_type, entity_id, description)
         VALUES ($1, $2, 'CREATE', 'collections', 'receipt', $3, $4)`,
        [req.user.id, req.user.userId, receipt.id, `Payment received: ${receiptNumber} — ৳${amount}`]
      );

      return receipt;
    });

    return res.status(201).json({ success: true, receipt: result });
  } catch (err) {
    console.error('Payment error:', err.message);
    return res.status(500).json({ error: 'Failed to process payment.' });
  }
});

router.get('/receipts', authenticate, requireModule('collections'), async (req, res) => {
  const { customerId, dateFrom, dateTo } = req.query;
  try {
    let sql = `SELECT * FROM receipt WHERE is_cancelled = false`;
    const params = [];
    if (customerId) { params.push(customerId); sql += ` AND customer_id = $${params.length}`; }
    if (dateFrom) { params.push(dateFrom); sql += ` AND payment_date >= $${params.length}`; }
    if (dateTo) { params.push(dateTo); sql += ` AND payment_date <= $${params.length}`; }
    sql += ` ORDER BY payment_date DESC, created_at DESC`;
    const result = await query(sql, params);
    return res.json({ receipts: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load receipts.' });
  }
});

// ============================================================
// ACCOUNTING
// ============================================================
router.get('/accounts', authenticate, requireModule('accounting'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM account WHERE is_active = true ORDER BY account_code`);
    return res.json({ accounts: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load chart of accounts.' });
  }
});

router.get('/journals', authenticate, requireModule('accounting'), async (req, res) => {
  const { dateFrom, dateTo, type } = req.query;
  try {
    let sql = `SELECT j.*, 
                json_agg(json_build_object(
                  'account_code', l.account_code,
                  'account_name', l.account_name,
                  'debit', l.debit_amount,
                  'credit', l.credit_amount
                ) ORDER BY l.id) as lines
               FROM journal_entry j
               LEFT JOIN journal_entry_line l ON l.journal_id = j.id
               WHERE 1=1`;
    const params = [];
    if (dateFrom) { params.push(dateFrom); sql += ` AND j.voucher_date >= $${params.length}`; }
    if (dateTo) { params.push(dateTo); sql += ` AND j.voucher_date <= $${params.length}`; }
    if (type) { params.push(type); sql += ` AND j.voucher_type = $${params.length}`; }
    sql += ` GROUP BY j.id ORDER BY j.voucher_date DESC, j.created_at DESC`;
    const result = await query(sql, params);
    return res.json({ journals: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load journal entries.' });
  }
});

router.post('/journals', authenticate, requireModule('accounting'), requireAction('accounting.journal', 'can_create'), async (req, res) => {
  const { voucherDate, voucherType, narration, lines } = req.body;

  if (!lines || lines.length < 2) {
    return res.status(400).json({ error: 'Journal entry requires at least 2 lines.' });
  }

  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debitAmount || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.creditAmount || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      error: `Unbalanced entry: Total Debit (৳${totalDebit.toFixed(2)}) ≠ Total Credit (৳${totalCredit.toFixed(2)})`,
    });
  }

  try {
    const result = await withTransaction(async (client) => {
      const numResult = await client.query(`SELECT generate_voucher_number('JV') as num`);
      const voucherNumber = numResult.rows[0].num;

      const jResult = await client.query(
        `INSERT INTO journal_entry (voucher_number, voucher_date, voucher_type, narration, total_debit, total_credit, is_posted, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING id`,
        [voucherNumber, voucherDate || new Date(), voucherType || 'General', narration, totalDebit, totalCredit, req.user.userId]
      );
      const journalId = jResult.rows[0].id;

      for (const line of lines) {
        const accResult = await client.query(`SELECT * FROM account WHERE id = $1`, [line.accountId]);
        const acc = accResult.rows[0];
        await client.query(
          `INSERT INTO journal_entry_line (journal_id, account_id, account_code, account_name, debit_amount, credit_amount, narration)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [journalId, line.accountId, acc?.account_code || '', acc?.account_name || line.accountName || '',
           line.debitAmount || 0, line.creditAmount || 0, line.narration]
        );
      }

      return { journalId, voucherNumber };
    });

    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create journal entry.' });
  }
});

// ============================================================
// EXPENSES
// ============================================================
router.get('/expenses', authenticate, requireModule('expenses'), async (req, res) => {
  const { dateFrom, dateTo, category } = req.query;
  try {
    let sql = `SELECT * FROM expense WHERE 1=1`;
    const params = [];
    if (dateFrom) { params.push(dateFrom); sql += ` AND expense_date >= $${params.length}`; }
    if (dateTo) { params.push(dateTo); sql += ` AND expense_date <= $${params.length}`; }
    if (category) { params.push(category); sql += ` AND category = $${params.length}`; }
    sql += ` ORDER BY expense_date DESC`;
    const result = await query(sql, params);
    return res.json({ expenses: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load expenses.' });
  }
});

router.post('/expenses', authenticate, requireModule('expenses'), async (req, res) => {
  const { expenseDate, category, description, projectId, amount, paymentMethod, bankName, chequeOrTxnNo } = req.body;
  if (!category || !description || !amount) return res.status(400).json({ error: 'Category, description, and amount are required.' });

  try {
    const code = `THL-EXP-${Date.now().toString().slice(-8)}`;
    const result = await query(
      `INSERT INTO expense (expense_code, expense_date, category, description, project_id, amount, payment_method, bank_name, cheque_or_txn_no, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [code, expenseDate || new Date(), category, description, projectId, amount, paymentMethod || 'Cash', bankName, chequeOrTxnNo, req.user.userId]
    );
    return res.status(201).json({ success: true, expense: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create expense.' });
  }
});

// ============================================================
// PAYROLL
// ============================================================
router.get('/payroll', authenticate, requireModule('hr'), async (req, res) => {
  const { month } = req.query;
  try {
    let sql = `SELECT p.*, e.department, e.designation FROM payroll p
               JOIN hr_employee e ON e.employee_id = p.employee_id
               WHERE 1=1`;
    const params = [];
    if (month) { params.push(month); sql += ` AND p.payroll_month = $${params.length}`; }
    sql += ` ORDER BY e.employee_code`;
    const result = await query(sql, params);
    return res.json({ payroll: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load payroll.' });
  }
});

// ============================================================
// AUDIT LOG
// ============================================================
router.get('/audit', authenticate, requireModule('audit'), async (req, res) => {
  const { module, dateFrom, dateTo, limit = 100 } = req.query;
  try {
    let sql = `SELECT al.*, ui.display_name 
               FROM audit_log al
               LEFT JOIN user_info ui ON ui.id = al.user_id
               WHERE 1=1`;
    const params = [];
    if (module) { params.push(module); sql += ` AND al.module = $${params.length}`; }
    if (dateFrom) { params.push(dateFrom); sql += ` AND al.created_at >= $${params.length}`; }
    if (dateTo) { params.push(dateTo); sql += ` AND al.created_at <= $${params.length}`; }
    params.push(limit);
    sql += ` ORDER BY al.created_at DESC LIMIT $${params.length}`;
    const result = await query(sql, params);
    return res.json({ logs: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load audit log.' });
  }
});

// ============================================================
// SYSTEM SETTINGS
// ============================================================
router.get('/settings', authenticate, async (req, res) => {
  try {
    const result = await query(`SELECT key, value, description FROM system_settings ORDER BY key`);
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load settings.' });
  }
});

router.patch('/settings', authenticate, requireModule('settings'), async (req, res) => {
  const { updates } = req.body; // { key: value, key: value, ... }
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'updates object is required.' });
  }

  try {
    for (const [key, value] of Object.entries(updates)) {
      await query(
        `UPDATE system_settings SET value = $1, updated_at = NOW(), updated_by = $2 WHERE key = $3`,
        [value, req.user.userId, key]
      );
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ============================================================
// DASHBOARD: Key metrics
// ============================================================
router.get('/dashboard/metrics', authenticate, async (req, res) => {
  try {
    const [
      projectCount, plotStats, customerCount, bookingCount,
      collectionToday, totalCollection, overdueCount, leadCount
    ] = await Promise.all([
      query(`SELECT COUNT(*) FROM project WHERE is_active = true AND status = 'Ongoing'`),
      query(`SELECT status, COUNT(*) as count FROM plot WHERE is_active = true GROUP BY status`),
      query(`SELECT COUNT(*) FROM customer WHERE is_active = true`),
      query(`SELECT COUNT(*) FROM booking WHERE status = 'Active'`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM receipt WHERE payment_date = CURRENT_DATE AND is_cancelled = false`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM receipt WHERE is_cancelled = false`),
      query(`SELECT COUNT(*) FROM installment WHERE status IN ('Due', 'Overdue') AND due_date < CURRENT_DATE`),
      query(`SELECT COUNT(*) FROM lead WHERE is_active = true AND stage NOT IN ('Booked', 'Lost')`),
    ]);

    const plotStatusMap = {};
    for (const row of plotStats.rows) {
      plotStatusMap[row.status] = parseInt(row.count);
    }

    return res.json({
      activeProjects: parseInt(projectCount.rows[0].count),
      plots: plotStatusMap,
      customers: parseInt(customerCount.rows[0].count),
      activeBookings: parseInt(bookingCount.rows[0].count),
      collectionToday: parseFloat(collectionToday.rows[0].total),
      totalCollection: parseFloat(totalCollection.rows[0].total),
      overdueInstallments: parseInt(overdueCount.rows[0].count),
      activeLeads: parseInt(leadCount.rows[0].count),
    });
  } catch (err) {
    console.error('Dashboard metrics error:', err.message);
    return res.status(500).json({ error: 'Failed to load dashboard metrics.' });
  }
});// ============================================================
// MODULES & MENUS
// ============================================================
router.get('/modules', authenticate, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM user_module WHERE is_active = true ORDER BY sort_order`);
    return res.json({ modules: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load modules.' });
  }
});

router.get('/menus', authenticate, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM user_menu WHERE is_active = true ORDER BY sort_order`);
    return res.json({ menus: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load menus.' });
  }
});

// ============================================================
// PERMISSIONS
// ============================================================
router.get('/permissions', authenticate, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM user_role_menu`);
    return res.json({ permissions: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load permissions.' });
  }
});

router.put('/permissions/role/:roleId', authenticate, requireModule('roles'), async (req, res) => {
  const { roleId } = req.params;
  const { menuPermissions } = req.body; // array of { menuId, canView, canCreate, canEdit, canDelete, canApprove, canExport, canPrint }
  
  if (!menuPermissions || !Array.isArray(menuPermissions)) {
    return res.status(400).json({ error: 'menuPermissions array is required.' });
  }

  try {
    await withTransaction(async (client) => {
      for (const p of menuPermissions) {
        await client.query(
          `INSERT INTO user_role_menu (role_id, menu_id, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_print, assigned_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (role_id, menu_id) DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_create = EXCLUDED.can_create,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             can_approve = EXCLUDED.can_approve,
             can_export = EXCLUDED.can_export,
             can_print = EXCLUDED.can_print`,
          [roleId, p.menuId, !!p.canView, !!p.canCreate, !!p.canEdit, !!p.canDelete, !!p.canApprove, !!p.canExport, !!p.canPrint, req.user.userId]
        );
      }
    });

    return res.json({ success: true, message: 'Permissions updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update role permissions.' });
  }
});

// ============================================================
// DESIGNATIONS & ORGANOGRAM
// ============================================================
router.get('/designations', authenticate, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM user_designation WHERE is_active = true ORDER BY level, name`);
    return res.json({ designations: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load designations.' });
  }
});

router.post('/designations', authenticate, requireModule('hr'), async (req, res) => {
  const { name, parentId, level, department, division, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Designation name is required.' });

  try {
    const result = await query(
      `INSERT INTO user_designation (name, parent_id, level, department, division, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, parentId || null, level || 0, department, division, description]
    );
    return res.status(201).json({ success: true, designation: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create designation.' });
  }
});

router.post('/designations/transfer', authenticate, requireModule('hr'), async (req, res) => {
  const { userId, newDesignationId, startDate, remarks } = req.body;
  if (!userId || !newDesignationId) {
    return res.status(400).json({ error: 'User ID and New Designation ID are required.' });
  }

  try {
    await withTransaction(async (client) => {
      // 1. Deactivate old active designation history
      await client.query(
        `UPDATE user_designation_history 
         SET is_active = false, end_date = CURRENT_DATE, status = 'TRANSFERRED'
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      );

      // 2. Insert new designation history
      await client.query(
        `INSERT INTO user_designation_history (user_id, designation_id, start_date, status, is_active, remarks, assigned_by)
         VALUES ($1, $2, $3, 'ACTIVE', true, $4, $5)`,
        [userId, newDesignationId, startDate || new Date(), remarks, req.user.userId]
      );

      // 3. Update user_info
      const desigResult = await client.query(`SELECT name, department, division FROM user_designation WHERE designation_id = $1`, [newDesignationId]);
      const desig = desigResult.rows[0];
      if (desig) {
        await client.query(
          `UPDATE user_info SET designation_title = $1, department = $2, division = $3, updated_at = NOW() WHERE id = $4`,
          [desig.name, desig.department, desig.division, userId]
        );
      }
    });

    return res.json({ success: true, message: 'Employee transferred successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to transfer employee.' });
  }
});

// ============================================================
// BLOCKS, ZONES, ROADS
// ============================================================
router.get('/blocks', authenticate, async (req, res) => {
  const { projectId } = req.query;
  try {
    let sql = `SELECT * FROM project_block WHERE is_active = true`;
    const params = [];
    if (projectId) { params.push(projectId); sql += ` AND project_id = $${params.length}`; }
    const result = await query(sql, params);
    return res.json({ blocks: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load blocks.' });
  }
});

router.post('/blocks', authenticate, requireModule('projects'), async (req, res) => {
  const { projectId, blockName, description } = req.body;
  if (!projectId || !blockName) return res.status(400).json({ error: 'Project and block name are required.' });

  try {
    const result = await query(
      `INSERT INTO project_block (project_id, block_name, description) VALUES ($1, $2, $3) RETURNING *`,
      [projectId, blockName, description]
    );
    return res.status(201).json({ success: true, block: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create block.' });
  }
});

// ============================================================
// SITE VISITS
// ============================================================
router.get('/site-visits', authenticate, requireModule('crm'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM site_visit ORDER BY visit_date DESC`);
    return res.json({ siteVisits: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load site visits.' });
  }
});

router.post('/site-visits', authenticate, requireModule('crm'), async (req, res) => {
  const { leadId, customerId, visitDate, visitTime, projectId, projectName, interestedPlot, transportArranged, transportDetails, remarks } = req.body;
  if (!visitDate) return res.status(400).json({ error: 'Visit date is required.' });

  try {
    const result = await query(
      `INSERT INTO site_visit (lead_id, customer_id, visit_date, visit_time, project_id, project_name, interestedPlot, sales_executive_id, sales_executive_name, transport_arranged, transport_details, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [leadId || null, customerId || null, visitDate, visitTime, projectId || null, projectName, interestedPlot, req.user.id, req.user.displayName, transportArranged || false, transportDetails, remarks]
    );
    return res.status(201).json({ success: true, siteVisit: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to schedule site visit.' });
  }
});

// ============================================================
// COMMISSIONS
// ============================================================
router.get('/commissions', authenticate, requireModule('sales'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM commission ORDER BY created_at DESC`);
    return res.json({ commissions: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load commissions.' });
  }
});

// ============================================================
// VENDORS & PURCHASES
// ============================================================
router.get('/vendors', authenticate, requireModule('vendors'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM vendor WHERE is_active = true ORDER BY vendor_name`);
    return res.json({ vendors: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load vendors.' });
  }
});

router.post('/vendors', authenticate, requireModule('vendors'), async (req, res) => {
  const { vendorName, contactPerson, phone, email, address, tradeLicense, category } = req.body;
  if (!vendorName) return res.status(400).json({ error: 'Vendor name is required.' });

  try {
    const code = `THL-VEN-${Date.now().toString().slice(-5)}`;
    const result = await query(
      `INSERT INTO vendor (vendor_code, vendor_name, contact_person, phone, email, address, trade_license, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [code, vendorName, contactPerson, phone, email, address, tradeLicense, category]
    );
    return res.status(201).json({ success: true, vendor: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create vendor.' });
  }
});

router.get('/purchases', authenticate, requireModule('vendors'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM purchase ORDER BY created_at DESC`);
    return res.json({ purchases: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load purchases.' });
  }
});

// ============================================================
// LAND ACQUISITION
// ============================================================
router.get('/land', authenticate, requireModule('land'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM land_parcel ORDER BY created_at DESC`);
    return res.json({ landParcels: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load land parcels.' });
  }
});

router.post('/land', authenticate, requireModule('land'), async (req, res) => {
  const { projectId, ownerName, mouza, khatianNo, dagNo, areaKatha, pricePerKatha, notes } = req.body;
  if (!ownerName || !areaKatha) return res.status(400).json({ error: 'Owner name and land area are required.' });

  const totalPrice = (parseFloat(areaKatha) || 0) * (parseFloat(pricePerKatha) || 0);
  try {
    const code = `THL-LND-${Date.now().toString().slice(-5)}`;
    const result = await query(
      `INSERT INTO land_parcel (parcel_code, project_id, owner_name, mouza, khatian_no, dag_no, area_katha, price_per_katha, total_price, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [code, projectId || null, ownerName, mouza, khatianNo, dagNo, areaKatha, pricePerKatha || 0, totalPrice, notes]
    );
    return res.status(201).json({ success: true, landParcel: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create land parcel.' });
  }
});

// ============================================================
// SITE DEVELOPMENT
// ============================================================
router.get('/development', authenticate, requireModule('development'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM site_development ORDER BY created_at DESC`);
    return res.json({ developmentItems: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load site development.' });
  }
});

// ============================================================
// TRANSFERS & REFUNDS
// ============================================================
router.get('/transfers', authenticate, requireModule('transfer'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM transfer ORDER BY created_at DESC`);
    return res.json({ transfers: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load transfers.' });
  }
});

router.get('/refunds', authenticate, requireModule('refunds'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM refund ORDER BY created_at DESC`);
    return res.json({ refunds: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load refunds.' });
  }
});

// ============================================================
// DOCUMENTS (Supabase Storage Metadata & Signed URLs)
// ============================================================
router.get('/documents', authenticate, requireModule('documents'), async (req, res) => {
  const { customerId, projectId, type } = req.query;
  try {
    let sql = `SELECT * FROM document WHERE is_deleted = false`;
    const params = [];
    if (customerId) { params.push(customerId); sql += ` AND customer_id = $${params.length}`; }
    if (projectId) { params.push(projectId); sql += ` AND project_id = $${params.length}`; }
    if (type) { params.push(type); sql += ` AND document_type = $${params.length}`; }
    sql += ` ORDER BY uploaded_at DESC`;
    const result = await query(sql, params);
    return res.json({ documents: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load documents.' });
  }
});

router.post('/documents/upload', authenticate, requireModule('documents'), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please select a valid document.' });
  }

  const { bucketName, customerId, projectId, plotId, employeeId, documentType, description } = req.body;

  try {
    const result = await uploadDocument({
      file: req.file,
      bucketName: bucketName || 'customer-documents',
      customerId,
      projectId,
      plotId,
      employeeId,
      documentType: documentType || 'Other',
      description: description || '',
      uploadedBy: req.user.userId
    });

    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Document upload error:', err.message);
    return res.status(500).json({ error: 'Failed to upload document.' });
  }
});

router.get('/documents/:id/signed-url', authenticate, requireModule('documents'), async (req, res) => {
  const { id } = req.params;
  const { expiresIn = 60 } = req.query;

  try {
    const result = await getSignedUrl(id, parseInt(expiresIn));
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

// ============================================================
// BACKUPS & SYSTEM
// ============================================================
router.get('/backups', authenticate, requireModule('backup'), async (req, res) => {
  res.json({
    status: 'ok',
    backupStrategy: 'Automated Supabase PostgreSQL Daily Snapshots + Point-in-time Recovery',
    lastBackup: new Date().toISOString(),
    retentionDays: 30
  });
});

router.get('/system', authenticate, async (req, res) => {
  res.json({
    name: 'TAYEEBA HOUSING LTD. ERP',
    version: '2.7.0',
    company: 'Tayeeba Housing Ltd.',
    address: 'Gulshan Tower (Level 8), Plot 44, Gulshan-2, Dhaka-1212',
    currency: 'BDT (৳)',
    timezone: 'Asia/Dhaka',
    database: 'Supabase PostgreSQL',
    storage: 'Supabase Storage',
    frontend: 'GitHub Pages'
  });
});

router.post('/system/reset-data', authenticate, requireModule('settings'), async (req, res) => {
  try {
    await withTransaction(async (client) => {
      await client.query(`
        TRUNCATE TABLE 
          receipt, payment, installment, booking,
          journal_entry_line, journal_entry,
          expense, commission, transfer, refund,
          site_visit, follow_up, lead,
          customer_nominee, customer,
          plot, project_road, project_zone, project_block, project,
          purchase, vendor,
          land_payment, land_parcel, land_owner,
          site_development,
          payroll, leave_request, attendance,
          document, audit_log
        CASCADE
      `);

      await client.query(`ALTER SEQUENCE IF EXISTS receipt_number_seq RESTART WITH 1`);
      await client.query(`ALTER SEQUENCE IF EXISTS voucher_number_seq RESTART WITH 1`);
      await client.query(`
        INSERT INTO system_settings (key, value, description)
        VALUES ('system_version', '2.7.0', 'Tayeeba Housing Ltd. ERP System Version'),
               ('data_status', 'CLEAN_SLATE', 'Ready for live data input')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `);
    });

    return res.json({ success: true, message: 'All operational data reset successfully to clean slate (v2.7.0).' });
  } catch (err) {
    console.error('Reset data error:', err.message);
    return res.status(500).json({ error: 'Failed to reset operational data.' });
  }
});

export default router;
