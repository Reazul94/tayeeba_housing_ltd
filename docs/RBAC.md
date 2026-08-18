# TAYEEBA HOUSING LTD. ERP v2.6 — Role-Based Access Control (RBAC)

---

## 1. Multi-Layer Permission Model

Access in Tayeeba ERP is determined by a 6-tier authorization pipeline:

```
User Account (ACTIVE & Unlocked)
  ↓
Assigned Roles (`user_user_role`)
  ↓
Allowed Modules (`user_role_module`)
  ↓
Allowed Menus (`user_role_menu`)
  ↓
Action Permissions (View, Create, Edit, Delete, Approve, Export, Print)
  ↓
User Overrides & Exclusions (`user_permission`)
```

---

## 2. Default System Roles

1. **Super Admin**: Full unrestricted system access. Bypasses all module/menu guards.
2. **System Admin**: User management, role definitions, and system settings. No financial mutations.
3. **CEO / Director**: Operational oversight, financial approvals, executive reports, and audit logs.
4. **General Manager**: Cross-departmental operational approvals and CRM pipeline reviews.
5. **Accounts Manager**: Chart of accounts, journal approval, balance sheet, and money receipt oversight.
6. **Account Officer**: Payment recording, receipt generation, and expense entries.
7. **Sales Manager**: Booking approvals, commission rate adjustments, and lead assignments.
8. **Sales Executive**: Lead registration, site visit bookings, customer creation, and booking requests.
9. **Marketing**: CRM lead imports and campaign tracking.
10. **HR Manager**: Employee onboarding, organogram management, and monthly payroll approval.
11. **HR Officer**: Attendance recording and leave entry.
12. **Project Manager**: Site development progress, work orders, and land acquisition records.
13. **Read Only**: View-only access across enabled modules without create/edit/delete abilities.
