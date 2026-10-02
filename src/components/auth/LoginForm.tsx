import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCountdown } from '../../hooks/useCountdown';
import { ILoginPayload } from '../../interfaces';
import { AUTH_STORAGE_KEYS } from '../../mock/auth.mock';
import { Button, Input } from '../common';
import styles from './LoginForm.module.css';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60;

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    secondsLeft,
    formattedTime,
    isActive: isLockedOut,
    progressPercent,
    startCountdown,
    resetCountdown,
  } = useCountdown(LOCKOUT_DURATION_SECONDS);

  const [formState, setFormState] = useState<ILoginPayload>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    return saved ? Number(saved) : 0;
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const validateField = (name: 'email' | 'password', value: string): string | undefined => {
    if (name === 'email') {
      const trimmed = value.trim();
      if (!trimmed) return 'Vui lòng nhập địa chỉ email.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return 'Địa chỉ email không đúng định dạng.';
      return undefined;
    }

    if (!value) return 'Vui lòng nhập mật khẩu.';
    if (value.length < 8) return 'Mật khẩu phải có tối thiểu 8 ký tự.';
    return undefined;
  };

  const handleInputChange = (field: 'email' | 'password', value: string): void => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setAuthError(null);
    const errorMsg = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isLockedOut) return;

    const emailErr = validateField('email', formState.email);
    const passwordErr = validateField('password', formState.password);
    setFieldErrors({ email: emailErr, password: passwordErr });

    if (!formState.email.trim() || !formState.password) {
      setAuthError('Vui lòng nhập đủ thông tin.');
      return;
    }

    if (emailErr || passwordErr) {
      setAuthError('Vui lòng nhập đúng email/mật khẩu.');
      return;
    }

    try {
      await login(formState);
      setFailedAttempts(0);
      resetCountdown();
      navigate('/dashboard');
    } catch (err: unknown) {
      let is429 = false;
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: { status?: number; data?: { detail?: string; message?: string } };
        };
        if (axiosErr.response?.status === 429) {
          is429 = true;
        }
      }

      const nextAttempts = is429 ? MAX_ATTEMPTS : failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      window.localStorage.setItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS, String(nextAttempts));

      if (nextAttempts >= MAX_ATTEMPTS || is429) {
        startCountdown(LOCKOUT_DURATION_SECONDS);
        setAuthError(
          'Bạn đã nhập sai 5 lần. Tài khoản tạm thời bị khóa trong 15 phút và chỉ đợi đến khi hết thời gian mới có thể nhập lại.'
        );
      } else {
        setAuthError('Vui lòng nhập đúng email/mật khẩu.');
      }
    }
  };






  return (
    <motion.div
      className={styles.loginCard}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
    >
      <div className={styles.loginCard__header}>
        <h1 className={styles.loginCard__title}>Đăng nhập</h1>
        <p className={styles.loginCard__subtitle}>
          Nhập thông tin tài khoản để truy cập hệ thống NexusCRM.
        </p>
      </div>

      {isLockedOut && (
        <motion.div
          className={styles.lockoutBanner}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          role="alert"
          aria-live="polite"
        >
          <div className={styles.lockoutBanner__top}>
            <div className={styles.lockoutBanner__iconWrap}>
              <ShieldAlert size={20} />
            </div>
            <div className={styles.lockoutBanner__text}>
              <h2 className={styles.lockoutBanner__title}>
                Tài khoản tạm khóa bảo mật (15 phút)
              </h2>
              <p className={styles.lockoutBanner__desc}>
                Phát hiện 5 lần đăng nhập thất bại. Vui lòng chờ hết thời gian đếm ngược để thử lại.
              </p>
            </div>
          </div>

          <div className={styles.lockoutBanner__timerRow}>
            <div className={styles.lockoutBanner__clock}>
              <span className={styles.lockoutBanner__clockLabel}>MỞ KHÓA SAU</span>
              <strong className={`${styles.lockoutBanner__clockValue} tabular-nums`}>
                {formattedTime}
              </strong>
              <span className={styles.lockoutBanner__seconds}>({secondsLeft}s)</span>
            </div>


          </div>

          <div className={styles.lockoutBanner__progressTrack}>
            <div
              className={styles.lockoutBanner__progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>
      )}

      {!isLockedOut && authError && (
        <div className={styles.errorAlert} role="alert">
          <AlertTriangle size={16} className={styles.errorAlert__icon} />
          <span>{authError}</span>
        </div>
      )}

      <form className={styles.loginForm} onSubmit={(e) => void handleSubmit(e)} noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={formState.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={fieldErrors.email}
          disabled={isLockedOut || isLoading}
          leftIcon={<Mail size={17} />}
          placeholder="admin@nexuscrm.vn"
        />

        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          value={formState.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={fieldErrors.password}
          disabled={isLockedOut || isLoading}
          leftIcon={<Lock size={17} />}
          placeholder="••••••••••••"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.loginForm__eyeBtn}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              disabled={isLockedOut}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          }
        />

        <div className={styles.loginForm__optionsRow}>
          <label className={styles.loginForm__checkboxLabel}>
            <input
              type="checkbox"
              checked={Boolean(formState.rememberMe)}
              disabled={isLockedOut}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, rememberMe: e.target.checked }))
              }
            />
            <span>Duy trì đăng nhập 30 ngày</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLockedOut}
          rightIcon={<ArrowRight size={17} />}
        >
          {isLockedOut ? `Đang khóa (${formattedTime})` : 'Đăng nhập vào Hệ thống'}
        </Button>
      </form>

      {/* Liên kết chuyển sang trang Đăng ký (Zalo style) */}
      <div className={styles.switchAuthRow}>
        <span>Bạn chưa có tài khoản?</span>
        <Link to="/register" className={styles.switchAuthLink}>
          Đăng ký ngay!
        </Link>
      </div>
    </motion.div>
  );
};
