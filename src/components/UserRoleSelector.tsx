import React from 'react';
import { RoleType } from '../types/IUser';
import { ShieldCheck, UserCheck, Briefcase, Headphones } from 'lucide-react';

export interface IUserRoleSelectorProps {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
}

export const UserRoleSelector: React.FC<IUserRoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  const rolesList: { role: RoleType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      role: 'ADMIN',
      label: 'Quản trị viên (Admin)',
      desc: 'Toàn bộ quyền trên tất cả các module',
      icon: <ShieldCheck size={16} />
    },
    {
      role: 'MANAGER',
      label: 'Trưởng phòng (Manager)',
      desc: 'Xem báo cáo, duyệt hợp đồng, xem user',
      icon: <UserCheck size={16} />
    },
    {
      role: 'SALE_AGENT',
      label: 'Chuyên viên Sales',
      desc: 'Quản lý khách hàng & tạo deal',
      icon: <Briefcase size={16} />
    },
    {
      role: 'SUPPORT_AGENT',
      label: 'Chuyên viên CSKH',
      desc: 'Xem khách hàng & xử lý Ticket hỗ trợ',
      icon: <Headphones size={16} />
    }
  ];

  return (
    <div className="role-selector">
      <div className="role-selector__header">
        <h3>Chuyển đổi Vai trò Test Phân quyền (RBAC)</h3>
        <p>Chọn vai trò bên dưới để kiểm tra menu hiển thị động tương ứng</p>
      </div>

      <div className="role-selector__grid">
        {rolesList.map(item => {
          const isSelected = currentRole === item.role;
          return (
            <button
              key={item.role}
              type="button"
              onClick={() => onRoleChange(item.role)}
              className={`role-selector__card ${isSelected ? 'role-selector__card--active' : ''}`}
            >
              <div className="role-selector__card-icon">
                {item.icon}
              </div>
              <div className="role-selector__card-body">
                <span className="role-selector__title">{item.label}</span>
                <span className="role-selector__desc">{item.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
