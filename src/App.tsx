import React, { useState } from 'react';

// Định nghĩa kiểu dữ liệu
type Role = 'EMPLOYEE' | 'TEAM_LEAD' | 'DIRECTOR';

interface User {
  id: string;
  name: string;
  role: Role;
  teamId?: string;
  roleTitle: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  assignedToId: string;
  assignedToName: string;
  teamId: string;
  teamName: string;
  value: string;
  status: string;
}

// 1. Dữ liệu giả lập Người dùng
const USERS: User[] = [
  { id: 'u1', name: 'Nguyễn Văn Tùng', role: 'DIRECTOR', roleTitle: 'Giám đốc Kinh doanh' },
  { id: 'u2', name: 'Trần Thị Minh', role: 'TEAM_LEAD', teamId: 'team-a', roleTitle: 'Trưởng nhóm Kinh doanh A' },
  { id: 'u3', name: 'Lê Văn Nam', role: 'EMPLOYEE', teamId: 'team-a', roleTitle: 'Nhân viên Sale (Nhóm A)' },
  { id: 'u4', name: 'Phạm Thi Hoa', role: 'EMPLOYEE', teamId: 'team-a', roleTitle: 'Nhân viên Sale (Nhóm A)' },
  { id: 'u5', name: 'Hoàng Văn Dũng', role: 'TEAM_LEAD', teamId: 'team-b', roleTitle: 'Trưởng nhóm Kinh doanh B' },
  { id: 'u6', name: 'Vũ Thị Lan', role: 'EMPLOYEE', teamId: 'team-b', roleTitle: 'Nhân viên Sale (Nhóm B)' },
];

// 2. Dữ liệu giả lập Khách hàng
const CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Công ty Á Châu', company: 'ACB Corp', assignedToId: 'u3', assignedToName: 'Lê Văn Nam', teamId: 'team-a', teamName: 'Nhóm A', value: '500,000,000 VNĐ', status: 'Mới' },
  { id: 'c2', name: 'Tập đoàn Bến Thành', company: 'BenThanh Group', assignedToId: 'u3', assignedToName: 'Lê Văn Nam', teamId: 'team-a', teamName: 'Nhóm A', value: '1,200,000,000 VNĐ', status: 'Đang thương lượng' },
  { id: 'c3', name: 'Công ty Cửu Long', company: 'CuuLong Logistics', assignedToId: 'u4', assignedToName: 'Phạm Thi Hoa', teamId: 'team-a', teamName: 'Nhóm A', value: '300,000,000 VNĐ', status: 'Thành công' },
  { id: 'c4', name: 'Tập đoàn Đại Nam', company: 'DaiNam Group', assignedToId: 'u5', assignedToName: 'Hoàng Văn Dũng', teamId: 'team-b', teamName: 'Nhóm B', value: '800,000,000 VNĐ', status: 'Đang thương lượng' },
  { id: 'c5', name: 'Công ty Ép-Păng', company: 'Epan Service', assignedToId: 'u6', assignedToName: 'Vũ Thị Lan', teamId: 'team-b', teamName: 'Nhóm B', value: '450,000,000 VNĐ', status: 'Mới' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);

  // LOGIC PHÂN QUYỀN VỪA THEO VAI TRÒ VỪA THEO DỮ LIỆU SỞ HỮU
  const visibleCustomers = CUSTOMERS.filter((customer) => {
    // 1. Giám đốc: Thấy tất cả
    if (currentUser.role === 'DIRECTOR') {
      return true;
    }
    // 2. Trưởng nhóm: Thấy tất cả khách hàng của các thành viên trong nhóm mình
    if (currentUser.role === 'TEAM_LEAD') {
      return customer.teamId === currentUser.teamId;
    }
    // 3. Nhân viên: Chỉ thấy khách hàng được phân công trực tiếp cho mình
    if (currentUser.role === 'EMPLOYEE') {
      return customer.assignedToId === currentUser.id;
    }
    return false;
  });

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '24px', backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#fff', padding: '16px 24px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#172b4d' }}>Mô Phỏng Hệ Thống Phân Quyền Khách Hàng (CRM)</h1>
        
        {/* Bộ chuyển đổi Tài khoản / Vai trò */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Đang đăng nhập với tư cách:</label>
          <select 
            value={currentUser.id} 
            onChange={(e) => {
              const selected = USERS.find(u => u.id === e.target.value);
              if (selected) setCurrentUser(selected);
            }}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minWidth: '280px' }}
          >
            {USERS.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} — [{u.roleTitle}]
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Thông tin mô tả quyền */}
      <section style={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px' }}>
        <strong>Quyên hiện tại: </strong> 
        {currentUser.role === 'DIRECTOR' && 'Quản trị viên / Giám đốc — Quyền xem toàn bộ hệ thống.'}
        {currentUser.role === 'TEAM_LEAD' && `Trưởng ${currentUser.teamId === 'team-a' ? 'Nhóm A' : 'Nhóm B'} — Quyền xem tất cả dữ liệu thuộc nhóm quản lý.`}
        {currentUser.role === 'EMPLOYEE' && 'Nhân viên Sale — Quyền chỉ xem dữ liệu do chính mình phụ trách.'}
      </section>

      {/* Bảng Danh sách Khách hàng */}
      <main style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Danh Sách Khách Hàng Được Phép Truy Cập</h2>
          <span style={{ fontSize: '13px', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '12px' }}>
            Hiển thị: <strong>{visibleCustomers.length}</strong> / {CUSTOMERS.length} khách hàng
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px' }}>Mã KH</th>
              <th style={{ padding: '12px' }}>Tên Khách Hàng</th>
              <th style={{ padding: '12px' }}>Công Ty</th>
              <th style={{ padding: '12px' }}>Giá Trị Hợp Đồng</th>
              <th style={{ padding: '12px' }}>Thuộc Nhóm</th>
              <th style={{ padding: '12px' }}>Nhân Viên Phụ Trách</th>
              <th style={{ padding: '12px' }}>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.length > 0 ? (
              visibleCustomers.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.id}</td>
                  <td style={{ padding: '12px', color: '#0052cc', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '12px' }}>{item.company}</td>
                  <td style={{ padding: '12px' }}>{item.value}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: item.teamId === 'team-a' ? '#e6fcff' : '#fff0f6', color: item.teamId === 'team-a' ? '#007a87' : '#c41d7f', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {item.teamName}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{item.assignedToName}</td>
                  <td style={{ padding: '12px' }}>{item.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                  Không có dữ liệu khách hàng nào khả dụng cho tài khoản này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CRMDataProvider } from './context/CRMDataContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CRMDataProvider>
          <AppRoutes />
        </CRMDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
