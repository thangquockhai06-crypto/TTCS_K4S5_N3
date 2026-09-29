import { useState, useEffect } from 'react';
import { ICustomer, IUser } from '../types';

const mockCustomers: ICustomer[] = [
  { id: 'c1', name: 'Khách hàng 1', ownerId: 'e1', teamId: 't1', company: 'Công ty ABC' },
  { id: 'c2', name: 'Khách hàng 2', ownerId: 'e2', teamId: 't1', company: 'Công ty XYZ' },
  { id: 'c3', name: 'Khách hàng 3', ownerId: 'e3', teamId: 't2', company: 'Công ty KLM' },
];

export const useCustomerData = (user: IUser) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);

  useEffect(() => {
    // Giả lập API trả về dữ liệu đã lọc theo phân quyền (My data, Team data, All data)
    let filtered: ICustomer[] = [];
    if (user.role === 'EMPLOYEE') {
      filtered = mockCustomers.filter(c => c.ownerId === user.id);
    } else if (user.role === 'TEAM_LEADER') {
      filtered = mockCustomers.filter(c => c.teamId === user.teamId);
    } else if (user.role === 'DIRECTOR') {
      filtered = mockCustomers; // Thấy tất cả
    }
    setCustomers(filtered);
  }, [user]);

  const checkRecordAccess = (recordId: string): boolean => {
      const record = mockCustomers.find(c => c.id === recordId);
      if (!record) return false;
      if (user.role === 'DIRECTOR') return true;
      if (user.role === 'TEAM_LEADER' && record.teamId === user.teamId) return true;
      if (user.role === 'EMPLOYEE' && record.ownerId === user.id) return true;
      return false;
  }

  return { customers, checkRecordAccess };
};
