import React from 'react';
import { Modal } from '../common/Modal';
import { ChangePasswordForm } from '../../features/change-password/components/ChangePasswordForm';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đổi mật khẩu tài khoản"
      subtitle="Yêu cầu mật khẩu tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số."
      maxWidth="md"
    >
      <ChangePasswordForm />
    </Modal>
  );
};
