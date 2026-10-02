import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { Button, Input } from '../components/common';
import { axiosInstance } from '../utils/axiosInstance';
import logoUrl from '../assets/logo.svg';
import styles from './LoginPage.module.css';
import formStyles from '../components/auth/LoginForm.module.css';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('token') ? 'reset' : 'request';

  const [mode, setMode] = useState<'request' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError('Vui lòng nhập địa chỉ email.');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setEmailError('Địa chỉ email không đúng định dạng.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const isEmailValid = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post('/auth/forgot-password', {
        email: email.trim(),
      });
    } catch {
      // Anti-enumeration: still proceed
    } finally {
      setIsSubmitting(false);
      // Ngay lập tức nhảy qua trang đặt lại mật khẩu mới luôn
      setMode('reset');
    }
  };

  return (
    <div className={styles.authContainer}>
      <header className={styles.brandHeader}>
        <div className={styles.brandLogoRow}>
          <img src={logoUrl} alt="NexusCRM Logo" className={styles.logo} />
          <h1 className={styles.brandTitle}>NexusCRM</h1>
        </div>
        <p className={styles.brandSubtitle}>
          {mode === 'reset' ? 'Đặt lại mật khẩu tài khoản' : 'Khôi phục mật khẩu tài khoản'}
        </p>
      </header>

      <main className={styles.formWrapper}>
        {mode === 'reset' ? (
          <div>
            <ResetPasswordForm />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setMode('request')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'underline',
                }}
              >
                Gửi lại yêu cầu qua email
              </button>
            </div>
          </div>
        ) : (
          <div className={formStyles.loginCard}>
            <div className={formStyles.loginCard__header}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  padding: '4px 10px',
                  background: 'var(--color-primary-soft)',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '4px',
                }}
              >
                <KeyRound size={13} />
                <span>QUÊN MẬT KHẨU</span>
              </div>
              <h2 className={formStyles.loginCard__title}>Khôi phục mật khẩu</h2>
              <p className={formStyles.loginCard__subtitle}>
                Nhập địa chỉ email để nhận mã xác thực đặt lại mật khẩu cho tài khoản.
              </p>
            </div>

            <form
              onSubmit={(e) => void handleRequestSubmit(e)}
              noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                error={emailError ?? undefined}
                isValid={isEmailValid}
                leftIcon={<Mail size={16} />}
                placeholder="admin@nexuscrm.vn"
                disabled={isSubmitting}
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
              >
                Gửi mã xác thực qua Email
              </Button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <ArrowLeft size={14} />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className={styles.authFooter}>
        <span>NexusCRM Enterprise © 2026 · Hệ thống thông tin nội bộ</span>
      </footer>
    </div>
  );
};
