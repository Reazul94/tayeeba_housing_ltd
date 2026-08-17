// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: PostgreSQL database client (node-postgres / pg)
// Connects to Supabase PostgreSQL via DATABASE_URL
// Compatible with Node.js 16+
// ============================================================

import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Build connection config
// In production: set DATABASE_URL in environment
// Supabase connection string format:
//   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,               // max pool connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      // Local development fallback (SQLite still used in server.js for legacy)
      host: 'localhost',
      port: 5432,
      database: 'tayeeba_erp',
      user: 'postgres',
      password: 'postgres',
      max: 5,
    };

export const pool = new Pool(connectionConfig);

// Test connection and log status
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

/**
 * Execute a query with automatic connection management
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      // console.debug(`Query: ${text.substring(0, 60)}... [${duration}ms]`);
    }
    return result;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
}

/**
 * Get a client from the pool for transactions
 * IMPORTANT: Always call client.release() in finally block
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Execute a function within a database transaction
 * Automatically commits on success, rolls back on error
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Check database connectivity
 */
export async function checkConnection() {
  try {
    const result = await query('SELECT NOW() as server_time, version() as pg_version');
    return {
      connected: true,
      serverTime: result.rows[0].server_time,
      pgVersion: result.rows[0].pg_version.split(' ')[1],
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

export default { pool, query, getClient, withTransaction, checkConnection };
