export interface INavigationItem {
  id: string;
  title: string;
  path: string;
  iconName: string;
  requiredPermissions: string[];
  requiredRoles?: string[];
  badge?: string | number;
  children?: INavigationItem[];
}
