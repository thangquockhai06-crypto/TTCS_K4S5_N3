export type RoleType = 'ADMIN' | 'MANAGER' | 'SALE_AGENT' | 'SUPPORT_AGENT';

export interface IUserPermission {
  action: string;
  resource: string;
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: RoleType;
  roleDisplayName: string;
  businessGroup: string;
  permissions: string[];
}
