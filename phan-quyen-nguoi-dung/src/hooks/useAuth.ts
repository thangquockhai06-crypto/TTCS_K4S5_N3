import { useState } from 'react';
import { IUser } from '../types';

const mockUsers: IUser[] = [
  { id: 'e1', name: 'Nhân viên A', role: 'EMPLOYEE', teamId: 't1' },
  { id: 'e2', name: 'Nhân viên B', role: 'EMPLOYEE', teamId: 't1' },
  { id: 't1_leader', name: 'Trưởng nhóm T1', role: 'TEAM_LEADER', teamId: 't1' },
  { id: 'd1', name: 'Giám đốc', role: 'DIRECTOR', teamId: 'all' },
];

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<IUser>(mockUsers[0]);

  const switchUser = (userId: string): void => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return { currentUser, switchUser, mockUsers };
};
