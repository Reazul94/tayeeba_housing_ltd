// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: Authentication Routes
// POST /api/auth/login
// POST /api/auth/logout
// POST /api/auth/change-password
// POST /api/auth/refresh
// GET  /api/auth/me
// GET  /api/auth/permissions
// POST /api/auth/forgot-password
// ============================================================

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, withTransaction } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const JWT_SECRET         = process.env.JWT_SECRET         || 'thl-dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET  || 'thl-dev-refresh-secret-change-in-production';
const ACCESS_EXPIRY      = '30m';
const REFRESH_EXPIRY     = '7d';
const MAX_FAILED_LOGINS  = parseInt(process.env.MAX_FAILED_LOGINS || '5');

// Helper: generate JWT tokens
function generateTokens(userId, userUuid) {
  const accessToken = jwt.sign(
    { userId: userUuid, userIdText: userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { userId: userUuid, userIdText: userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
  return { accessToken, refreshToken };
}

// Helper: audit log
async function auditLog(client, { userId, userIdText, action, module, description, ip, userAgent }) {
  try {
    await (client || { query: query }).query(
      `INSERT INTO audit_log (user_id, user_id_text, action, module, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, userIdText || '', action, module, description, ip, userAgent]
    );
  } catch (err) {
    // Non-fatal: audit log failures should not block business operations
    console.error('Audit log error:', err.message);
  }
}

// ============================================================
// POST /api/auth/login
// ============================================================
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and Password are required.' });
  }

  try {
    // Fetch user
    const result = await query(
      `SELECT * FROM user_info WHERE user_id = $1`,
      [userId.trim()]
    );

    // Generic error for unknown user (don't reveal existence)
    if (result.rows.length === 0) {
      await query(
        `INSERT INTO user_login_history (user_id_text, ip_address, user_agent, success, failure_reason)
         VALUES ($1, $2, $3, false, $4)`,
        [userId, ip, userAgent, 'USER_NOT_FOUND']
      );
      return res.status(401).json({ error: 'Invalid User ID or Password.' });
    }

    const user = result.rows[0];

    // Account status checks
    if (user.is_locked || user.status === 'LOCKED') {
      return res.status(403).json({
        error: 'Account is locked due to multiple failed login attempts. Please contact System Administrator.',
        status: 'LOCKED',
      });
    }

    if (!user.is_active || ['INACTIVE', 'DISABLED', 'SUSPENDED'].includes(user.status)) {
      return res.status(403).json({
        error: 'Your account is not active. Please contact System Administrator.',
        status: user.status,
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      const newAttempts = user.failed_login_attempts + 1;
      const shouldLock = newAttempts >= MAX_FAILED_LOGINS;

      await query(
        `UPDATE user_info 
         SET failed_login_attempts = $1,
             is_locked = $2,
             status = CASE WHEN $2 THEN 'LOCKED'::text ELSE status END,
             locked_at = CASE WHEN $2 THEN NOW() ELSE locked_at END,
             updated_at = NOW()
         WHERE id = $3`,
        [newAttempts, shouldLock, user.id]
      );

      await query(
        `INSERT INTO user_login_history (user_id, user_id_text, ip_address, user_agent, success, failure_reason)
         VALUES ($1, $2, $3, $4, false, $5)`,
        [user.id, userId, ip, userAgent, 'INVALID_PASSWORD']
      );

      if (shouldLock) {
        return res.status(403).json({
          error: `Account locked after ${MAX_FAILED_LOGINS} failed attempts. Please contact System Administrator.`,
          status: 'LOCKED',
        });
      }

      return res.status(401).json({
        error: `Invalid User ID or Password. ${MAX_FAILED_LOGINS - newAttempts} attempt(s) remaining.`,
      });
    }

    // Successful login — reset failed attempts
    await query(
      `UPDATE user_info 
       SET failed_login_attempts = 0, last_login_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.user_id, user.id);

    // Store refresh token session
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sessionResult = await query(
      `INSERT INTO user_session (user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.id, refreshToken, ip, userAgent, sessionExpiry]
    );

    // Record login history
    await query(
      `INSERT INTO user_login_history (user_id, user_id_text, ip_address, user_agent, success, session_id)
       VALUES ($1, $2, $3, $4, true, $5)`,
      [user.id, userId, ip, userAgent, sessionResult.rows[0].id]
    );

    // Audit
    await auditLog(null, {
      userId: user.id,
      userIdText: user.user_id,
      action: 'LOGIN',
      module: 'auth',
      description: `User ${user.user_id} logged in successfully`,
      ip,
      userAgent,
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      mustChangePassword: user.must_change_password,
      user: {
        id: user.id,
        userId: user.user_id,
        employeeCode: user.employee_code,
        displayName: user.display_name,
        email: user.email,
        status: user.status,
        mustChangePassword: user.must_change_password,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Login service unavailable. Please try again.' });
  }
});

// ============================================================
// POST /api/auth/logout
// ============================================================
router.post('/logout', authenticate, async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  try {
    // Invalidate all active sessions for this user
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.decode(token);
        if (decoded?.userId) {
          await query(
            `UPDATE user_session SET is_valid = false, invalidated_at = NOW() WHERE user_id = $1 AND is_valid = true`,
            [decoded.userId]
          );
        }
      } catch (e) { /* ignore decode errors */ }
    }

    // Update last logout
    await query(
      `UPDATE user_info SET last_logout_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [req.user.id]
    );

    // Update login history
    await query(
      `UPDATE user_login_history SET logout_at = NOW() 
       WHERE user_id = $1 AND logout_at IS NULL 
       ORDER BY login_at DESC LIMIT 1`,
      [req.user.id]
    );

    await auditLog(null, {
      userId: req.user.id,
      userIdText: req.user.userId,
      action: 'LOGOUT',
      module: 'auth',
      description: `User ${req.user.userId} logged out`,
      ip,
      userAgent,
    });

    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ error: 'Logout error.' });
  }
});

