import { useMemo } from 'react';
import { INavigationItem } from '../types/INavigationItem';

export interface IUseNavigationMenuProps {
  items: INavigationItem[];
  userPermissions: string[];
}

export interface IUseNavigationMenuReturn {
  filteredMenuItems: INavigationItem[];
  totalVisibleItems: number;
}

export const useNavigationMenu = ({
  items,
  userPermissions
}: IUseNavigationMenuProps): IUseNavigationMenuReturn => {
  const filteredMenuItems = useMemo(() => {
    const filterItem = (item: INavigationItem): INavigationItem | null => {
      // Check if user has required permissions for current item
      const hasPermission =
        item.requiredPermissions.length === 0 ||
        item.requiredPermissions.some(perm => userPermissions.includes(perm));

      // Process children if exist
      let filteredChildren: INavigationItem[] = [];
      if (item.children && item.children.length > 0) {
        filteredChildren = item.children
          .map(child => filterItem(child))
          .filter((child): child is INavigationItem => child !== null);
      }

      // Hide parent menu if it has no permissions and no valid children
      if (!hasPermission && filteredChildren.length === 0) {
        return null;
      }

      return {
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : undefined
      };
    };

    return items
      .map(item => filterItem(item))
      .filter((item): item is INavigationItem => item !== null);
  }, [items, userPermissions]);

  const countItems = (list: INavigationItem[]): number => {
    return list.reduce((acc, curr) => {
      return acc + 1 + (curr.children ? countItems(curr.children) : 0);
    }, 0);
  };

  const totalVisibleItems = useMemo(() => countItems(filteredMenuItems), [filteredMenuItems]);

  return {
    filteredMenuItems,
    totalVisibleItems
  };
};
