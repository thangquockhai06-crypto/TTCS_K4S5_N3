import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Lock, ArrowLeft, AlertTriangle } from 'lucide-react';
import { IResetPasswordRequest } from '../../interfaces';
import { axiosInstance } from '../../utils/axiosInstance';
import { Button, Input } from '../common';
import styles from './LoginForm.module.css';

interface ResetPasswordFormProps {
  initialToken?: string;
  onSuccess?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ initialToken, onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = initialToken || searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateToken = (val: string): string | undefined => {
    if (!val.trim()) return 'Mã xác thực (Token) không được để trống.';
    return undefined;
  };

  const validatePassword = (pass: string): string | undefined => {
    if (!pass) return 'Vui lòng nhập mật khẩu mới.';
    if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) {
      return 'Mật khẩu phải tối thiểu 8 ký tự, gồm chữ cái, chữ số và ký tự đặc biệt.';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirm: string, pass: string): string | undefined => {
    if (!confirm) return 'Vui lòng xác nhận lại mật khẩu.';
    if (confirm !== pass) return 'Mật khẩu xác nhận không khớp.';
    return undefined;
  };

  const handleTokenChange = (val: string): void => {
    setToken(val);
    setServerError(null);
    setFieldErrors((prev) => ({ ...prev, token: validateToken(val) }));
  };

  const handlePasswordChange = (val: string): void => {
    setNewPassword(val);
    setServerError(null);
    setFieldErrors((prev) => ({
      ...prev,
      newPassword: validatePassword(val),
      confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword, val) : prev.confirmPassword,
    }));
  };

  const handleConfirmChange = (val: string): void => {
    setConfirmPassword(val);
    setServerError(null);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(val, newPassword),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setServerError(null);

    const tokenErr = validateToken(token);
    const passErr = validatePassword(newPassword);
    const confirmErr = validateConfirmPassword(confirmPassword, newPassword);

    const errors: typeof fieldErrors = {
      token: tokenErr,
      newPassword: passErr,
      confirmPassword: confirmErr,
    };
    setFieldErrors(errors);

    if (!token.trim() || !newPassword || !confirmPassword) {
      setServerError('Vui lòng nhập đủ thông tin.');
      return;
    }

    if (tokenErr || passErr || confirmErr) {
      setServerError('Vui lòng nhập đúng mã xác thực/mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: IResetPasswordRequest = {
        token: token.trim(),
        newPassword,
      };
      await axiosInstance.post('/auth/reset-password', payload);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setServerError('Vui lòng nhập đúng mã xác thực/mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.loginCard} style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--color-success-soft)', borderRadius: '50%', color: 'var(--color-success)', marginBottom: '16px' }}>
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Đặt lại mật khẩu thành công!</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Mật khẩu tài khoản của bạn đã được cập nhật thành công. Vui lòng sử dụng mật khẩu mới để đăng nhập.
        </p>
        <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.loginCard}>
      <div className={styles.loginCard__header}>
        <h1 className={styles.loginCard__title}>Đặt lại mật khẩu mới</h1>
        <p className={styles.loginCard__subtitle}>
          Nhập mã xác thực gửi qua email và tạo mật khẩu mới an toàn cho tài khoản của bạn.
        </p>
      </div>

      {serverError && (
        <div className={styles.errorAlert} role="alert">
          <AlertTriangle size={16} className={styles.errorAlert__icon} />
          <span>{serverError}</span>
        </div>
      )}

      <form className={styles.loginForm} onSubmit={(e) => void handleSubmit(e)} noValidate>
        <Input
          label="Mã xác thực (Reset Token)"
          type="text"
          value={token}
          onChange={(e) => handleTokenChange(e.target.value)}
          error={fieldErrors.token}
          placeholder="Nhập mã token từ email..."
          disabled={isSubmitting}
        />

        <Input
          label="Mật khẩu mới"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={fieldErrors.newPassword}
          leftIcon={<Lock size={16} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className={styles.loginForm__eyeBtn}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          }
          placeholder="Tối thiểu 8 ký tự"
          disabled={isSubmitting}
        />

        <Input
          label="Xác nhận mật khẩu mới"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => handleConfirmChange(e.target.value)}
          error={fieldErrors.confirmPassword}
          leftIcon={<Lock size={16} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className={styles.loginForm__eyeBtn}
            >
              {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          }
          placeholder="Nhập lại mật khẩu mới"
          disabled={isSubmitting}
        />

        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Xác nhận đặt lại mật khẩu
          </Button>

          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              padding: '6px',
            }}
          >
            <ArrowLeft size={15} />
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};
