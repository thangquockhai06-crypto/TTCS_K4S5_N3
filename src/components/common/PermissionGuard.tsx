import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization, PermissionKey } from '../../hooks/useAuthorization';
import { Button } from './Button';

export interface IPermissionGuardProps {
  permission?: PermissionKey;
  permissions?: PermissionKey[];
  requireAll?: boolean;
  roles?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<IPermissionGuardProps> = ({
  permission,
  permissions,
  requireAll = false,
  roles,
  fallback,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, normalizedRole } = useAuthorization();
  const navigate = useNavigate();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (permissions && permissions.length > 0) {
    if (requireAll && !hasAllPermissions(permissions)) {
      isAllowed = false;
    } else if (!requireAll && !hasAnyPermission(permissions)) {
      isAllowed = false;
    }
  }

  if (roles && roles.length > 0) {
    const matchesRole = roles.some((r) => r.toLowerCase().trim() === normalizedRole);
    if (!matchesRole) {
      isAllowed = false;
    }
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  // Minimal clean Vietnamese 403 access denied banner/card
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '240px',
        padding: '32px 16px',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '28px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-danger-soft)',
            color: 'var(--color-danger)',
            marginBottom: '16px',
          }}
        >
          <ShieldAlert size={24} />
        </div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Không đủ quyền truy cập (HTTP 403)
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
          Tài khoản của bạn không có quyền hạn truy cập tài nguyên hoặc chức năng này. Vui lòng liên hệ Quản trị viên hệ thống (admin@nexuscrm.vn) nếu bạn cần bổ sung quyền.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={14} />}>
            Quay lại
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            Về Bảng điều khiển
          </Button>
        </div>
      </div>
    </div>
  );
};
