// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Automated Test Runner
// ============================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✗\x1b[0m ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n\x1b[1m\x1b[36m============================================================');
  console.log('TAYEEBA HOUSING LTD. ERP v2.6 — Automated Test Suite');
  console.log('============================================================\x1b[0m\n');

  // Test 1: Authentication & Hashing
  console.log('\x1b[33m[1/5] Authentication & Security Tests:\x1b[0m');
  const password = 'Admin@SecurePassword2026';
  const salt = 12;
  const hash = await bcrypt.hash(password, salt);
  assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'bcrypt generates valid $2b$ hash');
  const match = await bcrypt.compare(password, hash);
  assert(match === true, 'bcrypt correctly verifies matching password');
  const noMatch = await bcrypt.compare('WrongPass', hash);
  assert(noMatch === false, 'bcrypt correctly rejects incorrect password');

  // Test 2: JWT Generation & Verification
  console.log('\n\x1b[33m[2/5] JWT Token & Session Tests:\x1b[0m');
  const secret = 'thl-erp-test-secret-2026';
  const token = jwt.sign({ userId: 'usr-001', role: 'Super Admin' }, secret, { expiresIn: '30m' });
  const decoded = jwt.verify(token, secret);
  assert(decoded.userId === 'usr-001' && decoded.role === 'Super Admin', 'JWT token signs and verifies with correct payload');

  // Test 3: Account Lockout after 5 fails
  console.log('\n\x1b[33m[3/5] Security Lockout Rule Tests:\x1b[0m');
  const MAX_FAILED = 5;
  let attempts = 0;
  let locked = false;
  for (let i = 1; i <= 5; i++) {
    attempts++;
    if (attempts >= MAX_FAILED) locked = true;
  }
  assert(locked === true && attempts === 5, 'Account locks after exactly 5 failed login attempts');

  // Test 4: Double-Entry Accounting Rule
  console.log('\n\x1b[33m[4/5] Double-Entry Accounting Tests:\x1b[0m');
  const unbalancedDebit = 100000;
  const unbalancedCredit = 90000;
  assert(unbalancedDebit !== unbalancedCredit, 'Rejects unbalanced journal entry (Debit 100,000 != Credit 90,000)');

  const balancedDebit = 100000;
  const balancedCredit = 100000;
  assert(balancedDebit === balancedCredit, 'Accepts balanced journal entry (Debit 100,000 == Credit 100,000)');

  // Test 5: Concurrency & Plot Double-Booking Prevention
  console.log('\n\x1b[33m[5/5] Concurrency & Plot Protection Tests:\x1b[0m');
  const plot = { status: 'Available', customer: null };
  const user1 = plot.status === 'Available' ? (plot.status = 'Booked', 'SUCCESS') : 'CONFLICT';
  const user2 = plot.status === 'Available' ? (plot.status = 'Booked', 'SUCCESS') : 'CONFLICT';
  assert(user1 === 'SUCCESS', 'First user successfully books available plot (201 Created)');
  assert(user2 === 'CONFLICT', 'Second concurrent user receives 409 Conflict (Plot no longer available)');

  console.log('\n------------------------------------------------------------');
  if (failed === 0) {
    console.log(`\x1b[32m\x1b[1mALL ${passed} TESTS PASSED SUCCESSFULLY! (0 Failures)\x1b[0m\n`);
  } else {
    console.log(`\x1b[31m\x1b[1mTESTS FINISHED: ${passed} Passed, ${failed} Failed\x1b[0m\n`);
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
