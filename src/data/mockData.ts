import { IUser, RoleType } from '../types/IUser';
import { INavigationItem } from '../types/INavigationItem';

export const MOCK_USERS: Record<RoleType, IUser> = {
  ADMIN: {
    id: 'usr_01',
    fullName: 'Nguyễn Văn Quản Trị',
    email: 'admin@system.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: 'ADMIN',
    roleDisplayName: 'Quản trị viên Hệ thống',
    businessGroup: 'Khối Công nghệ & Vận hành',
    permissions: [
      'user:read', 'user:write', 'user:delete',
      'role:manage', 'department:manage',
      'report:view', 'report:export',
      'customer:read', 'customer:write',
      'system:config', 'audit:view'
    ]
  },
  MANAGER: {
    id: 'usr_02',
    fullName: 'Trần Thị Trưởng Phòng',
    email: 'manager@system.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    role: 'MANAGER',
    roleDisplayName: 'Trưởng nhóm Kinh doanh',
    businessGroup: 'Khối Kinh doanh Miền Bắc',
    permissions: [
      'user:read',
      'report:view', 'report:export',
      'customer:read', 'customer:write',
      'deal:approve'
    ]
  },
  SALE_AGENT: {
    id: 'usr_03',
    fullName: 'Lê Văn Chuyên Viên',
    email: 'sale@system.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    role: 'SALE_AGENT',
    roleDisplayName: 'Chuyên viên Tư vấn',
    businessGroup: 'Phòng Kinh doanh 1 - Miền Bắc',
    permissions: [
      'customer:read', 'customer:write',
      'deal:create', 'deal:read'
    ]
  },
  SUPPORT_AGENT: {
    id: 'usr_04',
    fullName: 'Phạm Thị Hỗ Trợ',
    email: 'support@system.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    role: 'SUPPORT_AGENT',
    roleDisplayName: 'Chuyên viên Hỗ trợ KH',
    businessGroup: 'Trung tâm CSKH',
    permissions: [
      'customer:read',
      'ticket:read', 'ticket:write'
    ]
  }
};

export const MENU_ITEMS: INavigationItem[] = [
  {
    id: 'nav_dashboard',
    title: 'Tổng quan System',
    path: '/dashboard',
    iconName: 'LayoutDashboard',
    requiredPermissions: []
  },
  {
    id: 'nav_user_management',
    title: 'Quản lý Người dùng',
    path: '/users',
    iconName: 'Users',
    requiredPermissions: ['user:read'],
    children: [
      {
        id: 'nav_user_list',
        title: 'Danh sách tài khoản',
        path: '/users/list',
        iconName: 'UserCheck',
        requiredPermissions: ['user:read']
      },
      {
        id: 'nav_user_create',
        title: 'Thêm mới người dùng',
        path: '/users/create',
        iconName: 'UserPlus',
        requiredPermissions: ['user:write']
      },
      {
        id: 'nav_role_permissions',
        title: 'Phân quyền & Vai trò',
        path: '/users/roles',
        iconName: 'ShieldCheck',
        requiredPermissions: ['role:manage']
      }
    ]
  },
  {
    id: 'nav_customer_management',
    title: 'Quản lý Khách hàng',
    path: '/customers',
    iconName: 'Building2',
    requiredPermissions: ['customer:read'],
    children: [
      {
        id: 'nav_customer_list',
        title: 'Hồ sơ Khách hàng',
        path: '/customers/list',
        iconName: 'Contact',
        requiredPermissions: ['customer:read']
      },
      {
        id: 'nav_deals',
        title: 'Cơ hội & Hợp đồng',
        path: '/customers/deals',
        iconName: 'Briefcase',
        requiredPermissions: ['deal:read', 'deal:create']
      }
    ]
  },
  {
    id: 'nav_reports',
    title: 'Báo cáo & Thống kê',
    path: '/reports',
    iconName: 'BarChart3',
    requiredPermissions: ['report:view'],
    children: [
      {
        id: 'nav_report_sales',
        title: 'Báo cáo Doanh thu',
        path: '/reports/sales',
        iconName: 'TrendingUp',
        requiredPermissions: ['report:view']
      },
      {
        id: 'nav_report_export',
        title: 'Xuất dữ liệu Excel/PDF',
        path: '/reports/export',
        iconName: 'FileSpreadsheet',
        requiredPermissions: ['report:export']
      }
    ]
  },
  {
    id: 'nav_support',
    title: 'Hỗ trợ & Yêu cầu',
    path: '/tickets',
    iconName: 'Headphones',
    requiredPermissions: ['ticket:read'],
    badge: 'Mới'
  },
  {
    id: 'nav_system_config',
    title: 'Cấu hình Hệ thống',
    path: '/settings',
    iconName: 'Settings',
    requiredPermissions: ['system:config'],
    children: [
      {
        id: 'nav_audit_logs',
        title: 'Nhật ký Hoạt động (Audit)',
        path: '/settings/audit',
        iconName: 'History',
        requiredPermissions: ['audit:view']
      },
      {
        id: 'nav_general_settings',
        title: 'Cấu hình tham số',
        path: '/settings/general',
        iconName: 'Sliders',
        requiredPermissions: ['system:config']
      }
    ]
  }
];
