# TAYEEBA HOUSING LTD. ERP v2.6 — User Management & Security Guide

---

## 1. User Lifecycle Workflow

1. **HR Employee Creation**: The employee record is added in the HR module with an official Employee Code (e.g. `THL-EMP-00045`).
2. **User Account Provisioning**: System Administrator opens `/users` → "New User Wizard":
   - Step 1: Select employee.
   - Step 2: Set User ID (defaults to Employee Code).
   - Step 3: Set designation & department.
   - Step 4: Assign roles.
   - Step 5: Configure allowed modules.
   - Step 6: Configure menu access.
   - Step 7: Configure action permissions (View, Create, Edit, Delete, Approve, Export, Print).
   - Step 8: Set temporary password (e.g. `User@12345`).
   - Step 9: Review access summary.
   - Step 10: Activate account.
3. **Mandatory First Login**: Upon first login, user status is `INITIAL` with `must_change_password = true`. User must provide a new strong password before accessing the dashboard.
4. **Account Lockout Policy**: After 5 failed password attempts, the account is automatically locked and requires Administrator intervention to unlock.
