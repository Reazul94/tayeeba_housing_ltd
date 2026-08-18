# TAYEEBA HOUSING LTD. ERP v2.6 — GitHub Pages Deployment Guide

---

## 1. Automated CI/CD Workflow

The frontend is built and deployed automatically using GitHub Actions via `.github/workflows/deploy.yml`:

```
Git Push to main
  ↓
GitHub Actions Runner (Ubuntu Latest, Node.js 20)
  ↓
npm ci
  ↓
Build (Vite Build with Base Path /tayeeba_housing_ltd/)
  ↓
Upload Build Artifacts (./dist)
  ↓
Deploy to GitHub Pages Environment
```

---

## 2. Configuration & Secrets

In GitHub Repository → **Settings → Secrets and variables → Actions**:
- `VITE_API_URL`: Set to your production API URL (e.g. `https://api.tayeebahousing.com/api` or `https://tayeeba-erp-production.up.railway.app/api`).

---

## 3. SPA Routing & 404 Fallback

GitHub Pages serves static files. To handle client-side routing on direct URL reloads (e.g. `/tayeeba_housing_ltd/projects`), a `404.html` redirection script is configured in `public/404.html` and deployed to `docs/` and `dist/`.
