-- ============================================================
-- TAYEEBA HOUSING LTD. ERP v2.6
-- Migration 012: Seed Data — Roles, Modules, Menus, Permissions
-- ============================================================

-- ============================================================
-- SEED: ERP Roles
-- ============================================================
INSERT INTO user_roles (role_name, description, is_system) VALUES
  ('Super Admin',     'Full unrestricted system access. Bypasses all permission guards.',          TRUE),
  ('System Admin',    'User/role management and system configuration. No financial operations.',   TRUE),
  ('CEO / Director',  'Full operational oversight, financial approvals and report generation.',    FALSE),
  ('General Manager', 'Cross-department oversight and operational approvals.',                     FALSE),
  ('Accounts Manager','Journal vouchers, payment vouchers, reconciliations and balance sheets.',  FALSE),
  ('Account Officer', 'Payment recording, receipt generation and expense entry.',                 FALSE),
  ('Sales Manager',   'Customer booking approval, commission approval and lead assignment.',       FALSE),
  ('Sales Executive', 'Lead prospecting, customer registration and site visit bookings.',          FALSE),
  ('Marketing',       'Lead management and CRM activities.',                                      FALSE),
  ('HR Manager',      'Employee directory, organogram, payroll approval.',                        FALSE),
  ('HR Officer',      'Attendance, leave management and payroll entry.',                          FALSE),
  ('Project Manager', 'Project and site development management.',                                 FALSE),
  ('Read Only',       'View-only access. No create/edit/delete permissions.',                     FALSE)
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================
-- SEED: ERP Modules
-- ============================================================
INSERT INTO user_module (module_key, module_name, description, sort_order) VALUES
  ('dashboard',     'Executive Dashboard',    'CEO/Executive dashboard with KPIs and charts',  1),
  ('projects',      'Project Management',     'Real estate project portfolio management',      2),
  ('inventory',     'Plot Inventory',         'Plot status, pricing, and availability',        3),
  ('crm',           'CRM & Leads',            'Customer relationship and lead management',     4),
  ('customers',     'Customer Management',    'Customer profiles, ledger, and 360 view',       5),
  ('bookings',      'Bookings',               'Plot booking workflows',                        6),
  ('installments',  'Installments',           'Installment schedule management',               7),
  ('collections',   'Collections',            'Payment collection and receipts',               8),
  ('dues',          'Dues & Overdue',         'Overdue tracking and reminders',                9),
  ('sales',         'Sales & Commission',     'Sales tracking and commission management',      10),
  ('accounting',    'General Accounting',     'Chart of accounts, journal vouchers, ledger',   11),
  ('expenses',      'Expense Management',     'Office and project expense tracking',           12),
  ('land',          'Land Acquisition',       'Land purchase and seller ledger',               13),
  ('vendors',       'Vendors & Purchases',    'Vendor management and purchase orders',         14),
  ('development',   'Site Development',       'Infrastructure and development tracking',       15),
  ('hr',            'HR & Payroll',           'Employee management and payroll',               16),
  ('transfers',     'Plot Transfers',         'Plot ownership transfer workflows',             17),
  ('refunds',       'Refunds & Cancellations','Booking cancellation and refund processing',    18),
  ('documents',     'Document Management',    'Customer and project document storage',         19),
  ('reports',       'Reports & Analytics',    'Executive reports and data exports',            20),
  ('notifications', 'Notifications',          'In-app notification management',               21),
  ('users',         'User Management',        'ERP user accounts and access control',         22),
  ('roles',         'Role Management',        'Role definitions and permission templates',     23),
  ('permissions',   'Permission Management',  'Module, menu and action permission matrix',    24),
  ('designations',  'Designations',           'Employee designation and organogram',           25),
  ('audit',         'Audit Trail',            'System audit log and activity history',        26),
  ('server',        'Server Monitor',         'API, database and system health monitoring',   27),
  ('backup',        'Backup & Recovery',      'Database backup and restore management',        28),
  ('settings',      'System Settings',        'Company profile and system configuration',     29)
ON CONFLICT (module_key) DO NOTHING;

