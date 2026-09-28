import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNavigationMenu } from './hooks/useNavigationMenu';
import { MENU_ITEMS } from './data/mockData';
import { SidebarNavigation } from './components/SidebarNavigation';
import { UserRoleSelector } from './components/UserRoleSelector';
import { PermissionVisualizer } from './components/PermissionVisualizer';
import { Menu, Smartphone, Monitor } from 'lucide-react';
import './styles/index.css';

export const App: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const { filteredMenuItems, totalVisibleItems } = useNavigationMenu({
    items: MENU_ITEMS,
    userPermissions: currentUser.permissions
  });

  const [activePath, setActivePath] = useState<string>('/dashboard');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isSimulating360Mobile, setIsSimulating360Mobile] = useState<boolean>(false);

  return (
    <div className={`app-container ${isSimulating360Mobile ? 'app-container--mobile-view' : ''}`}>
      {/* Sidebar for Desktop & Mobile Overlay */}
      <div className={`sidebar-wrapper ${isMobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <SidebarNavigation
          user={currentUser}
          menuItems={filteredMenuItems}
          activePath={activePath}
          onNavigate={setActivePath}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onCloseMobile={isMobileOpen ? () => setIsMobileOpen(false) : undefined}
        />
      </div>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="main-header">
          <div className="main-header__left">
            <button
              type="button"
              className="main-header__mobile-toggle"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Mở Menu Mobile"
            >
              <Menu size={20} />
            </button>
            <h1 className="main-header__title">Hệ thống Quản lý Người dùng</h1>
          </div>

          <div className="main-header__actions">
            <button
              type="button"
              className={`sim-btn ${isSimulating360Mobile ? 'sim-btn--active' : ''}`}
              onClick={() => setIsSimulating360Mobile(!isSimulating360Mobile)}
              title="Chuyển chế độ test giao diện 360px"
            >
              {isSimulating360Mobile ? <Monitor size={15} /> : <Smartphone size={15} />}
              <span>{isSimulating360Mobile ? 'Màn hình Chuẩn' : 'Mô phỏng Mobile 360px'}</span>
            </button>
          </div>
        </header>

        <main className="main-content">
          <UserRoleSelector
            currentRole={currentUser.role}
            onRoleChange={switchRole}
          />

          <PermissionVisualizer
            user={currentUser}
            visibleMenuCount={totalVisibleItems}
          />

          <div className="content-preview">
            <div className="content-preview__icon">
              <Menu size={40} />
            </div>
            <h2>Đang truy cập trang:</h2>
            <div className="content-preview__path">{activePath}</div>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.85rem' }}>
              Menu điều hướng ở phía bên trái chỉ hiển thị đúng các chức năng mà vai trò{' '}
              <strong>{currentUser.roleDisplayName}</strong> có quyền truy cập.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