// ============================================================
// POST /api/auth/change-password
// ============================================================
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  try {
    const result = await query(`SELECT password_hash FROM user_info WHERE id = $1`, [req.user.id]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const SALT_ROUNDS = 12;
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
      `UPDATE user_info 
       SET password_hash = $1,
           must_change_password = false,
           status = CASE WHEN status = 'INITIAL' THEN 'ACTIVE' ELSE status END,
           last_password_change_at = NOW(),
           password_expires_at = NOW() + INTERVAL '90 days',
           updated_at = NOW(),
           updated_by = $2
       WHERE id = $3`,
      [newHash, req.user.userId, req.user.id]
    );

    // Invalidate all other sessions (security: force re-login on other devices)
    await query(
      `UPDATE user_session SET is_valid = false, invalidated_at = NOW() WHERE user_id = $1 AND is_valid = true`,
      [req.user.id]
    );

    await auditLog(null, {
      userId: req.user.id,
      userIdText: req.user.userId,
      action: 'PASSWORD_CHANGE',
      module: 'auth',
      description: `User ${req.user.userId} changed their password`,
      ip,
      userAgent,
    });

    return res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    console.error('Password change error:', err.message);
    return res.status(500).json({ error: 'Password change failed. Please try again.' });
  }
});

// ============================================================
// POST /api/auth/refresh
// ============================================================
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required.', code: 'NO_REFRESH_TOKEN' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH' });
    }

    // Verify session is still valid in DB
    const sessionResult = await query(
      `SELECT * FROM user_session WHERE refresh_token = $1 AND is_valid = true AND expires_at > NOW()`,
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED' });
    }

    // Get user
    const userResult = await query(`SELECT * FROM user_info WHERE id = $1`, [decoded.userId]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'User account not found or inactive.' });
    }

    const user = userResult.rows[0];

    // Rotate refresh token (invalidate old, issue new)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.user_id, user.id);
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      `UPDATE user_session SET is_valid = false, invalidated_at = NOW() WHERE refresh_token = $1`,
      [refreshToken]
    );

    await query(
      `INSERT INTO user_session (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, newRefreshToken, sessionExpiry]
    );

    return res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error('Token refresh error:', err.message);
    return res.status(500).json({ error: 'Token refresh failed.' });
  }
});

// ============================================================
// GET /api/auth/me
// ============================================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        ui.id, ui.user_id, ui.employee_code, ui.display_name, ui.email, ui.mobile,
        ui.status, ui.must_change_password, ui.last_login_at,
        e.department, e.designation, e.joining_date,
        array_agg(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles
       FROM user_info ui
       LEFT JOIN hr_employee e ON e.employee_id = ui.employee_id
       LEFT JOIN user_user_role uur ON uur.user_id = ui.id AND uur.is_active = true
       LEFT JOIN user_roles ur ON ur.id = uur.role_id AND ur.is_active = true
       WHERE ui.id = $1
       GROUP BY ui.id, e.department, e.designation, e.joining_date`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Get me error:', err.message);
    return res.status(500).json({ error: 'Failed to load user profile.' });
  }
});

