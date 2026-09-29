import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCustomerData } from './hooks/useCustomerData';
import { CustomerCard } from './components/CustomerCard';
import { UnauthorizedMessage } from './components/UnauthorizedMessage';

const App: React.FC = () => {
  const { currentUser, switchUser, mockUsers } = useAuth();
  const { customers, checkRecordAccess } = useCustomerData(currentUser);
  
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleTestAccess = (recordId: string) => {
    const hasAccess = checkRecordAccess(recordId);
    if (!hasAccess) {
      setErrorMsg(`Bạn không có quyền truy cập vào bản ghi (Mã: ${recordId}). Dữ liệu này thuộc phạm vi ngoài quyền hạn của bạn.`);
    } else {
      setErrorMsg('');
      alert('Truy cập thành công!');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Quản Lý Khách Hàng (CRM)</h1>
        <div className="user-switcher">
          <label htmlFor="user-select">Đóng vai trò:</label>
          <select 
            id="user-select" 
            value={currentUser.id} 
            onChange={(e) => switchUser(e.target.value)}
          >
            {mockUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </header>

      <main className="main-content">
        <UnauthorizedMessage 
          isVisible={!!errorMsg} 
          message={errorMsg} 
          onClose={() => setErrorMsg('')} 
        />

        <section className="section">
          <h2>Danh sách Khách hàng của bạn</h2>
          <p className="subtitle">Hiển thị dựa trên phạm vi quyền: {currentUser.role}</p>
          
          <div className="grid-container">
            {customers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
          {customers.length === 0 && <p>Không có dữ liệu.</p>}
        </section>

        <section className="section testing-section">
          <h2>Kiểm thử phân quyền truy cập chéo</h2>
          <p>Nhân viên A thử truy cập vào khách hàng của nhân viên B (c2):</p>
          <button className="btn btn--secondary" onClick={() => handleTestAccess('c2')}>
            Kiểm tra truy cập "Khách hàng 2"
          </button>
        </section>
      </main>
    </div>
  );
};

export default App;
