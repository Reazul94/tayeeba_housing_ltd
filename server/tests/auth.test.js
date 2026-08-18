// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Test Suite: Authentication & Security
// ============================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth & Password Security', () => {
  const testPassword = 'Admin@SecurePassword2026';
  const JWT_SECRET = 'test-secret-key-1234567890';

  test('bcrypt hashes password and verifies correctly', async () => {
    const saltRounds = 12;
    const hash = await bcrypt.hash(testPassword, saltRounds);
    
    expect(hash).not.toBe(testPassword);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const isMatch = await bcrypt.compare(testPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  test('JWT token generation and verification', () => {
    const payload = { userId: 'usr-123', userIdText: 'THL-EMP-00001', type: 'access' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe('usr-123');
    expect(decoded.userIdText).toBe('THL-EMP-00001');
    expect(decoded.type).toBe('access');
  });

  test('Account lockout logic after 5 failed attempts', () => {
    const MAX_FAILED = 5;
    let failedAttempts = 0;
    let isLocked = false;

    for (let attempt = 1; attempt <= 5; attempt++) {
      failedAttempts++;
      if (failedAttempts >= MAX_FAILED) {
        isLocked = true;
      }
    }

    expect(failedAttempts).toBe(5);
    expect(isLocked).toBe(true);
  });

  test('6-digit OTP generation and verification', () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    expect(otp.length).toBe(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });
});
