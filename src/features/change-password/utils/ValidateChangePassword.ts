import {
  ChangePasswordFieldErrors,
  ChangePasswordFormValues,
} from '../types/ChangePassword.types';

export function validateChangePassword(
  values: ChangePasswordFormValues
): ChangePasswordFieldErrors {
  const errors: ChangePasswordFieldErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  }

  if (!values.newPassword) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  } else {
    if (values.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
    } else if (
      !/\p{L}/u.test(values.newPassword) ||
      !/[0-9]/.test(values.newPassword) ||
      !/[^A-Za-z0-9]/.test(values.newPassword)
    ) {
      errors.newPassword =
        'Mật khẩu mới phải bao gồm cả chữ cái, chữ số và ký tự đặc biệt.';
    }
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }

  return errors;
}