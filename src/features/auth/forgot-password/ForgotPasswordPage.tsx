import React, { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../../components/common';
import {
  ForgotPasswordFormValues,
  requestPasswordReset,
} from './forgotPassword.service';
import styles from './ForgotPasswordPage.module.css';

const SUCCESS_MESSAGE =
  'Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến địa chỉ này. Vui lòng kiểm tra hộp thư.';

function validateEmail(value: string): string | undefined {
  const trimmedEmail = value.trim();

  if (!trimmedEmail) {
    return 'Vui lòng nhập địa chỉ email.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return 'Địa chỉ email không đúng định dạng.';
  }

  return undefined;
}

export const ForgotPasswordPage: React.FC = () => {
  const [formValues, setFormValues] = useState<ForgotPasswordFormValues>({
    email: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleChange = (field: keyof ForgotPasswordFormValues, value: string): void => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setSubmitError(null);

    const nextError = validateEmail(value);
    setFieldErrors((previous) => ({ ...previous, [field]: nextError }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const emailError = validateEmail(formValues.email);
    setFieldErrors({ email: emailError });

    if (emailError) {
      return;
    }

    setSubmitError(null);
    setIsLoading(true);

    try {
      await requestPasswordReset({ email: formValues.email.trim() });
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setSubmitError(
        message === 'INVALID_EMAIL'
          ? 'Địa chỉ email không đúng định dạng.'
          : 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      );
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
              <ShieldCheck size={14} />
              Đặt lại mật khẩu
            </span>
            <h1 className={styles.title}>Yêu cầu đã được gửi</h1>
          </div>

          <div className={styles.successBox} role="status">
            <ShieldCheck size={22} className={styles.successBox__icon} />
            <p>{SUCCESS_MESSAGE}</p>
          </div>

          <Link to="/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            Quay lại đăng nhập
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
            <Mail size={14} />
            Bảo mật tài khoản
          </span>
          <h1 className={styles.title}>Quên mật khẩu</h1>
          <p className={styles.subtitle}>
            Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu mới.
          </p>
        </div>

        {submitError && (
          <div className={styles.errorAlert} role="alert">
            {submitError}
          </div>
        )}

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={formValues.email}
            onChange={(event) => handleChange('email', event.target.value)}
            error={fieldErrors.email}
            leftIcon={<Mail size={17} />}
            placeholder="name@company.com"
            disabled={isLoading}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            Gửi liên kết đặt lại
          </Button>
        </form>

        <Link to="/login" className={styles.backLink}>
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </section>
    </main>
  );
};
