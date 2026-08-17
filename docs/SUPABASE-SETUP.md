# Supabase Setup Guide — TAYEEBA HOUSING LTD. ERP v2.6

> Complete this guide before starting backend deployment.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New Project**.
3. Fill in the project details:

   | Field                 | Value                                      |
   |-----------------------|--------------------------------------------|
   | **Name**              | `tayeeba-housing-erp` (or any name)        |
   | **Database Password** | Choose a strong password — **save it**     |
   | **Region**            | Select the region closest to your users    |

4. Click **Create new project** and wait ~2 minutes for provisioning.

---

## 2. Get the `DATABASE_URL`

1. In your project dashboard, go to **Settings → Database**.
2. Scroll to the **Connection string** section.
3. Select the **URI** tab.
4. Copy the connection string — it looks like:

   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.<project-ref>.supabase.co:5432/postgres
   ```

   > **Important:** Make sure the port is **5432** (not 6543). Port 6543 is the connection pooler and may cause migration issues.

5. Replace `[YOUR-PASSWORD]` with your actual database password.
6. Save this as `DATABASE_URL` in your `.env` file.

---

## 3. Get the `SUPABASE_SERVICE_ROLE_KEY`

1. In your project dashboard, go to **Settings → API**.
2. Under **Project API keys**, locate the **`service_role`** key.

   > **Caution:** The `service_role` key bypasses Row Level Security. Never expose it in client-side code or public repositories.

3. Click the eye icon to reveal it, then copy the value.
4. Save this as `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file.
5. Also copy the **Project URL** (e.g., `https://<project-ref>.supabase.co`) and save it as `SUPABASE_URL`.

---

## 4. Create Storage Buckets

The ERP requires four private storage buckets for document management.

1. In your project dashboard, go to **Storage**.
2. Click **New bucket** and create each of the following:

   | Bucket Name           | Access      | Purpose                        |
   |-----------------------|-------------|--------------------------------|
   | `customer-documents`  | **Private** | Customer KYC and agreements    |
   | `project-documents`   | **Private** | Project plans and permits      |
   | `land-documents`      | **Private** | Land deeds and survey reports  |
   | `employee-documents`  | **Private** | HR files and contracts         |

3. For each bucket:
   - Enter the bucket name **exactly** as shown above.
   - Leave the **Public bucket** toggle **OFF**.
   - Click **Save**.

> **Note:** Access to these buckets is controlled via the `SUPABASE_SERVICE_ROLE_KEY` on the backend. End users never receive direct bucket URLs.

---

## 5. Run Database Migrations

Migrations must be run **in order** from `001` through `012`.

1. In your project dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Open the `supabase/migrations/` folder in this repository.
4. For each file — in the exact order below — copy its full contents, paste into the SQL Editor, and click **Run** (`Ctrl + Enter`). Confirm the query succeeded before proceeding to the next file.

   ```
   001_initial_schema.sql
   002_customers.sql
   003_projects.sql
   004_land.sql
   005_sales.sql
   006_payments.sql
   007_employees.sql
   008_accounts.sql
   009_documents.sql
   010_audit_logs.sql
   011_rls_policies.sql
   012_seed_data.sql
   ```

> **Warning:** Do not skip files or run them out of order — later migrations depend on tables and functions created by earlier ones.

---

## 6. Configure the `.env` File

Copy `.env.example` to `server/.env` and populate the values collected above:

```env
# ─── Database ────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.<project-ref>.supabase.co:5432/postgres

# ─── Supabase ────────────────────────────────────────────────────
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ─── App ─────────────────────────────────────────────────────────
PORT=3001
JWT_SECRET=your_strong_jwt_secret_here
NODE_ENV=production
```

**Tip — Generate a secure `JWT_SECRET`:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Next Step

Proceed to [BACKEND-DEPLOYMENT.md](./BACKEND-DEPLOYMENT.md)
