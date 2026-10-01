import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input } from '../../../components/common';
import {
  ResetPasswordFormValues,
  resetPassword,
} from './forgotPassword.service';
import styles from './ResetPasswordPage.module.css';

function getPasswordError(value: string): string | undefined {
  if (!value) {
    return 'Vui lòng nhập mật khẩu mới.';
  }

  if (value.length < 8) {
    return 'Mật khẩu phải có tối thiểu 8 ký tự.';
  }

  if (!/[A-Za-z]/.test(value)) {
    return 'Mật khẩu phải có ít nhất 1 chữ.';
  }

  if (!/\d/.test(value)) {
    return 'Mật khẩu phải có ít nhất 1 số.';
  }

  return undefined;
}

function getResetErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'TOKEN_EXPIRED':
      return 'Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu một liên kết mới.';
    case 'TOKEN_INVALID':
    case 'TOKEN_USED':
      return 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.';
    case 'PASSWORD_POLICY':
      return 'Mật khẩu phải có tối thiểu 8 ký tự, có ít nhất 1 chữ và 1 số.';
    case 'PASSWORD_MISMATCH':
      return 'Mật khẩu xác nhận không khớp.';
    default:
      return 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.';
  }
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [formValues, setFormValues] = useState<ResetPasswordFormValues>({
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<{ password: boolean; confirmPassword: boolean }>({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (!token) {
      setSubmitError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.');
    }
  }, [token]);

  const handleChange = (field: keyof ResetPasswordFormValues, value: string): void => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setSubmitError(null);

    if (field === 'password') {
      const nextError = getPasswordError(value);
      setFieldErrors((previous) => ({ ...previous, password: nextError }));
      if (formValues.confirmPassword && value !== formValues.confirmPassword) {
        setFieldErrors((previous) => ({ ...previous, confirmPassword: 'Mật khẩu xác nhận không khớp.' }));
      } else {
        setFieldErrors((previous) => ({ ...previous, confirmPassword: undefined }));
      }
      return;
    }

    const confirmPasswordError =
      value && value !== formValues.password ? 'Mật khẩu xác nhận không khớp.' : undefined;
    setFieldErrors((previous) => ({ ...previous, confirmPassword: confirmPasswordError }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!token) {
      setSubmitError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.');
      return;
    }

    const passwordError = getPasswordError(formValues.password);
    const confirmPasswordError =
      !formValues.confirmPassword
        ? 'Vui lòng xác nhận mật khẩu mới.'
        : formValues.password !== formValues.confirmPassword
          ? 'Mật khẩu xác nhận không khớp.'
          : undefined;

    setFieldErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (passwordError || confirmPasswordError) {
      return;
    }

    setSubmitError(null);
    setIsLoading(true);

    try {
      await resetPassword({
        token,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
      });
      setIsSuccess(true);
      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      setSubmitError(getResetErrorMessage(message));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className={styles.page}>
        <section className={styles.card} aria-live="polite">
          <div className={styles.header}>
            <span className={styles.badge}>
              <CheckCircle2 size={14} />
              Thành công
            </span>
            <h1 className={styles.title}>Đặt lại mật khẩu thành công</h1>
            <p className={styles.subtitle}>Bạn sẽ được chuyển về trang đăng nhập ngay sau đó.</p>
          </div>

          <div className={styles.successBox} role="status">
            <CheckCircle2 size={22} className={styles.successBox__icon} />
            <p>Đặt lại mật khẩu thành công.</p>
          </div>

          <Link to="/login" className={styles.backLink}>
            Đến trang đăng nhập
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>
            <KeyRound size={14} />
            Thiết lập mới
          </span>
          <h1 className={styles.title}>Tạo mật khẩu mới</h1>
          <p className={styles.subtitle}>
            Mật khẩu phải có ít nhất 8 ký tự, chứa chữ và số.
          </p>
        </div>

        {submitError && (
          <div className={styles.errorAlert} role="alert">
            {submitError}
          </div>
        )}

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
          <Input
            label="Mật khẩu mới"
            type={showPassword.password ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            value={formValues.password}
            onChange={(event) => handleChange('password', event.target.value)}
            error={fieldErrors.password}
            leftIcon={<Lock size={17} />}
            placeholder="••••••••"
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() =>
                  setShowPassword((previous) => ({
                    ...previous,
                    password: !previous.password,
                  }))
                }
                aria-label={showPassword.password ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword.password ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type={showPassword.confirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            autoComplete="new-password"
            value={formValues.confirmPassword}
            onChange={(event) => handleChange('confirmPassword', event.target.value)}
            error={fieldErrors.confirmPassword}
            leftIcon={<Lock size={17} />}
            placeholder="••••••••"
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() =>
                  setShowPassword((previous) => ({
                    ...previous,
                    confirmPassword: !previous.confirmPassword,
                  }))
                }
                aria-label={showPassword.confirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
              >
                {showPassword.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            Đặt lại mật khẩu
          </Button>
        </form>

        <Link to="/login" className={styles.backLink}>
          Quay lại đăng nhập
        </Link>
      </section>
    </main>
  );
};
