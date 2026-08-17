// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: Supabase PostgreSQL client initialization
// ============================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️  WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env\n' +
    '   The server will run in local-only mode without database persistence.\n' +
    '   Configure your Supabase credentials to enable full functionality.'
  );
}

// Service-role client — has full database access, used ONLY on backend
// NEVER expose this key to the frontend
export const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export default supabase;
