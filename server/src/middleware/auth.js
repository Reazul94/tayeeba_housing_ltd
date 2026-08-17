// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Backend: Authentication Middleware
// - JWT verification
// - Account status validation
// - RBAC module/action enforcement
// ============================================================

import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'thl-dev-secret-change-in-production';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED',
      });
    }

    const token = authHeader.substring(7);
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expired. Please log in again.',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        error: 'Invalid authentication token.',
        code: 'INVALID_TOKEN',
      });
    }

    // Load fresh user from database (in case status changed)
    const result = await query(
      `SELECT ui.*, 
        array_agg(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as roles,
        array_agg(DISTINCT um.module_key) FILTER (WHERE um.module_key IS NOT NULL) as allowed_modules
       FROM user_info ui
       LEFT JOIN user_user_role uur ON uur.user_id = ui.id AND uur.is_active = true
       LEFT JOIN user_roles ur ON ur.id = uur.role_id AND ur.is_active = true
       LEFT JOIN user_role_module urm ON urm.role_id = ur.id AND urm.is_active = true
       LEFT JOIN user_module um ON um.id = urm.module_id AND um.is_active = true
       WHERE ui.id = $1
       GROUP BY ui.id`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'User account not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    const user = result.rows[0];

    // Check account status
    if (!user.is_active || user.status === 'DISABLED') {
      return res.status(403).json({
        error: 'Your account has been deactivated. Please contact System Administrator.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    if (user.is_locked || user.status === 'LOCKED') {
      return res.status(403).json({
        error: 'Your account is locked due to failed login attempts. Please contact System Administrator.',
        code: 'ACCOUNT_LOCKED',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'Your account is temporarily suspended. Please contact System Administrator.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    // Attach user context to request
    req.user = {
      id: user.id,
      userId: user.user_id,
      employeeCode: user.employee_code,
      displayName: user.display_name,
      email: user.email,
      status: user.status,
      roles: user.roles || [],
      allowedModules: user.allowed_modules || [],
      isSuperAdmin: (user.roles || []).some(r =>
        r === 'Super Admin' || r === 'SUPER ADMIN'
      ),
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({
      error: 'Authentication service error.',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Require a specific module permission
 * Usage: requireModule('accounting')
 */
export const requireModule = (moduleKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHENTICATED' });
    }

    // Super Admin bypasses all module restrictions
    if (req.user.isSuperAdmin) {
      return next();
    }

    const modules = req.user.allowedModules || [];
    if (!modules.includes(moduleKey) && !modules.includes('ALL')) {
      return res.status(403).json({
        error: `Access denied: You do not have access to the ${moduleKey} module.`,
        code: 'MODULE_ACCESS_DENIED',
        module: moduleKey,
      });
    }

    next();
  };
};

/**
 * Require a specific action permission on a menu
 * Usage: requireAction('collections', 'can_create')
 */
export const requireAction = (menuKey, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHENTICATED' });
    }

    // Super Admin bypasses all action restrictions
    if (req.user.isSuperAdmin) {
      return next();
    }

    try {
      // Check role-level permissions for this menu
      const permResult = await query(
        `SELECT 
          BOOL_OR(urm.${action}) as has_permission
         FROM user_user_role uur
         JOIN user_role_menu urm ON urm.role_id = uur.role_id
         JOIN user_menu um ON um.id = urm.menu_id
         WHERE uur.user_id = $1
           AND uur.is_active = true
           AND um.menu_key = $2`,
        [req.user.id, menuKey]
      );

      // Check user-level overrides
      const overrideResult = await query(
        `SELECT up.${action} as permission, up.is_deny
         FROM user_permission up
         JOIN user_menu um ON um.id = up.menu_id
         WHERE up.user_id = $1
           AND um.menu_key = $2`,
        [req.user.id, menuKey]
      );

      // Apply precedence: explicit DENY overrides all
      if (overrideResult.rows.length > 0) {
        const override = overrideResult.rows[0];
        if (override.is_deny) {
          return res.status(403).json({
            error: `Access denied: You do not have ${action.replace('can_', '')} permission.`,
            code: 'ACTION_DENIED',
            menu: menuKey,
            action,
          });
        }
        if (override.permission !== null) {
          if (override.permission) return next();
          return res.status(403).json({
            error: `Access denied: You do not have ${action.replace('can_', '')} permission.`,
            code: 'ACTION_DENIED',
          });
        }
      }

      // Fall back to role permissions
      const hasPermission = permResult.rows[0]?.has_permission;
      if (!hasPermission) {
        return res.status(403).json({
          error: `Access denied: You do not have permission to ${action.replace('can_', '')} ${menuKey}.`,
          code: 'ACTION_DENIED',
          menu: menuKey,
          action,
        });
      }

      next();
    } catch (err) {
      console.error('Permission check error:', err.message);
      return res.status(500).json({
        error: 'Permission verification error.',
        code: 'PERMISSION_ERROR',
      });
    }
  };
};

export default { authenticate, requireModule, requireAction };
