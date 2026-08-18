# TAYEEBA HOUSING LTD. ERP v2.6 — Troubleshooting & Diagnostic Guide

---

## Common Issues & Solutions

### 1. "Cannot connect to the ERP server" / Network Error
- **Cause**: Backend Express API is stopped, or `VITE_API_URL` points to an incorrect host/port.
- **Fix**: Verify backend is running by navigating to `http://localhost:5000/api/health` or your production API URL in your browser. Ensure CORS includes your frontend domain.

### 2. "Account is locked"
- **Cause**: User entered incorrect password 5 times.
- **Fix**: System Administrator can go to `/users` → Select user → Click "Unlock Account". Alternatively, use the Forgot Password OTP workflow to verify email and set a new password.

### 3. "Plot is no longer available (409 Conflict)"
- **Cause**: Another concurrent user finalized a booking for the same plot moments earlier.
- **Fix**: Refresh plot map to select another available plot. Double-booking prevention is operating as intended.

### 4. "Unbalanced journal entry"
- **Cause**: Total debits do not equal total credits.
- **Fix**: Adjust ledger line amounts until Debit = Credit before posting voucher.
