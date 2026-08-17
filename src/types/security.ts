export type AccountStatus = 
  | 'INITIAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'LOCKED'
  | 'SUSPENDED'
  | 'DISABLED'
  | 'EXPIRED';

export type ActionPermissionKey = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print';

export interface ActionPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  print: boolean;
}

export interface UserInfo {
  id: string;
  userId: string; // e.g. THL-EMP-00001
  employeeCode: string; // e.g. THL-EMP-00001
  employeeId: string;
  displayName: string;
  email: string;
  mobile: string;
  passwordHash?: string;
  status: AccountStatus;
  isActive: boolean;
  isLocked: boolean;
  mustChangePassword: boolean;
  roles: string[]; // e.g. ['SUPER ADMIN', 'SALES MANAGER']
  designationId?: string;
  designationTitle?: string;
  department?: string;
  division?: string;
  allowedModules: string[]; // List of permitted module names
  menuPermissions: Record<string, ActionPermissions>; // menuId -> ActionPermissions
  lastLoginAt?: string;
  lastPasswordChangeAt?: string;
  passwordExpiresAt?: string;
  failedLoginAttempts: number;
  lockedAt?: string;
  activatedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UserRoleDefinition {
  id: string;
  roleName: string;
  description: string;
  isSystem: boolean; // Cannot delete Super Admin
  isActive: boolean;
  menuPermissions: Record<string, ActionPermissions>; // menuId -> ActionPermissions
}

export interface UserMenuDefinition {
  menuId: string;
  menuName: string;
  moduleName: string;
  parentId?: string;
  route: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
  permissionKey: string;
}

export interface UserDesignation {
  designationId: string;
  name: string;
  parentId?: string;
  level: number;
  division: string;
  department: string;
  section?: string;
  subsection?: string;
  isActive: boolean;
}

export interface UserDesignationHistory {
  id: string;
  userId: string;
  employeeCode: string;
  designationId: string;
  designationTitle: string;
  department: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'PROMOTED' | 'RELIEVED';
  isActive: boolean;
  assignedBy: string;
  createdDate: string;
}

export interface UserAdditionalDesignation {
  id: string;
  userId: string;
  designationId: string;
  designationTitle: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface UserLoginHistory {
  id: string;
  userId: string;
  employeeCode: string;
  userName: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  device: string;
  browser: string;
  status: 'SUCCESS' | 'FAILED' | 'LOCKED';
  failureReason?: string;
}
