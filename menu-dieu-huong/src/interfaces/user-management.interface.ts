export type UserRoleType = 'admin' | 'manager' | 'sales' | 'viewer';

export type UserStatusType = 'active' | 'pending_activation' | 'locked';

export interface IUserItem {
  id: string;
  name: string;
  email: string;
  group: string;
  roles: UserRoleType[];
  status: UserStatusType;
  tempPassword?: string;
  activationSentAt?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  phone?: string;
  avatarIndex?: number;
}

export interface IUserFilterState {
  search: string;
  role: string;
  status: string;
  group: string;
  page: number;
  limit: number;
}

export interface IUserPaginationResult {
  data: IUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserCreateInput {
  name: string;
  email: string;
  group: string;
  roles: UserRoleType[];
  status?: UserStatusType;
  phone?: string;
}

export interface IUserUpdateInput {
  name?: string;
  email?: string;
  group?: string;
  roles?: UserRoleType[];
  status?: UserStatusType;
  phone?: string;
}

export const USER_ROLES_CONFIG: Record<
  UserRoleType,
  {
    code: UserRoleType;
    label: string;
    description: string;
    badgeColor: string;
    badgeTone: 'primary' | 'success' | 'warning' | 'neutral' | 'accent' | 'danger';
  }
> = {
  admin: {
    code: 'admin',
    label: 'Quản trị viên',
    description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản và phân quyền.',
    badgeColor: '#4f46e5',
    badgeTone: 'accent',
  },
  manager: {
    code: 'manager',
    label: 'Trưởng nhóm',
    description: 'Bắt buộc phải được phân công một nhóm/địa bàn quản lý cụ thể.',
    badgeColor: '#0284c7',
    badgeTone: 'primary',
  },
  sales: {
    code: 'sales',
    label: 'Nhân viên kinh doanh',
    description: 'Nhận địa bàn kinh doanh, tiếp cận khách hàng và chốt hợp đồng.',
    badgeColor: '#059669',
    badgeTone: 'success',
  },
  viewer: {
    code: 'viewer',
    label: 'Người xem',
    description: 'Chỉ xem dữ liệu báo cáo và thông tin công khai.',
    badgeColor: '#64748b',
    badgeTone: 'neutral',
  },
};

export const AVAILABLE_GROUPS: ReadonlyArray<string> = [
  'Miền Bắc (Hà Nội)',
  'Miền Trung (Đà Nẵng)',
  'Miền Nam (TP. Hồ Chí Minh)',
  'Đồng bằng Sông Cửu Long (Cần Thơ)',
  'Doanh nghiệp FDI & Toàn cầu',
  'Kinh doanh Trực tuyến & SMB',
  'Ban Quản trị & Vận hành Doanh thu',
];

export const USER_STATUS_CONFIG: Record<
  UserStatusType,
  {
    label: string;
    badgeTone: 'success' | 'warning' | 'danger';
  }
> = {
  active: {
    label: 'Đang hoạt động',
    badgeTone: 'success',
  },
  pending_activation: {
    label: 'Chờ kích hoạt',
    badgeTone: 'warning',
  },
  locked: {
    label: 'Bị khóa',
    badgeTone: 'danger',
  },
};
