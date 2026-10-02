import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, X } from 'lucide-react';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { VerifyTokenForm } from '../components/auth/VerifyTokenForm';
import { Button, Input } from '../components/common';
import { axiosInstance, USE_REAL_BACKEND } from '../utils/axiosInstance';
import logoUrl from '../assets/logo.svg';
import styles from './LoginPage.module.css';
import formStyles from '../components/auth/LoginForm.module.css';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialMode = (): 'request' | 'verify' | 'reset' => {
    if (location.pathname === '/reset-password' || searchParams.get('token')) {
      return 'reset';
    }
    if (location.pathname === '/verify-token' || location.pathname === '/verify-reset-token') {
      return 'verify';
    }
    return 'request';
  };

  const [mode, setMode] = useState<'request' | 'verify' | 'reset'>(getInitialMode);
  const [email, setEmail] = useState(() => window.sessionStorage.getItem('nexus_crm_reset_email') || '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState<string>(() => window.sessionStorage.getItem('nexus_crm_reset_token') || '');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsSubmitting(true);
    const demoToken = '886699';
    window.sessionStorage.setItem('nexus_crm_reset_email', email.trim());
    window.sessionStorage.setItem('nexus_crm_reset_token', demoToken);

    try {
      if (USE_REAL_BACKEND) {
        await axiosInstance.post('/auth/forgot-password', {
          email: email.trim(),
        }, { timeout: 1500 });
      }
    } catch {
      // Giữ luồng hoạt động mượt mà cho frontend mock
    } finally {
      setIsSubmitting(false);
      // Hiển thị thông báo ở góc dưới bên phải
      setShowToast(true);
      // Đổi hướng đến trang nhập mã xác thực
      setMode('verify');
      navigate('/verify-token');
    }
  };

  const handleTokenVerified = (token: string): void => {
    setVerifiedToken(token);
    window.sessionStorage.setItem('nexus_crm_reset_token', token);
    setMode('reset');
    navigate('/reset-password');
  };

  const handleResendToken = (): void => {
    const demoToken = '886699';
    window.sessionStorage.setItem('nexus_crm_reset_token', demoToken);
    setShowToast(true);
  };

  const subtitleText =
    mode === 'reset'
      ? 'Đặt lại mật khẩu tài khoản'
      : mode === 'verify'
      ? 'Xác thực mã khôi phục tài khoản'
      : 'Khôi phục mật khẩu tài khoản';

  return (
    <div className={styles.authContainer}>
      <header className={styles.brandHeader}>
        <div className={styles.brandLogoRow}>
          <img src={logoUrl} alt="NexusCRM Logo" className={styles.logo} />
          <h1 className={styles.brandTitle}>NexusCRM</h1>
        </div>
        <p className={styles.brandSubtitle}>{subtitleText}</p>
      </header>

      <main className={styles.formWrapper}>
        {mode === 'reset' ? (
          <div>
            <ResetPasswordForm initialToken={verifiedToken} />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('request');
                  navigate('/forgot-password');
                }}
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
        ) : mode === 'verify' ? (
          <VerifyTokenForm
            initialEmail={email}
            onSuccess={handleTokenVerified}
            onResend={handleResendToken}
          />
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
                  const val = e.target.value;
                  setEmail(val);
                  validateEmail(val);
                }}
                error={emailError ?? undefined}
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

      {/* Thông báo góc dưới bên phải "Đã gửi mã xác thực qua email" */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.16), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
            border: '1px solid #E2E8F0',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
          role="status"
          aria-live="polite"
        >
          <div
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              marginTop: '2px',
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                Đã gửi mã xác thực qua email
              </h4>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                }}
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.45 }}>
              Mã xác thực đã được gửi đến email {email ? <strong>{email}</strong> : 'của bạn'}.
              <span style={{ display: 'block', marginTop: '3px', fontWeight: 600, color: '#2563EB' }}>
                Mã xác thực mẫu: 886699
              </span>
            </p>
          </div>
        </div>
      )}

      <footer className={styles.authFooter}>
        <span>NexusCRM Enterprise © 2026 · Hệ thống thông tin nội bộ</span>
      </footer>
    </div>
  );
};