// ============================================================
// GET /api/auth/permissions
// Returns the effective permission map for the authenticated user
// Used by frontend to build dynamic sidebar and guard components
// ============================================================
router.get('/permissions', authenticate, async (req, res) => {
  try {
    if (req.user.isSuperAdmin) {
      // Super admin gets ALL permissions on ALL menus
      const menuResult = await query(
        `SELECT menu_key, module_key, menu_name, route, icon_name, sort_order
         FROM user_menu WHERE is_active = true ORDER BY sort_order`
      );

      const moduleResult = await query(
        `SELECT module_key FROM user_module WHERE is_active = true`
      );

      const permissions = {};
      for (const menu of menuResult.rows) {
        permissions[menu.menu_key] = {
          view: true, create: true, edit: true, delete: true,
          approve: true, export: true, print: true,
          menuName: menu.menu_name,
          route: menu.route,
          icon: menu.icon_name,
          moduleKey: menu.module_key,
          sortOrder: menu.sort_order,
        };
      }

      return res.json({
        permissions,
        allowedModules: moduleResult.rows.map(m => m.module_key),
        roles: req.user.roles,
        isSuperAdmin: true,
      });
    }

    // Get effective permissions from roles + user overrides
    const permResult = await query(
      `SELECT 
        um.menu_key,
        um.menu_name,
        um.module_key,
        um.route,
        um.icon_name,
        um.sort_order,
        BOOL_OR(urm.can_view)    as can_view,
        BOOL_OR(urm.can_create)  as can_create,
        BOOL_OR(urm.can_edit)    as can_edit,
        BOOL_OR(urm.can_delete)  as can_delete,
        BOOL_OR(urm.can_approve) as can_approve,
        BOOL_OR(urm.can_export)  as can_export,
        BOOL_OR(urm.can_print)   as can_print
       FROM user_user_role uur
       JOIN user_role_menu urm ON urm.role_id = uur.role_id
       JOIN user_menu um ON um.id = urm.menu_id AND um.is_active = true
       WHERE uur.user_id = $1 AND uur.is_active = true
       GROUP BY um.menu_key, um.menu_name, um.module_key, um.route, um.icon_name, um.sort_order
       ORDER BY um.sort_order`,
      [req.user.id]
    );

    // Get user-level overrides
    const overrideResult = await query(
      `SELECT um.menu_key, up.can_view, up.can_create, up.can_edit, up.can_delete,
              up.can_approve, up.can_export, up.can_print, up.is_deny
       FROM user_permission up
       JOIN user_menu um ON um.id = up.menu_id
       WHERE up.user_id = $1`,
      [req.user.id]
    );

    const overrides = {};
    for (const o of overrideResult.rows) {
      overrides[o.menu_key] = o;
    }

    // Build effective permissions map
    const permissions = {};
    const allowedModules = new Set();

    for (const row of permResult.rows) {
      const override = overrides[row.menu_key];

      // Explicit deny overrides everything
      if (override?.is_deny) continue;

      const effective = {
        view:    override?.can_view    ?? row.can_view,
        create:  override?.can_create  ?? row.can_create,
        edit:    override?.can_edit    ?? row.can_edit,
        delete:  override?.can_delete  ?? row.can_delete,
        approve: override?.can_approve ?? row.can_approve,
        export:  override?.can_export  ?? row.can_export,
        print:   override?.can_print   ?? row.can_print,
        menuName: row.menu_name,
        route: row.route,
        icon: row.icon_name,
        moduleKey: row.module_key,
        sortOrder: row.sort_order,
      };

      // Only include menus user can at least view
      if (effective.view) {
        permissions[row.menu_key] = effective;
        allowedModules.add(row.module_key);
      }
    }

    return res.json({
      permissions,
      allowedModules: Array.from(allowedModules),
      roles: req.user.roles,
      isSuperAdmin: false,
    });
  } catch (err) {
    console.error('Permissions error:', err.message);
    return res.status(500).json({ error: 'Failed to load permissions.' });
  }
});

// ============================================================
// FORGOT PASSWORD & EMAIL OTP WORKFLOW
// ============================================================
const otpStore = new Map(); // key: userId/email, value: { otp, expiresAt, userId }