-- ============================================================
-- SEED: ERP Menus
-- ============================================================
INSERT INTO user_menu (menu_key, menu_name, module_key, route, icon_name, sort_order, permission_key) VALUES
  ('dashboard.main',              'Dashboard',              'dashboard',     '/dashboard',          'LayoutDashboard',   1,  'dashboard'),
  ('projects.list',               'Projects',               'projects',      '/projects',           'Building2',         2,  'projects'),
  ('inventory.map',               'Plot Inventory',         'inventory',     '/inventory',          'Map',               3,  'inventory'),
  ('crm.leads',                   'Leads',                  'crm',           '/leads',              'UserPlus',          4,  'leads'),
  ('crm.site-visits',             'Site Visits',            'crm',           '/site-visits',        'MapPin',            5,  'site-visits'),
  ('customers.list',              'Customers',              'customers',     '/customers',          'Users',             6,  'customers'),
  ('bookings.wizard',             'New Booking',            'bookings',      '/bookings',           'FileCheck',         7,  'bookings'),
  ('installments.list',           'Installments',           'installments',  '/installments',       'Calendar',          8,  'installments'),
  ('collections.payments',        'Collections',            'collections',   '/collections',        'CreditCard',        9,  'collections'),
  ('dues.overdue',                'Dues & Overdue',         'dues',          '/dues',               'AlertCircle',       10, 'dues'),
  ('sales.overview',              'Sales',                  'sales',         '/sales',              'TrendingUp',        11, 'sales'),
  ('accounting.chart',            'Chart of Accounts',      'accounting',    '/accounting/chart',   'BookOpen',          12, 'accounting'),
  ('accounting.journal',          'Journal Voucher',        'accounting',    '/accounting/journal', 'FileText',          13, 'accounting'),
  ('accounting.ledger',           'General Ledger',         'accounting',    '/accounting/ledger',  'List',              14, 'accounting'),
  ('accounting.trial',            'Trial Balance',          'accounting',    '/accounting/trial',   'Scale',             15, 'accounting'),
  ('accounting.pl',               'Profit & Loss',          'accounting',    '/accounting/pl',      'BarChart2',         16, 'accounting'),
  ('accounting.balance',          'Balance Sheet',          'accounting',    '/accounting/balance', 'BarChart3',         17, 'accounting'),
  ('expenses.list',               'Expenses',               'expenses',      '/expenses',           'DollarSign',        18, 'expenses'),
  ('land.parcels',                'Land Acquisition',       'land',          '/land',               'Landmark',          19, 'land'),
  ('vendors.list',                'Vendors',                'vendors',       '/vendors',            'Store',             20, 'vendors'),
  ('development.list',            'Site Development',       'development',   '/development',        'HardHat',           21, 'development'),
  ('hr.employees',                'Employees',              'hr',            '/hr',                 'UserCheck',         22, 'hr'),
  ('hr.payroll',                  'Payroll',                'hr',            '/hr/payroll',         'Banknote',          23, 'hr'),
  ('transfers.list',              'Plot Transfers',         'transfers',     '/transfers',          'ArrowLeftRight',    24, 'transfers'),
  ('refunds.list',                'Refunds',                'refunds',       '/refunds',            'Undo2',             25, 'refunds'),
  ('documents.list',              'Documents',              'documents',     '/documents',          'FolderOpen',        26, 'documents'),
  ('reports.list',                'Reports',                'reports',       '/reports',            'BarChart',          27, 'reports'),
  ('users.list',                  'User Management',        'users',         '/users',              'ShieldCheck',       28, 'users'),
  ('roles.list',                  'Roles',                  'roles',         '/roles',              'Shield',            29, 'roles'),
  ('permissions.matrix',          'Permissions',            'permissions',   '/permissions',        'Key',               30, 'permissions'),
  ('designations.org',            'Organogram',             'designations',  '/organogram',         'Network',           31, 'designations'),
  ('audit.log',                   'Audit Trail',            'audit',         '/audit',              'ClipboardList',     32, 'audit'),
  ('server.monitor',              'Server Monitor',         'server',        '/server-monitor',     'Server',            33, 'server'),
  ('settings.main',               'Settings',               'settings',      '/settings',           'Settings',          34, 'settings')
ON CONFLICT (menu_key) DO NOTHING;

-- ============================================================
-- SEED: Super Admin role gets ALL module access
-- ============================================================
INSERT INTO user_role_module (role_id, module_id)
SELECT r.id, m.id
FROM user_roles r, user_module m
WHERE r.role_name = 'Super Admin'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- ============================================================
-- SEED: Super Admin gets full permissions on all menus
-- ============================================================
INSERT INTO user_role_menu (role_id, menu_id, can_view, can_create, can_edit, can_delete, can_approve, can_export, can_print)
SELECT r.id, m.id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM user_roles r, user_menu m
WHERE r.role_name = 'Super Admin'
ON CONFLICT (role_id, menu_id) DO NOTHING;

-- ============================================================
-- SEED: Demo Project (Tayeeba Smart City)
-- ============================================================
INSERT INTO project (project_code, project_name, location, land_area_katha, total_plots,
  status, launch_date, expected_completion, manager_name, development_budget, description)
VALUES (
  'THL-PRJ-001',
  'Tayeeba Smart City',
  'Ashulia, Savar, Dhaka',
  500,
  150,
  'Ongoing',
  '2024-01-01',
  '2027-12-31',
  'Project Management Team',
  150000000,
  'Premium residential township with modern amenities. 3-5 katha plots in a planned layout.'
) ON CONFLICT (project_code) DO NOTHING;

-- ============================================================
-- SEED: Default Designation Hierarchy
-- ============================================================
INSERT INTO user_designation (name, level, department, description) VALUES
  ('Managing Director',  0, 'Executive',   'Top executive leadership'),
  ('CEO',                1, 'Executive',   'Chief Executive Officer'),
  ('General Manager',    2, 'Management',  'General management oversight'),
  ('Accounts Manager',   3, 'Accounts',    'Head of Accounts Department'),
  ('Account Officer',    4, 'Accounts',    'Junior accounts staff'),
  ('Sales Manager',      3, 'Sales',       'Head of Sales Department'),
  ('Sales Executive',    4, 'Sales',       'Field sales representative'),
  ('HR Manager',         3, 'HR',          'Head of HR Department'),
  ('Project Manager',    3, 'Projects',    'Real estate project lead')
ON CONFLICT DO NOTHING;
