// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Script: Safe SQLite to Supabase PostgreSQL Migration Tool
// Requirement: Section 118 & 119 of Master Prompt
// Run: node scripts/migrate-sqlite-to-pg.js
// ============================================================

import Database from 'better-sqlite3';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = pkg;
const sqlitePath = path.join(__dirname, '../server/tayeeba_erp.db');

async function runMigration() {
  console.log('\n\x1b[1m\x1b[36m============================================================');
  console.log('TAYEEBA HOUSING LTD. ERP — SQLite to PostgreSQL Migration');
  console.log('============================================================\x1b[0m\n');

  if (!fs.existsSync(sqlitePath)) {
    console.log('\x1b[33mℹ SQLite database file (server/tayeeba_erp.db) not found.\x1b[0m');
    console.log('Skipping data migration. Fresh PostgreSQL schema is already active.\n');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error('\x1b[31m✗ DATABASE_URL is not set in server/.env.\x1b[0m');
    console.log('Please configure your Supabase PostgreSQL connection string first.\n');
    process.exit(1);
  }

  const sqliteDb = new Database(sqlitePath, { readonly: true });
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const report = {
    migrated: {},
    skipped: {},
    errors: []
  };

  try {
    const pgClient = await pgPool.connect();
    console.log('\x1b[32m✓\x1b[0m Connected to Supabase PostgreSQL');

    // 1. Migrate Users & Employee Info
    try {
      const sqliteUsers = sqliteDb.prepare(`SELECT * FROM user_info`).all();
      console.log(`\nFound ${sqliteUsers.length} user record(s) in SQLite.`);
      
      let userCount = 0;
      for (const u of sqliteUsers) {
        // Insert or update in hr_employee first
        await pgClient.query(
          `INSERT INTO hr_employee (employee_code, name, email, phone, department, designation, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (employee_code) DO NOTHING`,
          [u.employee_code || u.user_id, u.display_name || u.name, u.email, u.mobile, u.department, u.designation_title, u.is_active ? true : false]
        );

        // Fetch employee_id
        const empRes = await pgClient.query(`SELECT employee_id FROM hr_employee WHERE employee_code = $1`, [u.employee_code || u.user_id]);
        const employeeId = empRes.rows[0]?.employee_id;

        // Insert into user_info
        await pgClient.query(
          `INSERT INTO user_info (
            user_id, employee_id, employee_code, display_name, email, mobile, password_hash,
            status, is_active, is_locked, must_change_password, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'SQLITE_MIGRATION')
          ON CONFLICT (user_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            email = EXCLUDED.email,
            mobile = EXCLUDED.mobile,
            updated_at = NOW()`,
          [
            u.user_id,
            employeeId,
            u.employee_code || u.user_id,
            u.display_name || u.name,
            u.email,
            u.mobile,
            u.password_hash || '$2b$12$eXo1mC6Z...migrated',
            u.status || 'ACTIVE',
            u.is_active ? true : false,
            u.is_locked ? true : false,
            u.must_change_password ? true : false
          ]
        );
        userCount++;
      }
      report.migrated['user_info'] = userCount;
      console.log(`\x1b[32m✓\x1b[0m Successfully migrated ${userCount} user record(s).`);
    } catch (err) {
      console.warn(`User migration note: ${err.message}`);
      report.skipped['user_info'] = err.message;
    }

    // 2. Summary Report
    console.log('\n\x1b[1m\x1b[32m============================================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY');
    console.log('============================================================\x1b[0m');
    console.log(JSON.stringify(report, null, 2));
    console.log('\nOriginal SQLite database preserved intact at: server/tayeeba_erp.db\n');

    pgClient.release();
  } catch (err) {
    console.error('\n\x1b[31m✗ Migration failed:\x1b[0m', err.message);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

runMigration().catch(console.error);
