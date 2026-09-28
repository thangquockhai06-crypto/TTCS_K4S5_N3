import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, Info, Lock, X } from 'lucide-react';
import {
  AVAILABLE_GROUPS,
  IUserCreateInput,
  IUserItem,
  IUserUpdateInput,
  USER_ROLES_CONFIG,
  UserRoleType,
  UserStatusType,
} from '../../interfaces/user-management.interface';
import styles from './UserModal.module.css';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate?: (data: IUserCreateInput) => Promise<void>;
  onSubmitUpdate?: (userId: string, data: IUserUpdateInput) => Promise<void>;
  editingUser?: IUserItem | null;
  currentUserId?: string;
  currentUserEmail?: string;
  allExistingEmails: string[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  editingUser,
  currentUserId,
  currentUserEmail,
  allExistingEmails,
}) => {
  const isEditMode = Boolean(editingUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [roles, setRoles] = useState<UserRoleType[]>(['sales']);
  const [status, setStatus] = useState<UserStatusType>('pending_activation');
  const [phone, setPhone] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra xem có đang chỉnh sửa chính tài khoản quản trị của mình không
  const isEditingSelf = Boolean(
    editingUser &&
      ((currentUserId && editingUser.id === currentUserId) ||
        (currentUserEmail &&
          editingUser.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()))
  );

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setGroup(editingUser.group);
      setRoles(editingUser.roles);
      setStatus(editingUser.status);
      setPhone(editingUser.phone || '');
    } else {
      setName('');
      setEmail('');
      setGroup('Miền Bắc (Hà Nội)');
      setRoles(['sales']);
      setStatus('pending_activation');
      setPhone('');
    }
    setEmailError(null);
    setGroupError(null);
    setRolesError(null);
    setServerError(null);
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  // Live validate email duplication
  const handleEmailChange = (val: string): void => {
    setEmail(val);
    const normalized = val.trim().toLowerCase();

    if (!normalized) {
      setEmailError('Email không được để trống.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setEmailError('Định dạng email không hợp lệ (ví dụ: user@nexuscrm.vn).');
      return;
    }

    // Email trùng bị từ chối kèm thông báo cụ thể
    const isDuplicate = allExistingEmails.some((existing) => {
      if (isEditMode && editingUser && existing.toLowerCase() === editingUser.email.toLowerCase()) {
        return false;
      }
      return existing.toLowerCase() === normalized;
    });

    if (isDuplicate) {
      setEmailError(`Email '${val.trim()}' đã được sử dụng trong hệ thống. Vui lòng thử email khác.`);
    } else {
      setEmailError(null);
    }
  };

  // Toggle roles - Một người dùng có thể giữ nhiều vai trò cùng lúc
  const toggleRole = (roleKey: UserRoleType): void => {
    // Không thể tự thu hồi vai trò quản trị của chính mình
    if (isEditingSelf && roleKey === 'admin' && roles.includes('admin')) {
      return; // Không cho phép bỏ chọn admin của chính mình
    }

    let nextRoles: UserRoleType[];
    if (roles.includes(roleKey)) {
      nextRoles = roles.filter((r) => r !== roleKey);
    } else {
      nextRoles = [...roles, roleKey];
    }

    setRoles(nextRoles);

    if (nextRoles.length === 0) {
      setRolesError('Vui lòng chọn ít nhất một vai trò cho người dùng.');
    } else {
      setRolesError(null);
    }

    // Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể
    if (nextRoles.includes('manager') && (!group || group === 'Chưa phân nhóm')) {
      setGroupError('Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể.');
    } else if (group && group !== 'Chưa phân nhóm') {
      setGroupError(null);
    }
  };

  const handleGroupChange = (val: string): void => {
    setGroup(val);
    if (roles.includes('manager') && (!val || val === 'Chưa phân nhóm')) {
      setGroupError('Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể.');
    } else {
      setGroupError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setServerError(null);

    // Validate Name
    if (!name.trim()) {
      setServerError('Họ và tên người dùng không được để trống.');
      return;
    }

    // Validate Email
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || emailError) {
      setServerError(emailError || 'Vui lòng nhập email hợp lệ.');
      return;
    }

    // Kiểm tra trùng email lần cuối
    const isDuplicate = allExistingEmails.some((existing) => {
      if (isEditMode && editingUser && existing.toLowerCase() === editingUser.email.toLowerCase()) {
        return false;
      }
      return existing.toLowerCase() === normalizedEmail;
    });

    if (isDuplicate) {
      const err = `Email '${email.trim()}' đã được sử dụng trong hệ thống. Vui lòng thử email khác.`;
      setEmailError(err);
      setServerError(err);
      return;
    }

    // Validate Roles
    if (roles.length === 0) {
      setRolesError('Vui lòng chọn ít nhất một vai trò.');
      setServerError('Vui lòng chọn ít nhất một vai trò cho người dùng.');
      return;
    }

    // Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể
    if (roles.includes('manager')) {
      if (!group || group === 'Chưa phân nhóm') {
        const err = 'Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể.';
        setGroupError(err);
        setServerError(err);
        return;
      }
    }

    // Không thể tự thu hồi vai trò quản trị của chính mình
    if (isEditingSelf && editingUser?.roles.includes('admin') && !roles.includes('admin')) {
      const err = 'Không thể tự thu hồi vai trò quản trị của chính mình.';
      setServerError(err);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editingUser && onSubmitUpdate) {
        await onSubmitUpdate(editingUser.id, {
          name: name.trim(),
          email: normalizedEmail,
          group: group.trim() || 'Chưa phân nhóm',
          roles,
          status,
          phone: phone.trim(),
        });
      } else if (onSubmitCreate) {
        await onSubmitCreate({
          name: name.trim(),
          email: normalizedEmail,
          group: group.trim() || 'Chưa phân nhóm',
          roles,
          status,
          phone: phone.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Đã xảy ra lỗi trong quá trình lưu tài khoản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEditMode ? 'Chỉnh sửa tài khoản người dùng' : 'Thêm người dùng & Phân quyền'}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEditMode
                ? 'Cập nhật phân quyền, vai trò và địa bàn hoạt động của nhân sự.'
                : 'Cấp quyền và địa bàn cho nhân viên kinh doanh mới ngay ngày đầu nhận việc.'}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {serverError && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Cảnh báo không thể tự thu hồi vai trò quản trị của chính mình */}
            {isEditingSelf && (
              <div className={styles.lockWarning}>
                <Lock size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Lưu ý bảo mật:</strong> Bạn đang chỉnh sửa tài khoản quản trị của chính mình.
                  Hệ thống không cho phép tự thu hồi vai trò Quản trị viên để tránh tình trạng mất quyền điều hành.
                </span>
              </div>
            )}

            {/* Họ và tên */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span>
                  Họ và tên nhân sự <span className={styles.requiredStar}>*</span>
                </span>
              </label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Ví dụ: Nguyễn Văn An"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email (Kiểm tra trùng) */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span>
                  Email hệ thống <span className={styles.requiredStar}>*</span>
                </span>
              </label>
              <input
                type="email"
                className={`${styles.inputField} ${emailError ? styles.inputFieldError : ''}`}
                placeholder="Ví dụ: an.nguyen@nexuscrm.vn"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
              {emailError && (
                <span className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  {emailError}
                </span>
              )}
            </div>

            {/* Số điện thoại */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Số điện thoại liên hệ</label>
              <input
                type="tel"
                className={styles.inputField}
                placeholder="Ví dụ: 0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Nhóm / Địa bàn (Người giữ vai trò Trưởng nhóm phải được gán nhóm cụ thể) */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span>
                  Nhóm / Địa bàn phụ trách{' '}
                  {roles.includes('manager') && (
                    <span className={styles.requiredStar} title="Bắt buộc cho Trưởng nhóm">
                      * (Bắt buộc cho Trưởng nhóm)
                    </span>
                  )}
                </span>
              </label>
              <select
                className={`${styles.inputField} ${groupError ? styles.inputFieldError : ''}`}
                value={group}
                onChange={(e) => handleGroupChange(e.target.value)}
              >
                <option value="Chưa phân nhóm">-- Chọn nhóm / địa bàn --</option>
                {AVAILABLE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {groupError ? (
                <span className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  {groupError}
                </span>
              ) : roles.includes('manager') ? (
                <div className={styles.infoNote}>
                  <Info size={14} />
                  <span>Người giữ vai trò Trưởng nhóm bắt buộc phải được gán một nhóm cụ thể.</span>
                </div>
              ) : null}
            </div>

            {/* Một người dùng có thể giữ nhiều vai trò cùng lúc */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span>
                  Phân quyền vai trò <span className={styles.requiredStar}>*</span>
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  (Có thể chọn nhiều vai trò cùng lúc)
                </span>
              </label>

              <div className={styles.rolesGrid}>
                {(Object.keys(USER_ROLES_CONFIG) as UserRoleType[]).map((rKey) => {
                  const cfg = USER_ROLES_CONFIG[rKey];
                  const isChecked = roles.includes(rKey);
                  // Không thể tự thu hồi vai trò quản trị của chính mình
                  const isLockedAdmin = isEditingSelf && rKey === 'admin';

                  return (
                    <div
                      key={rKey}
                      className={`${styles.roleOption} ${isChecked ? styles.roleOptionActive : ''} ${
                        isLockedAdmin ? styles.roleOptionDisabled : ''
                      }`}
                      onClick={() => toggleRole(rKey)}
                    >
                      <input
                        type="checkbox"
                        className={styles.roleCheckbox}
                        checked={isChecked}
                        disabled={isLockedAdmin}
                        onChange={() => {}}
                        aria-label={cfg.label}
                      />
                      <div className={styles.roleText}>
                        <span className={styles.roleName}>
                          {cfg.label}
                          {isLockedAdmin && (
                            <span title="Không thể tự thu hồi quản trị của chính mình">
                              <Lock size={12} />
                            </span>
                          )}
                        </span>
                        <span className={styles.roleDesc}>{cfg.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {rolesError && (
                <span className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  {rolesError}
                </span>
              )}
            </div>

            {/* Trạng thái tài khoản */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Trạng thái tài khoản</label>
              <select
                className={styles.inputField}
                value={status}
                disabled={isEditingSelf}
                onChange={(e) => setStatus(e.target.value as UserStatusType)}
              >
                <option value="active">Đang hoạt động</option>
                <option value="pending_activation">
                  Chờ kích hoạt (Gửi email kèm mật khẩu tạm)
                </option>
                <option value="locked">Bị khóa / Tạm dừng</option>
              </select>
              {!isEditMode && status === 'pending_activation' && (
                <div className={styles.infoNote}>
                  <Info size={14} />
                  <span>
                    Khi tạo tài khoản, hệ thống sẽ sinh mật khẩu tạm ngẫu nhiên và gửi email kích hoạt đến hòm thư người dùng.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || Boolean(emailError) || Boolean(groupError)}
            >
              {isSubmitting ? (
                'Đang lưu...'
              ) : isEditMode ? (
                'Lưu thay đổi'
              ) : (
                <>
                  <Check size={16} />
                  Tạo tài khoản & Gửi email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
