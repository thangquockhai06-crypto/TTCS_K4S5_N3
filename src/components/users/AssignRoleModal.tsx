import React, { useEffect, useState } from 'react';
import { AlertCircle, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  AVAILABLE_GROUPS,
  IUserItem,
  USER_ROLES_CONFIG,
  UserRoleType,
} from '../../interfaces/user-management.interface';

export interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserItem | null;
  currentUserId?: string;
  currentUserEmail?: string;
  onSave: (userId: string, roles: UserRoleType[], team: string) => Promise<void>;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserId,
  currentUserEmail,
  onSave,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRoleType[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if target user is current authenticated Admin
  const isEditingSelf = Boolean(
    user &&
      ((currentUserId && user.id === currentUserId) ||
        (currentUserEmail &&
          user.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()))
  );

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles && user.roles.length > 0 ? [...user.roles] : ['sales']);
      setSelectedTeam(user.group || 'Miền Bắc (Hà Nội)');
      setError(null);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const toggleRole = (roleKey: UserRoleType): void => {
    // Current Admin cannot disable/remove their own Admin role through the UI
    if (isEditingSelf && roleKey === 'admin' && selectedRoles.includes('admin')) {
      setError('Quản trị viên không thể tự thu hồi vai trò Quản trị của chính mình.');
      return;
    }

    let next: UserRoleType[];
    if (selectedRoles.includes(roleKey)) {
      next = selectedRoles.filter((r) => r !== roleKey);
    } else {
      next = [...selectedRoles, roleKey];
    }

    if (next.length === 0) {
      setError('Người dùng phải có ít nhất một vai trò trong hệ thống.');
      return;
    }

    setError(null);
    setSelectedRoles(next);
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setError('Vui lòng chọn ít nhất một vai trò.');
      return;
    }

    // Role Manager requires specific team
    if (selectedRoles.includes('manager') && (!selectedTeam || selectedTeam === 'Chưa phân nhóm')) {
      setError('Người giữ vai trò Trưởng nhóm phải được gán một nhóm kinh doanh cụ thể.');
      return;
    }

    // Double-check: Admin self-demotion
    if (isEditingSelf && user.roles.includes('admin') && !selectedRoles.includes('admin')) {
      setError('Quản trị viên không thể tự thu hồi quyền Admin của chính mình.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(user.id, selectedRoles, selectedTeam);
      onClose();
    } catch (err: unknown) {
      let msg = 'Không thể cập nhật phân quyền người dùng.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axErr = err as { response?: { data?: { detail?: string; message?: string } } };
        msg = axErr.response?.data?.detail || axErr.response?.data?.message || msg;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleKeys: UserRoleType[] = ['admin', 'manager', 'sales', 'viewer'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phân vai trò & Nhóm kinh doanh"
      subtitle={`Tài khoản: ${user.name} (${user.email})`}
      maxWidth="md"
    >
      <form onSubmit={(e) => void handleSave(e)}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-soft)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isEditingSelf && user.roles.includes('admin') && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              marginBottom: '16px',
            }}
          >
            <Shield size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
            Bạn đang sửa tài khoản của chính mình. Quyền Quản trị viên (Admin) được khóa bảo vệ, không thể tự thu hồi.
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>
            Vai trò hệ thống (Cho phép chọn nhiều vai trò)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {roleKeys.map((key) => {
              const cfg = USER_ROLES_CONFIG[key];
              const isChecked = selectedRoles.includes(key);
              const isDisabled = isEditingSelf && key === 'admin' && isChecked;

              return (
                <div
                  key={key}
                  onClick={() => !isDisabled && toggleRole(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isChecked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: isChecked ? 'var(--color-primary-soft)' : 'var(--color-bg-surface)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.75 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => {}}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem' }}>{cfg.label}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {cfg.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>
            Nhóm kinh doanh / Địa bàn phụ trách
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-surface)',
              fontSize: '0.875rem',
            }}
          >
            {AVAILABLE_GROUPS.map((grp) => (
              <option key={grp} value={grp}>
                {grp}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
