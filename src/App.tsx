import React, { useState } from 'react';
import { AccessDeniedCard } from './components/AccessDeniedCard';
import { UserRoleType } from './types/IUser';

export const App: React.FC = () => {
  const [role, setRole] = useState<UserRoleType>('EMPLOYEE');

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label style={{ marginRight: '10px', fontWeight: 600 }}>Thử nghiệm Vai trò hiện tại:</label>
        <select value={role} onChange={(e) => setRole(e.target.value as UserRoleType)} style={{ padding: '6px 12px' }}>
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="GUEST">GUEST</option>
        </select>
      </div>

      <AccessDeniedCard
        currentRole={role}
        requiredRole="ADMIN"
        attemptedResource="/admin/users/manage"
        onNavigate={(path) => alert(`Đang chuyển hướng tới: ${path}`)}
        onRequestAccess={(res) => alert(`Đã gửi yêu cầu cấp quyền cho: ${res}`)}
      />
    </div>
  );
};

export default App;