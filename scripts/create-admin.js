// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Script: Create First Super Admin Account
// Run: node scripts/create-admin.js
// ============================================================

import pkg from 'pg';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function createAdmin() {
  console.log('\n\x1b[1m\x1b[36mTAYEEBA HOUSING LTD. ERP v2.6 — Create Super Admin\x1b[0m\n');

  // Test connection
  try {
    await pool.query('SELECT 1');
    console.log('\x1b[32m✓\x1b[0m Database connected\n');
  } catch (err) {
    console.error('\x1b[31m✗\x1b[0m Database connection failed:', err.message);
    console.log('\nPlease check your DATABASE_URL in server/.env');
    process.exit(1);
  }

  // Check if admin already exists
  const existing = await pool.query(
    `SELECT ui.user_id FROM user_info ui
     JOIN user_user_role uur ON uur.user_id = ui.id
     JOIN user_roles ur ON ur.id = uur.role_id
     WHERE ur.role_name = 'Super Admin' AND ui.is_active = true`
  );

  if (existing.rows.length > 0) {
    console.log('\x1b[33m⚠\x1b[0m  Super Admin already exists:', existing.rows.map(r => r.user_id).join(', '));
    const proceed = await ask('Create another admin anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      process.exit(0);
    }
  }

  // Gather info
  const name       = await ask('Full Name:          ');
  const userId     = await ask('User ID (login ID): ');
  const email      = await ask('Email:              ');
  const mobile     = await ask('Mobile:             ');
  const password   = await ask('Password (min 8):   ');
  const confirm    = await ask('Confirm Password:   ');

  if (password !== confirm) {
    console.error('\n\x1b[31m✗\x1b[0m Passwords do not match.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('\n\x1b[31m✗\x1b[0m Password must be at least 8 characters.');
    process.exit(1);
  }

  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const employeeCode = `THL-ADMIN-${Date.now().toString().slice(-5)}`;

  try {
    await pool.query('BEGIN');

    // Create HR employee record
    const empResult = await pool.query(
      `INSERT INTO hr_employee (employee_code, name, email, mobile, department, designation, is_active)
       VALUES ($1, $2, $3, $4, 'Executive', 'Super Administrator', true) RETURNING employee_id`,
      [employeeCode, name, email, mobile]
    );
    const employeeId = empResult.rows[0].employee_id;

    // Create user account
    const userResult = await pool.query(
      `INSERT INTO user_info (user_id, employee_id, employee_code, display_name, email, mobile, 
        password_hash, status, is_active, must_change_password, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', true, false, 'SYSTEM') RETURNING id`,
      [userId.trim(), employeeId, employeeCode, name, email, mobile, passwordHash]
    );
    const newUserId = userResult.rows[0].id;

    // Get Super Admin role
    const roleResult = await pool.query(`SELECT id FROM user_roles WHERE role_name = 'Super Admin'`);
    if (roleResult.rows.length === 0) {
      throw new Error('Super Admin role not found. Run migrations first.');
    }

    // Assign Super Admin role
    await pool.query(
      `INSERT INTO user_user_role (user_id, role_id, assigned_by) VALUES ($1, $2, 'SYSTEM')`,
      [newUserId, roleResult.rows[0].id]
    );

    await pool.query('COMMIT');

    console.log('\n\x1b[32m✓\x1b[0m Super Admin created successfully!');
    console.log(`\n  Name:       ${name}`);
    console.log(`  User ID:    ${userId}`);
    console.log(`  Employee:   ${employeeCode}`);
    console.log(`  Role:       Super Admin`);
    console.log(`\n\x1b[33mLogin at your ERP application with User ID: ${userId}\x1b[0m\n`);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('\n\x1b[31m✗\x1b[0m Failed to create admin:', err.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin().catch(console.error);
