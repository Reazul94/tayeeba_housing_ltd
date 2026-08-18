# TAYEEBA HOUSING LTD. ERP v2.6 — System Architecture

---

## 1. High-Level Architecture Overview

TAYEEBA HOUSING LTD. ERP follows a 3-tier enterprise architecture separating presentation, business logic/security, and persistence:

```
                          CLIENT LAYER
                      (Browser / Desktop / Mobile)
                               │
                               ↓ HTTPS
                       PRESENTATION LAYER
                         (GitHub Pages)
                   React 18 + Vite + TypeScript
                   Tailwind CSS + Lucide Icons
                               │
                               ↓ HTTPS REST + JWT
                         SECURITY GATEWAY
                       (Express REST API)
           ┌───────────────────┼───────────────────┐
           ↓                   ↓                   ↓
    Authentication           RBAC            Business Logic
      (bcrypt)           (Multi-Layer)      (Atomic Txns)
           │                   │                   │
           └───────────────────┼───────────────────┘
                               ↓
                       PERSISTENCE LAYER
                     (Supabase PostgreSQL)
           ┌───────────────────┼───────────────────┐
           ↓                   ↓                   ↓
       ERP Tables          Audit Logs        Sequences
                               │
                               ↓ Signed URLs
                        STORAGE LAYER
                      (Supabase Storage)
                  Customer & Project Documents
```

---

## 2. Key Architectural Tenets

1. **No Direct Frontend Database Access**: The React application never executes raw queries or connects directly to PostgreSQL. All sensitive transactions (bookings, payments, receipts, journal entries, payroll) are handled exclusively via the Express API.
2. **Authoritative Cloud Database**: Supabase PostgreSQL is the single source of truth across all office workstations and remote users.
3. **Atomic Operations with Row Locking**: Plot booking operations use `SELECT ... FOR UPDATE` row-level locks within database transactions to physically prevent race conditions and double-bookings.
4. **Deterministic Precedence in RBAC**: Explicit user denies take precedence over inherited role permissions.
5. **Fail-Safe Offline Guard**: Financial mutations are strictly blocked if network connectivity to the API is unavailable.
