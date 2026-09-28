export type UserRoleType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'GUEST';

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: UserRoleType;
  department: string;
}

export interface INavigationSuggestion {
  id: string;
  label: string;
  targetPath: string;
  description: string;
}

export interface IAccessDeniedProps {
  currentRole: UserRoleType;
  requiredRole: UserRoleType | UserRoleType[];
  attemptedResource: string;
  onNavigate: (path: string) => void;
  onRequestAccess?: (resource: string) => void;
}