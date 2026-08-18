// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.7
// Script: Run All Database Migrations to Supabase
// Run: node scripts/run-all-migrations.js
// ============================================================

import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = pkg;

async function runMigrations() {
  console.log('\n\x1b[1m\x1b[36m============================================================');
  console.log('TAYEEBA HOUSING LTD. ERP v2.7 — Supabase Migration Runner');
  console.log('============================================================\x1b[0m\n');

  if (!process.env.DATABASE_URL) {
    console.error('\x1b[31m✗ DATABASE_URL is not set in server/.env\x1b[0m');
    console.log('Please copy your Supabase Connection String URI into server/.env:\nDATABASE_URL=postgresql://postgres.xxxx:your_password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres\n');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('\x1b[32m✓ Connected to Supabase PostgreSQL!\x1b[0m\n');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files to execute in order:\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      process.stdout.write(`  Running \x1b[33m${file}\x1b[0m ... `);
      await client.query(sql);
      console.log('\x1b[32m✓ DONE\x1b[0m');
    }

    console.log('\n\x1b[32m\x1b[1m🎉 ALL MIGRATIONS EXECUTED SUCCESSFULLY!\x1b[0m');
    console.log('Your Supabase database is now 100% created, structured, and ready for use.\n');

    client.release();
  } catch (err) {
    console.error('\n\x1b[31m✗ Migration failed:\x1b[0m', err.message);
  } finally {
    await pool.end();
  }
}

runMigrations().catch(console.error);
