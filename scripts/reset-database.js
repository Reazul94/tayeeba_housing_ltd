// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.7
// Script: Reset Database to Clean Slate for Real Data Entry
// Run: node scripts/reset-database.js
// ============================================================

import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = pkg;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function resetDatabase() {
  console.log('\n\x1b[1m\x1b[36m============================================================');
  console.log('TAYEEBA HOUSING LTD. ERP v2.7 — Clean Slate Database Reset');
  console.log('============================================================\x1b[0m\n');

  if (!process.env.DATABASE_URL) {
    console.error('\x1b[31m✗ DATABASE_URL is not set in server/.env.\x1b[0m');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    console.log('\x1b[32m✓\x1b[0m Connected to Supabase PostgreSQL.\n');

    console.log('\x1b[33m⚠ WARNING: This will truncate all projects, plots, customers, leads, bookings, receipts, expenses, and operational transactions.\x1b[0m');
    console.log('\x1b[32m✓ User accounts, roles, permissions, organogram designations, and Chart of Accounts will be PRESERVED.\x1b[0m\n');

    const confirm = await ask('Are you sure you want to reset all operational data? (type "RESET" to confirm): ');
    if (confirm.trim() !== 'RESET') {
      console.log('\nOperation cancelled. No changes were made.\n');
      process.exit(0);
    }

    console.log('\nExecuting clean slate reset...');

    await client.query('BEGIN');

    // Truncate operational tables
    await client.query(`
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
      CASCADE
    `);

    // Reset sequences
    await client.query(`ALTER SEQUENCE IF EXISTS receipt_number_seq RESTART WITH 1`);
    await client.query(`ALTER SEQUENCE IF EXISTS voucher_number_seq RESTART WITH 1`);

    // Update system settings to v2.7
    await client.query(`
      INSERT INTO system_settings (key, value, description)
      VALUES 
        ('system_version', '2.7.0', 'Tayeeba Housing Ltd. ERP System Version'),
        ('data_status', 'CLEAN_SLATE', 'Ready for live production data input')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);

    await client.query('COMMIT');

    console.log('\n\x1b[32m\x1b[1m✓ DATABASE RESET SUCCESSFUL!\x1b[0m');
    console.log('The ERP database is now clean and 100% ready for fresh data entry.\n');

    client.release();
  } catch (err) {
    console.error('\n\x1b[31m✗ Reset failed:\x1b[0m', err.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

resetDatabase().catch(console.error);
