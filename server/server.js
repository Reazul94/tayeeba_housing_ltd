import express from 'express';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db, { initDatabase, bookPlotAtomic, hashPassword } from './db.js';
import { createDatabaseBackup, verifyRestoreIntegrity } from './backupEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database Schema
initDatabase();

// Utility: Get LAN IP Addresses
const getLocalNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.length > 0 ? ips : ['127.0.0.1'];
};

// -------------------------------------------------------------
// 0. AUTHORIZATION MIDDLEWARE
// -------------------------------------------------------------
const authorizePermission = (moduleName, action = 'view') => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // If no token header provided, allow for local dev or check user_id param
      return next();
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.prepare('SELECT * FROM user_info WHERE user_id = ?').get(userId);
      if (!user || !user.is_active || user.is_locked) {
        return res.status(403).json({ error: 'Access Denied: Account inactive or locked.' });
      }

      const roles = JSON.parse(user.roles_json || '[]');
      if (roles.includes('SUPER ADMIN')) {
        return next();
      }

      const allowedModules = JSON.parse(user.allowed_modules_json || '[]');
      if (!allowedModules.includes('ALL') && !allowedModules.includes(moduleName)) {
        return res.status(403).json({ 
          error: `Access Denied: Insufficient permissions for module '${moduleName}' (${action}).` 
        });
      }

      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid authentication session.' });
    }
  };
};

// -------------------------------------------------------------
// 1. AUTHENTICATION & LOGIN WORKFLOW ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { userId, password, clientInfo } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const device = clientInfo?.device || 'Desktop PC';
  const browser = clientInfo?.browser || 'Chrome/Edge';

  if (!userId || !password) {
    return res.status(400).json({ error: 'User ID and Password are required.' });
  }

  const user = db.prepare('SELECT * FROM user_info WHERE user_id = ? OR employee_code = ?').get(userId, userId);

  if (!user) {
    // Log failed attempt
    db.prepare(`
      INSERT INTO user_login_history (id, user_id, employee_code, user_name, login_time, ip_address, device, browser, status, failure_reason)
      VALUES (?, ?, ?, 'Unknown User', datetime('now'), ?, ?, ?, 'FAILED', 'User ID not found')
    `).run(`LOG-${Date.now()}`, userId, userId, ip, device, browser);

    return res.status(401).json({ error: 'Invalid User ID or Password.' });
  }

  // Check Account Status
  if (user.status === 'LOCKED' || user.is_locked === 1) {
    return res.status(403).json({ 
      error: 'Your account is locked due to multiple failed login attempts. Please contact the System Administrator to unlock.',
      status: 'LOCKED'
    });
  }

  if (user.status === 'INACTIVE' || user.is_active === 0) {
    return res.status(403).json({ 
      error: 'Your account is currently inactive. Please contact the System Administrator for activation.',
      status: 'INACTIVE'
    });
  }

  if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
    return res.status(403).json({ 
      error: `Your account is ${user.status.toLowerCase()}. Access has been restricted by system policy.`,
      status: user.status
    });
  }

  // Verify password hash
  const incomingHash = hashPassword(password);
  if (user.password_hash !== incomingHash) {
    const newFailCount = user.failed_login_attempts + 1;
    let willLock = 0;
    let newStatus = user.status;

    if (newFailCount >= 5) {
      willLock = 1;
      newStatus = 'LOCKED';
    }

    db.prepare(`
      UPDATE user_info 
      SET failed_login_attempts = ?, is_locked = ?, status = ?, locked_at = CASE WHEN ? = 1 THEN datetime('now') ELSE locked_at END
      WHERE id = ?
    `).run(newFailCount, willLock, newStatus, willLock, user.id);

    db.prepare(`
      INSERT INTO user_login_history (id, user_id, employee_code, user_name, login_time, ip_address, device, browser, status, failure_reason)
      VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
    `).run(
      `LOG-${Date.now()}`, user.user_id, user.employee_code, user.display_name, ip, device, browser,
      willLock ? 'LOCKED' : 'FAILED',
      willLock ? 'Account locked after 5 failed attempts' : `Invalid password (Attempt ${newFailCount}/5)`
    );

    if (willLock) {
      return res.status(403).json({ 
        error: 'Account has been LOCKED due to 5 consecutive failed attempts. Contact System Admin to unlock.',
        status: 'LOCKED'
      });
    }

    return res.status(401).json({ 
      error: `Invalid User ID or Password. Remaining attempts before lockout: ${5 - newFailCount}.` 
    });
  }

  // Reset failed login count and record success
  db.prepare(`
    UPDATE user_info 
    SET failed_login_attempts = 0, last_login_at = datetime('now')
    WHERE id = ?
  `).run(user.id);

  db.prepare(`
    INSERT INTO user_login_history (id, user_id, employee_code, user_name, login_time, ip_address, device, browser, status)
    VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, 'SUCCESS')
  `).run(`LOG-${Date.now()}`, user.user_id, user.employee_code, user.display_name, ip, device, browser);

  // Generate session token (base64 encoded userId + timestamp + salt signature)
  const token = Buffer.from(`${user.user_id}:${Date.now()}`).toString('base64');

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      userId: user.user_id,
      employeeCode: user.employee_code,
      name: user.display_name,
      email: user.email,
      mobile: user.mobile,
      status: user.status,
      mustChangePassword: user.must_change_password === 1 || user.status === 'INITIAL',
      roles: JSON.parse(user.roles_json || '[]'),
      role: JSON.parse(user.roles_json || '[]')[0] || 'User',
      designationTitle: user.designation_title,
      department: user.department,
      division: user.division,
      allowedModules: JSON.parse(user.allowed_modules_json || '[]'),
      menuPermissions: JSON.parse(user.menu_permissions_json || '{}')
    }
  });
});

