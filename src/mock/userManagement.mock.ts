import type {
  DataScopeType,
  IHandoverAuditLog,
  IManagedUser,
  ISalesTeamNode,
  SystemRoleType,
} from '../interfaces';
import { createAvatarSvgDataUri } from '../utils/formatters';

export const USER_MANAGEMENT_STORAGE_KEYS = {
  MANAGED_USERS: 'nexus_crm_managed_users_v2',
  HANDOVER_LOGS: 'nexus_crm_handover_logs_v2',
  DEACTIVATED_EMAILS: 'nexus_crm_deactivated_user_emails_v2',
} as const;

export const ROLE_DATA_SCOPE_MAP: Readonly<
  Record<SystemRoleType, { scope: DataScopeType; label: string }>
> = {
  'Super Admin': {
    scope: 'ALL_ORG',
    label: 'Toàn bộ Cây tổ chức (100% Dữ liệu Hệ thống)',
  },
  'VP of Sales': {
    scope: 'ALL_ORG',
    label: 'Toàn bộ Khối Kinh doanh & Các nhánh trực thuộc',
  },
  'RevOps Lead': {
    scope: 'ALL_ORG',
    label: 'Toàn bộ Báo cáo, Quota & Kiểm toán Doanh thu',
  },
  'Sales Manager': {
    scope: 'TEAM_TREE',
    label: 'Nhánh Nhóm Kinh doanh quản lý & Thành viên cấp dưới',
  },
  'Account Executive': {
    scope: 'OWNED_ONLY',
    label: 'Chỉ Khách hàng & Cơ hội do cá nhân sở hữu',
  },
};

export const INITIAL_SALES_TEAMS: ReadonlyArray<ISalesTeamNode> = [
  {
    id: 'team-hq',
    code: 'ORG-ROOT',
    name: 'Ban Quản Trị & Vận Hành Doanh Thu (HQ)',
    parentTeamId: null,
    parentTeamName: null,
    level: 1,
    managerName: 'Quản Trị Viên Hệ Thống',
    dataScope: 'ALL_ORG',
    dataScopeLabel: 'Toàn bộ Cây tổ chức (Global Scope)',
    description:
      'Nút gốc cây tổ chức — Giám sát toàn bộ khách hàng, cơ hội, chiết khấu và phân quyền hệ thống.',
  },
  {
    id: 'team-ent-global',
    code: 'ENT-GLOBAL',
    name: 'Khối Khách hàng Doanh nghiệp Quốc tế (US & EU)',
    parentTeamId: 'team-hq',
    parentTeamName: 'Ban Quản Trị & Vận Hành Doanh Thu (HQ)',
    level: 2,
    managerName: 'Hoàng Minh Tuấn',
    dataScope: 'TEAM_TREE',
    dataScopeLabel: 'Theo nhánh Khối Quốc tế & các nhóm trực thuộc',
    description:
      'Phụ trách các tập đoàn công nghệ AI/Cloud tại Bắc Mỹ & Châu Âu (Linear, Vercel, Mistral AI).',
  },
  {
    id: 'team-ent-apac',
    code: 'ENT-APAC',
    name: 'Khối Khách hàng Trọng điểm Việt Nam & APAC',
    parentTeamId: 'team-hq',
    parentTeamName: 'Ban Quản Trị & Vận Hành Doanh Thu (HQ)',
    level: 2,
    managerName: 'Trần Thu Hà',
    dataScope: 'TEAM_TREE',
    dataScopeLabel: 'Theo nhánh Khối Việt Nam & APAC',
    description:
      'Phụ trách các doanh nghiệp lớn tại Việt Nam, Nhật Bản và Singapore (FPT, MoMo, Stripe Japan).',
  },
  {
    id: 'team-midmarket',
    code: 'MID-GROWTH',
    name: 'Nhóm Kinh doanh Mid-Market & Tăng trưởng (Growth)',
    parentTeamId: 'team-ent-apac',
    parentTeamName: 'Khối Khách hàng Trọng điểm Việt Nam & APAC',
    level: 3,
    managerName: 'Lê Quốc Khánh',
    dataScope: 'OWNED_ONLY',
    dataScopeLabel: 'Phạm vi Nhóm Growth & Hồ sơ cá nhân phụ trách',
    description:
      'Phụ trách mở rộng mới phân khúc Mid-Market, Startup công nghệ và chuyển đổi PLG.',
  },
];

