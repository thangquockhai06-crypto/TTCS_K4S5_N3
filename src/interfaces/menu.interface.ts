import React from 'react';
import { PermissionKey } from '../hooks/useAuthorization';

export interface IMenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: PermissionKey;
  requiredRole?: string;
  badge?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}