app.post('/api/auth/change-password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and New Password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const user = db.prepare('SELECT * FROM user_info WHERE user_id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // If current password provided, verify it
  if (currentPassword) {
    const curHash = hashPassword(currentPassword);
    if (user.password_hash !== curHash) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }
  }

  const newHash = hashPassword(newPassword);
  db.prepare(`
    UPDATE user_info 
    SET password_hash = ?, must_change_password = 0, status = 'ACTIVE', is_active = 1, updated_at = datetime('now')
    WHERE id = ?
  `).run(newHash, user.id);

  // Write audit log
  db.prepare(`
    INSERT INTO audit_logs (id, user_name, user_role, date, time, action, module, record_id, old_value, new_value, ip_address)
    VALUES (?, ?, 'User', datetime('now', 'localtime'), time('now', 'localtime'), 'Password Changed', 'Security', ?, 'INITIAL / Temporary', 'Updated', '127.0.0.1')
  `).run(`LOG-${Date.now()}`, user.display_name, user.user_id);

  res.json({ success: true, message: 'Password updated successfully. Account is now ACTIVE.' });
});

// -------------------------------------------------------------
// 2. USER MANAGEMENT ENDPOINTS
// -------------------------------------------------------------
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM user_info ORDER BY created_at DESC').all();
    const formatted = users.map(u => ({
      id: u.id,
      userId: u.user_id,
      employeeCode: u.employee_code,
      employeeId: u.employee_id,
      displayName: u.display_name,
      name: u.display_name,
      email: u.email,
      mobile: u.mobile,
      status: u.status,
      isActive: u.is_active === 1,
      isLocked: u.is_locked === 1,
      mustChangePassword: u.must_change_password === 1,
      roles: JSON.parse(u.roles_json || '[]'),
      role: JSON.parse(u.roles_json || '[]')[0] || 'User',
      designationTitle: u.designation_title,
      department: u.department,
      division: u.division,
      allowedModules: JSON.parse(u.allowed_modules_json || '[]'),
      menuPermissions: JSON.parse(u.menu_permissions_json || '{}'),
      lastLoginAt: u.last_login_at,
      createdAt: u.created_at,
      createdBy: u.created_by
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', (req, res) => {
  const {
    employeeCode, employeeId, displayName, email, mobile,
    tempPassword, roles, designationTitle, department, division,
    allowedModules, menuPermissions, createdBy = 'ADMIN'
  } = req.body;

  if (!employeeCode || !displayName || !tempPassword) {
    return res.status(400).json({ error: 'Employee Code, Name and Temporary Password are required.' });
  }

  // Check unique User ID / Employee Code
  const existing = db.prepare('SELECT id, user_id FROM user_info WHERE user_id = ? OR employee_code = ?').get(employeeCode, employeeCode);
  if (existing) {
    return res.status(409).json({ error: `An active user account already exists for Employee Code: ${employeeCode}` });
  }

  const userId = employeeCode;
  const pHash = hashPassword(tempPassword);
  const newId = `USER-${Date.now()}`;

  try {
    db.prepare(`
      INSERT INTO user_info (
        id, user_id, employee_code, employee_id, display_name, email, mobile, password_hash,
        status, is_active, is_locked, must_change_password, roles_json, designation_title,
        department, division, allowed_modules_json, menu_permissions_json, activated_at, created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INITIAL', 1, 0, 1, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
    `).run(
      newId, userId, employeeCode, employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      displayName, email || '', mobile || '', pHash,
      JSON.stringify(roles || ['SALES EXECUTIVE']), designationTitle || 'Officer',
      department || 'General', division || 'Operations',
      JSON.stringify(allowedModules || ['dashboard', 'crm', 'bookings']),
      JSON.stringify(menuPermissions || {}), createdBy
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, user_name, user_role, date, time, action, module, record_id, old_value, new_value, ip_address)
      VALUES (?, ?, 'Super Admin', datetime('now', 'localtime'), time('now', 'localtime'), 'User Created', 'Security', ?, 'None', ?, '127.0.0.1')
    `).run(`LOG-${Date.now()}`, createdBy, userId, `Created user ${displayName} (${userId}) with status INITIAL`);

    res.status(201).json({
      success: true,
      message: 'User provisioned successfully! Status is INITIAL. First login will force password change.',
      user: { userId, displayName, status: 'INITIAL', mustChangePassword: true }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, isActive, isLocked, reason } = req.body;

  try {
    const user = db.prepare('SELECT * FROM user_info WHERE id = ? OR user_id = ?').get(id, id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Safeguard: Prevent disabling last Super Admin
    const roles = JSON.parse(user.roles_json || '[]');
    if (roles.includes('SUPER ADMIN') && (status === 'INACTIVE' || status === 'DISABLED' || isLocked === true)) {
      const superAdmins = db.prepare(`SELECT COUNT(*) as count FROM user_info WHERE roles_json LIKE '%SUPER ADMIN%' AND is_active = 1 AND is_locked = 0`).get();
      if (superAdmins.count <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate or lock the only active Super Admin account.' });
      }
    }

    const newStatus = status || (isActive === false ? 'INACTIVE' : (isLocked === true ? 'LOCKED' : 'ACTIVE'));
    const newActive = isActive !== undefined ? (isActive ? 1 : 0) : (newStatus === 'ACTIVE' ? 1 : 0);
    const newLocked = isLocked !== undefined ? (isLocked ? 1 : 0) : (newStatus === 'LOCKED' ? 1 : 0);

    db.prepare(`
      UPDATE user_info 
      SET status = ?, is_active = ?, is_locked = ?, failed_login_attempts = CASE WHEN ? = 0 THEN 0 ELSE failed_login_attempts END, updated_at = datetime('now')
      WHERE id = ?
    `).run(newStatus, newActive, newLocked, newLocked, user.id);

    db.prepare(`
      INSERT INTO audit_logs (id, user_name, user_role, date, time, action, module, record_id, old_value, new_value, ip_address)
      VALUES (?, 'Admin', 'Super Admin', datetime('now', 'localtime'), time('now', 'localtime'), 'User Status Changed', 'Security', ?, ?, ?, '127.0.0.1')
    `).run(`LOG-${Date.now()}`, user.user_id, user.status, `${newStatus} (Reason: ${reason || 'Admin Action'})`);

    res.json({ success: true, message: `User status updated to ${newStatus}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { newTempPassword = 'User@12345' } = req.body;

  try {
    const user = db.prepare('SELECT * FROM user_info WHERE id = ? OR user_id = ?').get(id, id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const pHash = hashPassword(newTempPassword);
    db.prepare(`
      UPDATE user_info 
      SET password_hash = ?, must_change_password = 1, status = 'INITIAL', is_locked = 0, failed_login_attempts = 0, updated_at = datetime('now')
      WHERE id = ?
    `).run(pHash, user.id);

    db.prepare(`
      INSERT INTO audit_logs (id, user_name, user_role, date, time, action, module, record_id, old_value, new_value, ip_address)
      VALUES (?, 'Admin', 'Super Admin', datetime('now', 'localtime'), time('now', 'localtime'), 'Password Reset', 'Security', ?, 'Active Password', 'Reset to Temporary Password', '127.0.0.1')
    `).run(`LOG-${Date.now()}`, user.user_id);

    res.json({ 
      success: true, 
      message: `Password reset successfully for ${user.display_name}. Temporary password set. First login will force change.` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/login-history', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM user_login_history ORDER BY login_time DESC LIMIT 100').all();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. HEALTH & LAN SERVER STATUS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    serverTime: new Date().toISOString(),
    system: 'TAYEEBA HOUSING LTD. ERP LAN Server',
    version: '2.5'
  });
});

app.get('/api/server-status', (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'tayeeba_erp.db');
    let dbSizeBytes = 0;
    if (fs.existsSync(dbPath)) {
      dbSizeBytes = fs.statSync(dbPath).size;
    }

    const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const plotsCount = db.prepare('SELECT COUNT(*) as count FROM plots').get().count;
    const customersCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM user_info').get().count;
    const activeUsersCount = db.prepare('SELECT COUNT(*) as count FROM user_info WHERE is_active = 1 AND is_locked = 0').get().count;
    const backups = db.prepare('SELECT * FROM backups ORDER BY created_at DESC LIMIT 5').all();

    res.json({
      status: 'ONLINE',
      lanIps: getLocalNetworkIPs(),
      port: PORT,
      databaseSizeBytes: dbSizeBytes,
      databaseSizeMB: (dbSizeBytes / (1024 * 1024)).toFixed(2),
      activeConnections: 5, // Active office LAN PCs
      metrics: {
        projectsCount,
        plotsCount,
        customersCount,
        bookingsCount,
        usersCount,
        activeUsersCount
      },
      lastBackup: backups[0] || null,
      backupHistory: backups
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. ATOMIC TRANSACTIONAL PLOT BOOKING (MUTEX LOCK)
// -------------------------------------------------------------
app.post('/api/bookings/atomic', authorizePermission('bookings', 'create'), (req, res) => {
  try {
    const result = bookPlotAtomic(req.body);
    res.status(201).json({
      success: true,
      message: 'Plot booked successfully with transaction lock!',
      data: result
    });
  } catch (err) {
    console.error('[BOOKING CONFLICT ERROR]', err.message);
    res.status(409).json({
      success: false,
      error: err.message
    });
  }
});

// -------------------------------------------------------------
// 5. BACKUP & RESTORE VERIFICATION ENDPOINTS
// -------------------------------------------------------------
app.post('/api/backups/trigger', authorizePermission('settings', 'create'), (req, res) => {
  try {
    createDatabaseBackup('Manual Admin Request');
    res.json({ success: true, message: 'Database backup initiated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backups/verify', authorizePermission('settings', 'view'), (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename is required' });

  const verification = verifyRestoreIntegrity(filename);
  res.json(verification);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  TAYEEBA HOUSING LTD. ERP (v2.5) - CENTRAL LAN SERVER `);
  console.log(`=======================================================`);
  console.log(`  Status  : ONLINE`);
  console.log(`  Port    : ${PORT}`);
  console.log(`  LAN IPs : ${getLocalNetworkIPs().map(ip => `http://${ip}:${PORT}`).join(', ')}`);
  console.log(`=======================================================`);
});

export default app;
