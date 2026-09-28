import React, { useState } from 'react';
import { INavigationItem } from '../types/INavigationItem';
import { IconMapper } from './IconMapper';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface INavigationMenuProps {
  items: INavigationItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  isCollapsed?: boolean;
}

export const NavigationMenu: React.FC<INavigationMenuProps> = ({
  items,
  activePath,
  onNavigate,
  isCollapsed = false
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    nav_user_management: true,
    nav_customer_management: true,
    nav_reports: true
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMenuItem = (item: INavigationItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!expandedKeys[item.id];
    const isActive = activePath === item.path;

    return (
      <li key={item.id} className={`nav-menu__item ${isChild ? 'nav-menu__item--child' : ''}`}>
        <button
          type="button"
          onClick={(e) => {
            if (hasChildren) {
              toggleExpand(item.id, e);
            } else {
              onNavigate(item.path);
            }
          }}
          className={`nav-menu__link ${isActive ? 'nav-menu__link--active' : ''}`}
          title={isCollapsed ? item.title : undefined}
        >
          <span className="nav-menu__icon-container">
            <IconMapper name={item.iconName} size={18} />
          </span>

          {!isCollapsed && (
            <>
              <span className="nav-menu__label">{item.title}</span>

              {item.badge && (
                <span className="nav-menu__badge">{item.badge}</span>
              )}

              {hasChildren && (
                <span className="nav-menu__arrow">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </>
          )}
        </button>

        {!isCollapsed && hasChildren && isExpanded && (
          <ul className="nav-menu__submenu">
            {item.children?.map(child => renderMenuItem(child, true))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="nav-menu" aria-label="Menu điều hướng chính">
      <ul className="nav-menu__list">
        {items.map(item => renderMenuItem(item))}
      </ul>
    </nav>
  );
};
