import React from 'react';
import { IUser } from '../types/IUser';
import { INavigationItem } from '../types/INavigationItem';
import { UserProfileCard } from './UserProfileCard';
import { NavigationMenu } from './NavigationMenu';
import { ChevronLeft, ChevronRight, ShieldAlert, X } from 'lucide-react';

export interface ISidebarNavigationProps {
  user: IUser;
  menuItems: INavigationItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const SidebarNavigation: React.FC<ISidebarNavigationProps> = ({
  user,
  menuItems,
  activePath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile
}) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <ShieldAlert size={22} />
          </div>
          {!isCollapsed && <span className="sidebar__title">UMS Admin</span>}
        </div>

        {onCloseMobile ? (
          <button
            type="button"
            className="sidebar__close-btn"
            onClick={onCloseMobile}
            aria-label="Đóng Menu Mobile"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      <div className="sidebar__user-section">
        <UserProfileCard user={user} isCollapsed={isCollapsed} />
      </div>

      <div className="sidebar__menu-container">
        <NavigationMenu
          items={menuItems}
          activePath={activePath}
          onNavigate={(path) => {
            onNavigate(path);
            if (onCloseMobile) onCloseMobile();
          }}
          isCollapsed={isCollapsed}
        />
      </div>

      {!isCollapsed && (
        <div className="sidebar__footer">
          <span className="sidebar__version">Phiên bản System 2.4.0</span>
        </div>
      )}
    </aside>
  );
};
