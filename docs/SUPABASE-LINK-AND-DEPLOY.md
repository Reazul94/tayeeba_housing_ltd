# TAYEEBA HOUSING LTD. ERP v2.7 — Supabase Linking & Backend Deployment Guide

---

## 📌 Your Supabase Project Details
- **Project Reference ID:** `hhekscmiiuvkqkwvezhb`
- **Region:** `ap-northeast-1` (Tokyo, Japan)
- **Supabase REST URL:** `https://hhekscmiiuvkqkwvezhb.supabase.co`
- **PostgreSQL Pooler Host:** `aws-0-ap-northeast-1.pooler.supabase.com` (Port `5432` or `6543`)
- **Direct Database Host:** `db.hhekscmiiuvkqkwvezhb.supabase.co` (Port `5432`)

---

## 🔗 Step 1: Get Your Database Connection String

In your Supabase Dashboard:
1. Go to **Project Settings** (gear icon) → **Database**.
2. Scroll down to **Connection String** → select **URI** mode.
3. Your connection string format is:
   ```env
   postgresql://postgres.hhekscmiiuvkqkwvezhb:[YOUR_DB_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
   ```
   *(Replace `[YOUR_DB_PASSWORD]` with the password you set when creating the Supabase project).*

---

## 🚀 Step 2: Deploy Your Backend API (3 Minutes)

You can deploy the Node.js Express server to **Railway.app** or **Render.com** (both connect directly to GitHub).

### Option A: Deploy on Railway (Recommended)
1. Go to [**railway.app**](https://railway.app) and sign in with GitHub.
2. Click **"New Project"** → **"Deploy from GitHub repo"** → select `Reazul94/tayeeba_housing_ltd`.
3. In Project Settings:
   - **Root Directory:** `server`
4. In **Variables** tab, add:
   - `DATABASE_URL` = `postgresql://postgres.hhekscmiiuvkqkwvezhb:[YOUR_DB_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`
   - `JWT_SECRET` = `5c6b44b039d89c925b4ad1e93d2e07da5bc452dea17e2ca39f86b1cd8ea813d3`
   - `JWT_REFRESH_SECRET` = `e2bdb53e8421e46e9be1840233a62d3e9261da125e0e93005c16b1de35d38683`
   - `SUPABASE_URL` = `https://hhekscmiiuvkqkwvezhb.supabase.co`
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
5. Railway will deploy and generate a public URL for you (e.g. `https://tayeeba-erp-production.up.railway.app`).

---

## 🌐 Step 3: Link Backend to the Live Frontend

1. Go to your GitHub repository: [**https://github.com/Reazul94/tayeeba_housing_ltd**](https://github.com/Reazul94/tayeeba_housing_ltd)
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **"New repository secret"**:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://tayeeba-erp-production.up.railway.app/api` *(your Railway public URL + /api)*
4. Run `npm run deploy` to update the GitHub Pages live preview.

---

## 👤 Step 4: Create Initial Super Admin Account

Once connected, run this command to provision your Super Admin login:
```bash
node scripts/create-admin.js
```
Follow the interactive prompts to set:
- **Employee Code:** `THL-EMP-00001`
- **Display Name:** `Al-Haj Engr. Tayeebur Rahman`
- **Email:** `info@tayeebahousing.com` (or your email)
- **Password:** *(Your chosen administrative master password)*