export const INITIAL_MANAGED_USERS: ReadonlyArray<IManagedUser> = [
  {
    id: 'own-01',
    fullName: 'Quản Trị Viên Hệ Thống',
    email: 'admin@nexuscrm.vn',
    avatarUrl: createAvatarSvgDataUri('Quan Tri Vien', 0),
    role: 'Super Admin',
    title: 'Giám đốc Điều hành Hệ thống CRM',
    department: 'Ban Quản Trị & Vận Hành Doanh Thu',
    salesTeamId: 'team-hq',
    salesTeamName: 'Ban Quản Trị & Vận Hành Doanh Thu (HQ)',
    dataScope: 'ALL_ORG',
    dataScopeLabel: 'Toàn bộ Cây tổ chức (100% Dữ liệu Hệ thống)',
    status: 'Active',
    activeSessions: 2,
    lastActiveAt: 'Đang trực tuyến',
    customersCount: 13,
    dealsCount: 7,
    totalPipelineArr: 1721000,
  },
  {
    id: 'own-02',
    fullName: 'Hoàng Minh Tuấn',
    email: 'tuan.hoang@nexuscrm.vn',
    avatarUrl: createAvatarSvgDataUri('Hoang Minh Tuan', 1),
    role: 'Sales Manager',
    title: 'Trưởng Khối Kinh doanh Quốc tế',
    department: 'Khối Kinh doanh Quốc tế',
    salesTeamId: 'team-ent-global',
    salesTeamName: 'Khối Khách hàng Doanh nghiệp Quốc tế (US & EU)',
    dataScope: 'TEAM_TREE',
    dataScopeLabel: 'Nhánh Nhóm Kinh doanh quản lý & Thành viên cấp dưới',
    status: 'Active',
    activeSessions: 2,
    lastActiveAt: '5 phút trước',
    customersCount: 13,
    dealsCount: 2,
    totalPipelineArr: 236000,
  },
  {
    id: 'own-03',
    fullName: 'Trần Thu Hà',
    email: 'ha.tran@nexuscrm.vn',
    avatarUrl: createAvatarSvgDataUri('Tran Thu Ha', 2),
    role: 'VP of Sales',
    title: 'Phó Chủ tịch Kinh doanh Khu vực APAC',
    department: 'Khối Kinh doanh APAC',
    salesTeamId: 'team-ent-apac',
    salesTeamName: 'Khối Khách hàng Trọng điểm Việt Nam & APAC',
    dataScope: 'ALL_ORG',
    dataScopeLabel: 'Toàn bộ Khối Kinh doanh & Các nhánh trực thuộc',
    status: 'Active',
    activeSessions: 3,
    lastActiveAt: '12 phút trước',
    customersCount: 12,
    dealsCount: 2,
    totalPipelineArr: 555000,
  },
  {
    id: 'own-04',
    fullName: 'Lê Quốc Khánh',
    email: 'khanh.le@nexuscrm.vn',
    avatarUrl: createAvatarSvgDataUri('Le Quoc Khanh', 3),
    role: 'Account Executive',
    title: 'Chuyên viên Kinh doanh Cấp cao (Senior AE)',
    department: 'Nhóm Mid-Market & Growth',
    salesTeamId: 'team-midmarket',
    salesTeamName: 'Nhóm Kinh doanh Mid-Market & Tăng trưởng (Growth)',
    dataScope: 'OWNED_ONLY',
    dataScopeLabel: 'Chỉ Khách hàng & Cơ hội do cá nhân sở hữu',
    status: 'Active',
    activeSessions: 1,
    lastActiveAt: '28 phút trước',
    customersCount: 12,
    dealsCount: 1,
    totalPipelineArr: 275000,
  },
];

export const INITIAL_HANDOVER_AUDIT_LOGS: ReadonlyArray<IHandoverAuditLog> = [];
