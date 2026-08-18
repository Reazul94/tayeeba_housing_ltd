# TAYEEBA HOUSING LTD. ERP v2.6 — Database Architecture & Schema

---

## 1. Relational Entity Structure

The database schema is organized into 12 structured migrations in `supabase/migrations/`:

| Migration File | Primary Tables / Functions | Description |
|---|---|---|
| `001_initial_schema.sql` | `hr_employee`, `user_info`, `user_roles`, `user_user_role`, `user_session` | Core employee directory, user authentication, and active JWT session store. |
| `002_rbac.sql` | `user_module`, `user_role_module`, `user_menu`, `user_role_menu`, `user_permission`, `user_designation`, `user_designation_history`, `user_login_history` | Enterprise Role-Based Access Control matrix and organogram history. |
| `003_projects.sql` | `project`, `project_block`, `project_zone`, `project_road` | Real estate projects and spatial sub-divisions. |
| `004_plots.sql` | `plot` | Plot inventory, pricing, facing, dimensions, and customer linkage. |
| `005_customers.sql` | `customer`, `customer_nominee`, `lead`, `follow_up`, `site_visit` | CRM pipeline, leads, scheduled site visits, and customer 360 profiles. |
| `006_booking.sql` | `booking`, `installment`, `payment`, `receipt`, `create_booking_atomic()` | Transactional booking engine with row-level locks and money receipt sequence generator. |
| `007_accounting.sql` | `account`, `journal_entry`, `journal_entry_line`, `ledger_entry` | Double-entry accounting with balance constraint `CHECK (total_debit = total_credit)`. |
| `008_operations.sql` | `expense`, `vendor`, `purchase`, `land_owner`, `land_parcel`, `land_payment`, `site_development` | Operations, site construction, vendor bills, and land acquisitions. |
| `009_hr.sql` | `hr_employee_detail`, `attendance`, `leave_request`, `payroll`, `commission`, `transfer`, `refund` | Attendance, leave approvals, monthly salary sheets, and ownership transfers. |
| `010_documents_audit.sql` | `document`, `audit_log`, `notification`, `system_settings` | Supabase storage metadata, immutable audit log, notifications, and company profile. |
| `011_indexes.sql` | Indexes on NID, Mobile, Customer Code, Plot Number, Receipt Number, Timestamps | Database query optimization. |
| `012_seed_rbac.sql` | Seed dataset | 13 default roles, 29 modules, 34 menus, Super Admin permissions, and demo project. |

---

## 2. Sequence & Atomic Functions

- `receipt_number_seq`: PostgreSQL sequence generating strictly sequential numbers for money receipts `THL-MR-YYYY-XXXX`.
- `create_booking_atomic()`: Stored function that executes plot locking (`SELECT ... FOR UPDATE`), price validation, booking creation, installment generation, and customer profile updates inside a single ACID transaction.
