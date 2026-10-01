import { useCallback, useEffect, useState } from 'react';

export interface IUseSidebarReturn {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobileViewport: boolean;
  toggleCollapse: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export function useSidebar(): IUseSidebarReturn {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = (): void => {
      const mobile = window.innerWidth < 1024;
      setIsMobileViewport(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleCollapse = useCallback((): void => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const openMobileSidebar = useCallback((): void => {
    setIsMobileOpen(true);
  }, []);

  const closeMobileSidebar = useCallback((): void => {
    setIsMobileOpen(false);
  }, []);

  return {
    isCollapsed,
    isMobileOpen,
    isMobileViewport,
    toggleCollapse,
    openMobileSidebar,
    closeMobileSidebar,
  };
}
