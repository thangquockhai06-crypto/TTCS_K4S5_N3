import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../hooks/useSidebar';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import styles from './AppLayout.module.css';

export const AppLayout: React.FC = () => {
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    openMobileSidebar,
    closeMobileSidebar,
  } = useSidebar();

  return (
    <div
      className={`${styles.appShell} ${
        isCollapsed ? styles['appShell--collapsed'] : ''
      }`}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={closeMobileSidebar}
      />

      <div className={styles.appShell__mainArea}>
        <TopBar
          isSidebarCollapsed={isCollapsed}
          onToggleSidebarCollapse={toggleCollapse}
          onOpenMobileMenu={openMobileSidebar}
        />
        <main className={styles.appShell__content} id="main-content">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
};
