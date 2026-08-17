# Backend Deployment Guide — TAYEEBA HOUSING LTD. ERP v2.6

> Ensure you have completed [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) before proceeding.

---

## Option A — Deploy on Railway.app (Recommended)

Railway offers a free starter plan suitable for running the ERP backend.

### Step 1 — Push Your Code to GitHub

Ensure the repository is pushed to GitHub (private or public).

### Step 2 — Create a Railway Project

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project → Deploy from GitHub repo**.
3. Select your repository from the list and click **Deploy Now**.

### Step 3 — Configure Root Directory

1. In the Railway project, go to your service **Settings → Source**.
2. Set **Root Directory** to `server`.
3. Railway will automatically detect `package.json` and run `npm start`.

### Step 4 — Set Environment Variables

1. Go to your service **Variables** tab.
2. Add each variable from your `.env.example`:

   | Variable                    | Source                              |
   |-----------------------------|-------------------------------------|
   | `DATABASE_URL`              | Supabase → Settings → Database URI  |
   | `SUPABASE_URL`              | Supabase → Settings → API           |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API           |
   | `JWT_SECRET`                | Generate with `crypto.randomBytes`  |
   | `PORT`                      | `3001`                              |
   | `NODE_ENV`                  | `production`                        |

### Step 5 — Get the Public URL

1. Go to your service **Settings → Networking**.
2. Click **Generate Domain** to get a public URL, e.g.:
   ```
   https://tayeeba-housing-erp-production.up.railway.app
   ```
3. Copy this URL — you will use it as `VITE_API_URL` for the frontend build.

---

## Option B — Run Locally

### Step 1 — Copy and Configure `.env`

```bash
cp .env.example server/.env
```

Open `server/.env` and fill in the required values (see [SUPABASE-SETUP.md](./SUPABASE-SETUP.md#6-configure-the-env-file)).

### Step 2 — Install Dependencies and Start

```bash
cd server
npm install
npm start
```

The server will start on `http://localhost:3001` by default.

### Step 3 — Create the First Admin User

Run the admin creation script from the project root:

```bash
cd server
node ../scripts/create-admin.js
```

Follow the prompts to set the admin **email** and **password**. This account will have full system access.

> **Note:** This script only needs to be run once on initial setup. Additional users can be managed from within the ERP admin panel.

---

## GitHub Actions — Set `VITE_API_URL` Secret

The GitHub Actions workflow builds the frontend and deploys it to GitHub Pages. It needs the backend URL at build time.

1. In your GitHub repository, go to **Settings → Secrets and variables → Actions**.
2. Click **New repository secret**.
3. Add the following secret:

   | Name            | Value                                                          |
   |-----------------|----------------------------------------------------------------|
   | `VITE_API_URL`  | Your Railway public URL, e.g. `https://your-app.railway.app`  |

4. The next push to the `main` branch (or manual workflow trigger) will pick up the new secret automatically.

> **Tip:** If you change the Railway URL (e.g., after re-deploying), update this secret and re-run the workflow to rebuild the frontend with the new API endpoint.

---

## Verify Deployment

After starting the backend (locally or on Railway), verify it is healthy:

```bash
curl https://your-backend-url/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## Next Step

Build and deploy the frontend:

```bash
# Install frontend dependencies
npm install

# Build for production
VITE_API_URL=https://your-backend-url npm run build

# Or if using GitHub Actions, push to main branch
git push origin main
```

The frontend will be live at: **https://reazul94.github.io/tayeeba_housing_ltd/**
