// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Frontend: Permission Guards
// ============================================================

import React from 'react';
import { useERP } from '../context/ERPContext';

// ============================================================
// PermissionGuard: Renders children only if user has permission
// ============================================================
interface PermissionGuardProps {
  menuKey: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  menuKey,
  action = 'view',
  children,
  fallback = null,
}) => {
  const { hasPermission } = useERP();
  return hasPermission(menuKey, action as any) ? <>{children}</> : <>{fallback}</>;
};

// ============================================================
// ModuleGuard: Renders children only if module is accessible
// ============================================================
interface ModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleKey,
  children,
  fallback = null,
}) => {
  const { currentUser } = useERP();
  const hasAccess = currentUser?.allowedModules?.includes(moduleKey) ||
    currentUser?.roles?.some((r: string) => r === 'Super Admin');
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ============================================================
// ActionButton: Button that is hidden/disabled based on permissions
// ============================================================
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  menuKey: string;
  action: 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print';
  hideIfDenied?: boolean;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  menuKey,
  action,
  hideIfDenied = false,
  children,
  ...props
}) => {
  const { hasPermission } = useERP();
  const allowed = hasPermission(menuKey, action as any);

  if (!allowed && hideIfDenied) return null;

  return (
    <button {...props} disabled={!allowed || props.disabled} title={!allowed ? 'You do not have permission for this action' : props.title}>
      {children}
    </button>
  );
};

export default { PermissionGuard, ModuleGuard, ActionButton };
