# TAYEEBA HOUSING LTD. — ERP v2.6

> **Enterprise Resource Planning System** for real estate development, sales, land management, accounts, and HR — built with React, Node.js, and Supabase PostgreSQL.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://reazul94.github.io/tayeeba_housing_ltd/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20via%20Supabase-336791?logo=postgresql)](https://supabase.com)

🌐 **Live URL:** [https://reazul94.github.io/tayeeba_housing_ltd/](https://reazul94.github.io/tayeeba_housing_ltd/)

---

## Overview

TAYEEBA HOUSING LTD. ERP is a full-stack business management system designed for real estate and housing development companies. It centralises customer management, project tracking, land registry, sales pipeline, payment collection, employee records, and financial accounts into a single, role-based web application.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React 18, Vite, TypeScript, Tailwind CSS        |
| Backend     | Node.js, Express.js, REST API                   |
| Database    | PostgreSQL (hosted on Supabase)                 |
| Auth        | JWT-based authentication with role-based access |
| Storage     | Supabase Storage (private buckets)              |
| CI/CD       | GitHub Actions → GitHub Pages                   |
| Hosting     | Railway.app (backend) + GitHub Pages (frontend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER / CLIENT                    │
│         React + Vite + TypeScript (GitHub Pages)        │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS REST (VITE_API_URL)
┌───────────────────────────▼─────────────────────────────┐
│                    BACKEND API SERVER                   │
│              Node.js + Express  (Railway.app)           │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth/JWT    │  │  REST Routes │  │  File Upload │  │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────────────────────┬─┘─────────────────┼───────────┘
                          │                   │
          ┌───────────────▼───────────────────▼───────────┐
          │                  SUPABASE                      │
          │  ┌─────────────────┐   ┌─────────────────┐    │
          │  │  PostgreSQL DB  │   │  Storage Buckets │    │
          │  │  (12 migrations)│   │  (4 private)     │    │
          │  └─────────────────┘   └─────────────────┘    │
          └────────────────────────────────────────────────┘
```

---

## Quick Start (3 Steps)

### Step 1 — Supabase Setup

Set up the cloud database and storage.

```
See: docs/SUPABASE-SETUP.md
```

- Create a Supabase project
- Copy `DATABASE_URL` (port 5432) and `SUPABASE_SERVICE_ROLE_KEY`
- Create 4 private storage buckets
- Run SQL migrations `001` through `012` in the SQL Editor

### Step 2 — Backend Setup

Deploy or run the Express API server.

```bash
# Local development
cp .env.example server/.env
# Edit server/.env with your Supabase credentials
cd server && npm install && npm start

# Create the first admin account
cd server && node ../scripts/create-admin.js
```

For production deployment on Railway.app, see [`docs/BACKEND-DEPLOYMENT.md`](./docs/BACKEND-DEPLOYMENT.md).

### Step 3 — Frontend Build

```bash
# Install dependencies
npm install

# Build with your backend URL
VITE_API_URL=https://your-backend.railway.app npm run build

# Or push to main — GitHub Actions will build and deploy automatically
git push origin main
```

---

## Available Modules

The ERP includes **25+ business modules** covering the full operations of a housing development company:

| Category          | Modules                                                                 |
|-------------------|-------------------------------------------------------------------------|
| **CRM**           | Customer Management, Customer Documents, Customer Notes                 |
| **Sales**         | Sales Pipeline, Booking Management, Plot Allocation, Sales Reports      |
| **Projects**      | Project Registry, Unit/Plot Tracking, Project Documents                 |
| **Land**          | Land Registry, Land Documents, Land Valuation                           |
| **Payments**      | Payment Collection, Installment Schedules, Receipt Generation           |
| **Accounts**      | Chart of Accounts, Journal Entries, Ledger, Trial Balance, P&L, Balance Sheet |
| **HR**            | Employee Records, Attendance, Payroll, Employee Documents               |
| **Procurement**   | Vendor Management, Purchase Orders, Inventory                           |
| **Administration**| User Management, Role & Permissions, Audit Logs, System Settings        |
| **Reporting**     | Sales Reports, Financial Reports, HR Reports, Dashboard Analytics       |

---

## Repository Structure

```
tayeeba-housing-erp/
├── public/                    # Static assets
├── src/                       # React frontend source
│   ├── components/            # Shared UI components
│   ├── modules/               # Feature modules (CRM, Sales, HR, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API client services
│   └── types/                 # TypeScript type definitions
├── server/                    # Express backend
│   ├── routes/                # API route handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── controllers/           # Business logic
│   └── index.js               # Server entry point
├── supabase/
│   └── migrations/            # SQL migration files (001–012)
├── scripts/
│   └── create-admin.js        # First-run admin creation script
├── docs/
│   ├── SUPABASE-SETUP.md      # Database setup guide
│   └── BACKEND-DEPLOYMENT.md  # Deployment guide
├── .env.example               # Environment variable template
├── .github/
│   └── workflows/             # GitHub Actions CI/CD pipeline
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Security Features

- **JWT Authentication** — All API endpoints require a signed JWT token
- **Role-Based Access Control (RBAC)** — Admin, Manager, and Staff permission levels
- **Row Level Security (RLS)** — Enforced at the database layer via Supabase policies (migration `011`)
- **Private Storage Buckets** — Documents are never publicly accessible; served through signed URLs
- **Audit Logging** — All create, update, and delete operations are recorded with user and timestamp
- **Environment Isolation** — Secrets managed via environment variables; no credentials committed to repository

---

## Environment Variables

Copy `.env.example` to `server/.env` and fill in the values:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=production
```

For GitHub Actions, add `VITE_API_URL` as a repository secret.

---

## Documentation

| File                                                | Description                          |
|-----------------------------------------------------|--------------------------------------|
| [`docs/SUPABASE-SETUP.md`](./docs/SUPABASE-SETUP.md) | Supabase project & database setup  |
| [`docs/BACKEND-DEPLOYMENT.md`](./docs/BACKEND-DEPLOYMENT.md) | Railway & local backend setup  |

---

## License

© 2024 TAYEEBA HOUSING LTD. All rights reserved.
