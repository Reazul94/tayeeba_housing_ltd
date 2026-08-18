# TAYEEBA HOUSING LTD. ERP v2.6 — SQLite to PostgreSQL Migration Guide

---

## 1. Migration Overview

This guide explains how to migrate existing local records from SQLite (`server/tayeeba_erp.db`) to the production Supabase PostgreSQL database.

---

## 2. Step-by-Step Migration

1. **Verify Supabase Connectivity**:
   Ensure `server/.env` contains your active `DATABASE_URL`.
2. **Execute Migration Script**:
   ```bash
   node scripts/migrate-sqlite-to-pg.js
   ```
3. **Reconciliation & Verification**:
   The script runs data count and integrity checks:
   - Validates total employees and users.
   - Preserves historical designation assignments and employee codes.
   - Retains original SQLite database file without destructive changes.