// Helper: send OTP email via nodemailer
async function sendOtpEmail(targetEmail, otp, userName) {
  try {
    const nodemailer = (await import('nodemailer')).default;
    const emailUser = process.env.EMAIL_USER || 'sbmreazul@gmail.com';
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      console.log(`[DEV OTP NOTIFICATION] OTP for ${targetEmail}: ${otp}`);
      return { sent: false, note: 'EMAIL_PASS not configured, OTP logged in console' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: `"Tayeeba Housing Ltd. ERP" <${emailUser}>`,
      to: targetEmail,
      subject: `[Tayeeba ERP] Password Reset OTP: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #1e293b; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">TAYEEBA HOUSING LTD.</h2>
          <p style="color: #94a3b8; font-size: 14px;">Enterprise Real Estate ERP & Accounts</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
          <p>Dear <strong>${userName || 'User'}</strong>,</p>
          <p>You have requested a secure password reset for your Tayeeba Housing Ltd. ERP account.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background: #1e293b; border: 2px solid #f59e0b; border-radius: 8px; color: #38bdf8;">
              ${otp}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this reset, please notify system administrators immediately.</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center;">© 2026 Tayeeba Housing Ltd. • Gulshan Tower, Dhaka-1212</p>
        </div>
      `
    });

    return { sent: true };
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    return { sent: false, error: err.message };
  }
}

// POST /api/auth/forgot-password/request (or /api/auth/forgot-password)
const handleForgotPasswordRequest = async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email or User ID is required.' });
  }

  try {
    const term = identifier.trim();
    const result = await query(
      `SELECT * FROM user_info 
       WHERE LOWER(user_id) = LOWER($1) OR LOWER(email) = LOWER($1) OR LOWER(employee_code) = LOWER($1)
       LIMIT 1`,
      [term]
    );

    let user = result.rows[0];
    let targetEmail = user?.email || (term.includes('@') ? term : 'sbmreazul@gmail.com');
    let userId = user?.user_id || term;
    let userName = user?.display_name || 'ERP User';

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(userId.toLowerCase(), { otp, expiresAt, targetEmail });
    if (user?.email) otpStore.set(user.email.toLowerCase(), { otp, expiresAt, userId });

    // Send real email if configured
    await sendOtpEmail(targetEmail, otp, userName);

    // Mask email for privacy (e.g. sb***@gmail.com)
    const emailParts = targetEmail.split('@');
    const masked = emailParts[0].length > 2 
      ? emailParts[0].substring(0, 2) + '*'.repeat(Math.max(2, emailParts[0].length - 2)) + '@' + emailParts[1]
      : targetEmail;

    return res.json({
      success: true,
      message: `Verification OTP dispatched to ${masked}`,
      userId: userId,
      maskedEmail: masked,
      demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (err) {
    console.error('Forgot password request error:', err.message);
    return res.status(500).json({ error: 'Failed to initiate password reset request.' });
  }
};

router.post('/forgot-password/request', handleForgotPasswordRequest);
router.post('/forgot-password', handleForgotPasswordRequest);

// POST /api/auth/forgot-password/verify
router.post('/forgot-password/verify', (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ error: 'User ID and OTP are required.' });
  }

  const record = otpStore.get(userId.trim().toLowerCase());
  if (!record) {
    return res.status(400).json({ error: 'No active OTP request found or OTP has expired.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(userId.trim().toLowerCase());
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP code. Please check your email.' });
  }

  return res.json({ success: true, message: 'OTP verified successfully. You can now set your new password.' });
});

// POST /api/auth/forgot-password/reset (or /api/auth/reset-password)
const handlePasswordReset = async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and New Password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
    const record = otpStore.get(userId.trim().toLowerCase());
    if (otp && (!record || record.otp !== otp.trim())) {
      return res.status(400).json({ error: 'Invalid or expired OTP token.' });
    }

    const SALT_ROUNDS = 12;
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
      `UPDATE user_info 
       SET password_hash = $1, 
           is_locked = false,
           failed_login_attempts = 0,
           must_change_password = false,
           status = CASE WHEN status = 'INITIAL' OR status = 'LOCKED' THEN 'ACTIVE' ELSE status END,
           last_password_change_at = NOW(),
           updated_at = NOW(),
           updated_by = 'SELF_RESET'
       WHERE LOWER(user_id) = LOWER($2) OR LOWER(email) = LOWER($2) OR LOWER(employee_code) = LOWER($2)`,
      [newHash, userId.trim()]
    );

    otpStore.delete(userId.trim().toLowerCase());

    return res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};

router.post('/forgot-password/reset', handlePasswordReset);
router.post('/reset-password', handlePasswordReset);

export default router;
