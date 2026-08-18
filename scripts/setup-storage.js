// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Script: Initialize & Verify Supabase Storage Buckets
// Run: node scripts/setup-storage.js
// ============================================================

import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const { Pool } = pkg;

const requiredBuckets = [
  { id: 'customer-documents', name: 'customer-documents', public: false, sizeLimit: 10485760 },
  { id: 'project-documents', name: 'project-documents', public: false, sizeLimit: 52428800 },
  { id: 'land-documents', name: 'land-documents', public: false, sizeLimit: 52428800 },
  { id: 'employee-documents', name: 'employee-documents', public: false, sizeLimit: 10485760 },
  { id: 'receipts', name: 'receipts', public: false, sizeLimit: 10485760 }
];

async function setupStorage() {
  console.log('\n\x1b[1m\x1b[36m============================================================');
  console.log('TAYEEBA HOUSING LTD. ERP — Supabase Storage Provisioning');
  console.log('============================================================\x1b[0m\n');

  if (!process.env.DATABASE_URL) {
    console.error('\x1b[31m✗ DATABASE_URL is not set in server/.env.\x1b[0m');
    console.log('Please configure your Supabase credentials in server/.env first.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    console.log('\x1b[32m✓\x1b[0m Connected to Supabase PostgreSQL.\n');

    // 1. Ensure storage schema and buckets table
    await client.query(`CREATE SCHEMA IF NOT EXISTS storage`);
    
    console.log('Creating/verifying private storage buckets:');
    for (const b of requiredBuckets) {
      await client.query(
        `INSERT INTO storage.buckets (id, name, public, file_size_limit)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           public = EXCLUDED.public,
           file_size_limit = EXCLUDED.file_size_limit`,
        [b.id, b.name, b.public, b.sizeLimit]
      );
      console.log(`  \x1b[32m✓\x1b[0m Bucket '${b.id}' (Private, max ${(b.sizeLimit / 1024 / 1024).toFixed(0)}MB) is ready.`);
    }

    // 2. Enable RLS on storage.objects
    try {
      await client.query(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY`);
      await client.query(
        `DO $$ BEGIN
           IF NOT EXISTS (
             SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access to storage'
           ) THEN
             CREATE POLICY "Service role full access to storage" ON storage.objects FOR ALL TO service_role USING (true) WITH CHECK (true);
           END IF;
         END $$;`
      );
      console.log(`  \x1b[32m✓\x1b[0m Storage Row-Level Security (RLS) policies verified.`);
    } catch (e) {
      console.log(`  \x1b[33mℹ Storage RLS note:\x1b[0m ${e.message}`);
    }

    console.log('\n\x1b[32m\x1b[1mAll private document storage buckets provisioned successfully!\x1b[0m\n');
    client.release();
  } catch (err) {
    console.error('\x1b[31m✗ Storage setup error:\x1b[0m', err.message);
  } finally {
    await pool.end();
  }
}

setupStorage().catch(console.error);
