export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const wait = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export async function requestPasswordReset(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  await wait(900);

  const email = payload.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('INVALID_EMAIL');
  }

  return {
    message:
      'Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến địa chỉ này. Vui lòng kiểm tra hộp thư.',
  };
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  await wait(1000);

  const token = payload.token.trim();
  const password = payload.password;
  const confirmPassword = payload.confirmPassword;

  if (!token) {
    throw new Error('TOKEN_INVALID');
  }

  if (token === 'expired-token') {
    throw new Error('TOKEN_EXPIRED');
  }

  if (token === 'used-token' || token === 'invalid-token') {
    throw new Error('TOKEN_INVALID');
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('PASSWORD_POLICY');
  }

  if (password !== confirmPassword) {
    throw new Error('PASSWORD_MISMATCH');
  }

  return {
    message: 'Đặt lại mật khẩu thành công.',
  };
}
