# TAYEEBA HOUSING LTD. ERP v2.6 — Security & Compliance Architecture

---

## 1. Security Checklist

- [x] **bcrypt Password Hashing**: Passwords stored with 12 salt rounds. Plaintext passwords never logged or transmitted back.
- [x] **JWT Authentication**: Short-lived 30-minute access tokens with 7-day refresh token rotation.
- [x] **Backend-Enforced RBAC**: Every protected API route enforces module, menu, and action permissions.
- [x] **Account Lockout Policy**: Automatically locks accounts after 5 consecutive failed login attempts.
- [x] **Strict CORS Policy**: Disallows wildcard `*` origins; permits only authenticated frontend URLs.
- [x] **Zero Plaintext Secrets**: Service role keys, database passwords, and JWT secrets are strictly managed via environment variables.
- [x] **Immutable Audit Log**: Every financial mutation, user access change, and security event is permanently written to `audit_log`.
