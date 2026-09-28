<<<<<<< HEAD
import { useState, useCallback } from 'react';
import { IUser, RoleType } from '../types/IUser';
import { MOCK_USERS } from '../data/mockData';

export interface IUseAuthReturn {
  currentUser: IUser;
  switchRole: (role: RoleType) => void;
  hasPermission: (requiredPermission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAuth = (): IUseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<IUser>(MOCK_USERS.ADMIN);

  const switchRole = useCallback((role: RoleType) => {
    if (MOCK_USERS[role]) {
      setCurrentUser(MOCK_USERS[role]);
    }
  }, []);

  const hasPermission = useCallback((requiredPermission: string): boolean => {
    if (!requiredPermission) return true;
    return currentUser.permissions.includes(requiredPermission);
  }, [currentUser]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(perm => currentUser.permissions.includes(perm));
  }, [currentUser]);

  return {
    currentUser,
    switchRole,
    hasPermission,
    hasAnyPermission
  };
};
=======
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { IAuthContext } from '../interfaces';

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
>>>>>>> d2f841410afb71effb9703b50bd6f7d70a67fe62
