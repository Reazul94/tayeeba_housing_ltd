# TAYEEBA HOUSING LTD. ERP v2.6 — Backup & Disaster Recovery

---

## 1. Backup Strategy

1. **Automated Cloud Backups**: Supabase performs automated daily snapshots and continuous Write-Ahead Logging (WAL) for Point-In-Time Recovery (PITR).
2. **Manual SQL Dumps**: Export full schema and data using `pg_dump`:
   ```bash
   pg_dump --clean --if-exists --no-owner -h db.[PROJECT-REF].supabase.co -U postgres -d postgres -f backup_$(date +%Y%m%d).sql
   ```
3. **Application-Level Export**: The Express API `/api/backups/export` generates structured JSON snapshots of core operational ledgers for offline compliance audits.

---

## 2. Disaster Recovery Protocol

In the event of database disaster:
1. Provision a new Supabase PostgreSQL instance.
2. Restore latest snapshot via Supabase Dashboard or execute `psql -f backup.sql`.
3. Update `DATABASE_URL` in `server/.env`.
4. Run `npm test` to verify zero data corruption.
