import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageSquareCode,
  Phone,
  RotateCcw,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AuthProviderType, IUser } from '../../interfaces';
import {
  AUTH_STORAGE_KEYS,
  IStoredAccount,
  isValidVietnamPhone,
  normalizeVietnamPhone,
} from '../../mock/auth.mock';
import { Button, Input, Modal } from '../common';
import styles from './SocialPhoneAuthSection.module.css';

export interface ISocialPhoneAuthSectionProps {
  mode: 'login' | 'register';
  disabled?: boolean;
}

const GoogleIconSvg: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.04-4.38 3.04-7.46 0-.72-.06-1.41-.19-2.05H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.98-3.45.98-2.65 0-4.9-1.79-5.7-4.2H2.89v2.64C4.57 19.72 8.01 22 12 22z"
    />
    <path
      fill="#FBBC05"
      d="M6.3 13.75A5.99 5.99 0 0 1 5.98 12c0-.61.11-1.2.32-1.75V7.61H2.89A9.98 9.98 0 0 0 2 12c0 1.61.39 3.14 1.08 4.39l3.22-2.64z"
    />
    <path
      fill="#4285F4"
      d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.05 3.01 14.75 2 12 2 8.01 2 4.57 4.28 2.89 7.61l3.41 2.64c.8-2.41 3.05-4.2 5.7-4.2z"
    />
  </svg>
);

const LinkedInIconSvg: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
    />
  </svg>
);

const AppleIconSvg: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export const SocialPhoneAuthSection: React.FC<ISocialPhoneAuthSectionProps> = ({
  mode,
  disabled = false,
}) => {
  const { loginWithSocial, sendPhoneOtp, verifyPhoneOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeProvider, setActiveProvider] = useState<AuthProviderType | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Social form states (Google, LinkedIn, Apple)
  const [socialEmail, setSocialEmail] = useState<string>('');
  const [socialFullName, setSocialFullName] = useState<string>('');
  const [socialPassword, setSocialPassword] = useState<string>('');
  const [socialCompany, setSocialCompany] = useState<string>('');
  const [socialTitle, setSocialTitle] = useState<string>('');
  const [hideAppleEmail, setHideAppleEmail] = useState<boolean>(false);
  const [showSocialPassword, setShowSocialPassword] = useState<boolean>(false);

  // Phone OTP states
  const [phoneStep, setPhoneStep] = useState<'input_phone' | 'verify_otp'>('input_phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneFullName, setPhoneFullName] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [matchedPhoneUser, setMatchedPhoneUser] = useState<IUser | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Previously registered accounts in localStorage for quick selection
  const savedAccountsForProvider = useMemo<IStoredAccount[]>(() => {
    if (!activeProvider || activeProvider === 'phone') return [];
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as IStoredAccount[];
      return parsed.filter((item) => item.user.id.includes(`usr-${activeProvider}`));
    } catch {
      return [];
    }
  }, [activeProvider]);

  const handleOpenProvider = (provider: AuthProviderType): void => {
    setActiveProvider(provider);
    setModalError(null);
    setShowSocialPassword(false);

    if (provider === 'google') {
      setSocialEmail('');
      setSocialFullName('');
      setSocialPassword('');
    } else if (provider === 'linkedin') {
      setSocialEmail('');
      setSocialFullName('');
      setSocialPassword('');
      setSocialCompany('Nexus Cloud Enterprise');
      setSocialTitle('Giám đốc Phát triển Kinh doanh');
    } else if (provider === 'apple') {
      setSocialEmail('');
      setSocialFullName('');
      setSocialPassword('');
      setHideAppleEmail(false);
    } else if (provider === 'phone') {
      setPhoneStep('input_phone');
      setPhoneNumber('');
      setPhoneFullName('');
      setGeneratedOtp(null);
      setMatchedPhoneUser(null);
      setOtpDigits(['', '', '', '', '', '']);
    }
  };

  const handleCloseModal = (): void => {
    setActiveProvider(null);
    setModalError(null);
  };

  const handleQuickSavedAccountLogin = async (account: IStoredAccount): Promise<void> => {
    if (!activeProvider || activeProvider === 'phone') return;
    try {
      await loginWithSocial({
        provider: activeProvider,
        email: account.email,
        fullName: account.user.fullName,
        companyName: account.user.workspaceName,
        roleTitle: account.user.title,
      });
      handleCloseModal();
      navigate('/dashboard');
    } catch {
      setModalError('Không thể đăng nhập bằng tài khoản đã lưu.');
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!activeProvider || activeProvider === 'phone') return;

    const trimmedEmail = socialEmail.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setModalError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (activeProvider === 'google' && !trimmedEmail.endsWith('@gmail.com') && !trimmedEmail.includes('.')) {
      setModalError('Vui lòng nhập địa chỉ Gmail hoặc Google Workspace hợp lệ.');
      return;
    }

    const derivedName =
      socialFullName.trim() ||
      trimmedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    if (derivedName.length < 2) {
      setModalError('Vui lòng nhập họ và tên hiển thị của bạn.');
      return;
    }

    if (socialPassword.length < 6) {
      setModalError('Vui lòng nhập mật khẩu xác thực tối thiểu 6 ký tự.');
      return;
    }

    try {
      await loginWithSocial({
        provider: activeProvider,
        email: trimmedEmail,
        fullName: derivedName,
        companyName: socialCompany.trim() || undefined,
        roleTitle: socialTitle.trim() || undefined,
        hideAppleEmail: activeProvider === 'apple' ? hideAppleEmail : undefined,
      });
      handleCloseModal();
      navigate('/dashboard');
    } catch {
      setModalError('Xác thực tài khoản không thành công. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleSendOtpSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setModalError(null);

    if (!isValidVietnamPhone(phoneNumber)) {
      setModalError(
        'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam 10 chữ số (VD: 0912345678).'
      );
      return;
    }

    try {
      const res = await sendPhoneOtp(phoneNumber);
      setGeneratedOtp(res.otpCode);
      setMatchedPhoneUser(res.existingUser);
      if (res.existingUser && !phoneFullName.trim()) {
        setPhoneFullName(res.existingUser.fullName);
      }
      setOtpDigits(['', '', '', '', '', '']);
      setPhoneStep('verify_otp');
    } catch {
      setModalError('Không thể gửi mã OTP. Vui lòng kiểm tra lại định dạng số điện thoại.');
    }
  };

  const handleOtpDigitChange = (index: number, rawVal: string): void => {
    setModalError(null);
    const cleaned = rawVal.replace(/\D/g, '');
    if (!cleaned) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    // Support pasting full 6-digit OTP
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      setOtpDigits((prev) => {
        const next = [...prev];
        chars.forEach((ch, idx) => {
          if (index + idx < 6) {
            next[index + idx] = ch;
          }
        });
        return next;
      });
      const focusIdx = Math.min(index + chars.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = (): void => {
    if (!generatedOtp) return;
    setOtpDigits(generatedOtp.split(''));
    setModalError(null);
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setModalError('Vui lòng nhập đầy đủ 6 chữ số của mã OTP.');
      return;
    }

    try {
      await verifyPhoneOtp({
        phoneNumber,
        fullName:
          phoneFullName.trim() ||
          matchedPhoneUser?.fullName ||
          `Khách hàng (${normalizeVietnamPhone(phoneNumber).slice(-4)})`,
        otpCode: enteredOtp,
      });
      handleCloseModal();
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_OTP_CODE') {
        setModalError('Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại tin nhắn SMS.');
      } else {
        setModalError('Mã OTP đã hết hạn. Vui lòng bấm gửi lại mã mới.');
      }
    }
  };

  const actionVerb = mode === 'login' ? 'Đăng nhập' : 'Đăng ký';

  const getModalTitle = (): string => {
    switch (activeProvider) {
      case 'google':
        return `${actionVerb} bằng Tài khoản Google Cá nhân`;
      case 'linkedin':
        return `${actionVerb} qua Hồ sơ LinkedIn`;
      case 'apple':
        return `${actionVerb} bằng Tài khoản Apple ID`;
      case 'phone':
        return `${actionVerb} bằng Số điện thoại (SMS OTP)`;
      default:
        return '';
    }
  };

  const getModalSubtitle = (): string => {
    switch (activeProvider) {
      case 'google':
        return 'Sử dụng địa chỉ Gmail cá nhân hoặc Google Workspace để truy cập NexusCRM';
      case 'linkedin':
        return 'Đồng bộ thông tin hồ sơ chuyên gia và doanh nghiệp từ LinkedIn';
      case 'apple':
        return 'Xác thực bảo mật với Apple ID và tùy chọn ẩn địa chỉ email cá nhân';
      case 'phone':
        return 'Xác minh số điện thoại di động bằng mã bảo mật OTP 6 chữ số';
      default:
        return '';
    }
  };

  return (
    <div className={styles.socialSection}>
      <div className={styles.divider}>
        <span>HOẶC {actionVerb.toUpperCase()} BẰNG</span>
      </div>

      <div className={styles.providerGrid}>
        <button
          type="button"
          className={styles.providerBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('google')}
        >
          <span className={styles.providerBtn__icon}>
            <GoogleIconSvg />
          </span>
          <span>Google cá nhân</span>
        </button>

        <button
          type="button"
          className={styles.providerBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('linkedin')}
        >
          <span className={styles.providerBtn__icon}>
            <LinkedInIconSvg />
          </span>
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          className={styles.providerBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('phone')}
        >
          <span className={styles.providerBtn__icon} style={{ color: '#10B981' }}>
            <Phone size={17} />
          </span>
          <span>Số điện thoại</span>
        </button>

        <button
          type="button"
          className={styles.providerBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('apple')}
        >
          <span className={styles.providerBtn__icon}>
            <AppleIconSvg />
          </span>
          <span>Tài khoản Apple</span>
        </button>
      </div>

      {/* Modal Xác thực Tương tác Thực tế cho cả 4 phương thức */}
      <Modal
        isOpen={activeProvider !== null}
        onClose={handleCloseModal}
        title={getModalTitle()}
        subtitle={getModalSubtitle()}
      >
        <div className={styles.modalBody}>
          {/* Header nhận diện thương hiệu của từng phương thức */}
          {activeProvider && (
            <div className={styles.providerBanner}>
              <div className={styles.providerBanner__logo}>
                {activeProvider === 'google' && <GoogleIconSvg />}
                {activeProvider === 'linkedin' && <LinkedInIconSvg />}
                {activeProvider === 'apple' && <AppleIconSvg />}
                {activeProvider === 'phone' && <MessageSquareCode size={20} color="#10B981" />}
              </div>
              <div className={styles.providerBanner__text}>
                <strong>
                  {activeProvider === 'google' && 'Google Identity OAuth 2.0'}
                  {activeProvider === 'linkedin' && 'LinkedIn Enterprise Connect'}
                  {activeProvider === 'apple' && 'Sign in with Apple ID'}
                  {activeProvider === 'phone' && 'Cổng xác thực SMS OTP (Việt Nam +84)'}
                </strong>
                <span>
                  {activeProvider === 'phone'
                    ? 'Tự động cấp phát JWT Token sau khi xác minh đúng 6 số OTP'
                    : 'Tài khoản sẽ được lưu trữ và đăng nhập trực tiếp vào phiên làm việc'}
                </span>
              </div>
            </div>
          )}

          {modalError && (
            <div className={styles.errorBox} role="alert">
              <AlertTriangle size={16} />
              <span>{modalError}</span>
            </div>
          )}

          {/* Danh sách tài khoản đã từng đăng nhập bằng phương thức này */}
          {savedAccountsForProvider.length > 0 && (
            <div className={styles.savedAccountsBox}>
              <span className={styles.savedAccountsBox__label}>
                Tài khoản đã đăng nhập trên thiết bị này (Nhấn để vào ngay)
              </span>
              {savedAccountsForProvider.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className={styles.savedAccountBtn}
                  onClick={() => void handleQuickSavedAccountLogin(acc)}
                >
                  <div className={styles.savedAccountBtn__info}>
                    <strong>{acc.user.fullName}</strong>
                    <span>{acc.email}</span>
                  </div>
                  <span className={styles.savedAccountBtn__tag}>Đăng nhập ngay →</span>
                </button>
              ))}
            </div>
          )}

          {/* FORM CHO GOOGLE, LINKEDIN, APPLE */}
          {activeProvider && activeProvider !== 'phone' && (
            <form onSubmit={(e) => void handleSocialSubmit(e)} className={styles.formStack}>
              <Input
                label={
                  activeProvider === 'google'
                    ? 'Địa chỉ Gmail / Google cá nhân *'
                    : activeProvider === 'linkedin'
                    ? 'Email tài khoản LinkedIn *'
                    : 'Apple ID (Email iCloud) *'
                }
                type="email"
                value={socialEmail}
                onChange={(e) => {
                  setSocialEmail(e.target.value);
                  setModalError(null);
                }}
                leftIcon={<Mail size={16} />}
                placeholder={
                  activeProvider === 'google'
                    ? 'tenban@gmail.com'
                    : activeProvider === 'linkedin'
                    ? 'chuyengia@linkedin.com'
                    : 'tenban@icloud.com'
                }
                required
              />

              <Input
                label="Họ và tên hiển thị *"
                value={socialFullName}
                onChange={(e) => {
                  setSocialFullName(e.target.value);
                  setModalError(null);
                }}
                leftIcon={<User size={16} />}
                placeholder="Nhập họ và tên của bạn (VD: Lê Hoàng Nam)"
                required
              />

              {activeProvider === 'linkedin' && (
                <>
                  <Input
                    label="Công ty / Tổ chức trên LinkedIn"
                    value={socialCompany}
                    onChange={(e) => setSocialCompany(e.target.value)}
                    leftIcon={<Building2 size={16} />}
                    placeholder="VD: Tập đoàn Công nghệ FPT"
                  />
                  <Input
                    label="Chức danh chuyên môn"
                    value={socialTitle}
                    onChange={(e) => setSocialTitle(e.target.value)}
                    leftIcon={<Briefcase size={16} />}
                    placeholder="VD: Trưởng phòng Kinh doanh B2B"
                  />
                </>
              )}

              {activeProvider === 'apple' && (
                <div className={styles.applePrivacyBox}>
                  <span className={styles.applePrivacyBox__title}>
                    Tùy chọn bảo mật Email của Apple (iCloud Private Relay)
                  </span>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="appleEmailPrivacy"
                      checked={!hideAppleEmail}
                      onChange={() => setHideAppleEmail(false)}
                    />
                    <span>Chia sẻ địa chỉ Email của tôi với NexusCRM</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="appleEmailPrivacy"
                      checked={hideAppleEmail}
                      onChange={() => setHideAppleEmail(true)}
                    />
                    <span>Ẩn địa chỉ Email (Tạo email chuyển tiếp @privaterelay.appleid.com)</span>
                  </label>
                </div>
              )}

              <Input
                label={
                  activeProvider === 'google'
                    ? 'Mật khẩu tài khoản Google *'
                    : activeProvider === 'linkedin'
                    ? 'Mật khẩu LinkedIn *'
                    : 'Mật khẩu Apple ID / Passkey *'
                }
                type={showSocialPassword ? 'text' : 'password'}
                value={socialPassword}
                onChange={(e) => {
                  setSocialPassword(e.target.value);
                  setModalError(null);
                }}
                leftIcon={<Lock size={16} />}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowSocialPassword((prev) => !prev)}
                    className={styles.eyeToggleBtn}
                    aria-label={showSocialPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showSocialPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                required
              />

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={16} />}
                >
                  {activeProvider === 'google' && 'Tiếp tục với Google'}
                  {activeProvider === 'linkedin' && 'Xác thực với LinkedIn'}
                  {activeProvider === 'apple' && 'Tiếp tục với Apple ID'}
                </Button>
              </div>
            </form>
          )}

          {/* FORM CHO SỐ ĐIỆN THOẠI (BƯỚC 1: NHẬP SĐT -> BƯỚC 2: NHẬP 6 SỐ OTP) */}
          {activeProvider === 'phone' && phoneStep === 'input_phone' && (
            <form onSubmit={(e) => void handleSendOtpSubmit(e)} className={styles.formStack}>
              <Input
                label="Số điện thoại di động (Việt Nam) *"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setModalError(null);
                }}
                leftIcon={<Phone size={16} />}
                placeholder="VD: 0912345678 hoặc +84912345678"
                helperText="Hỗ trợ các đầu số 03, 05, 07, 08, 09 (10 chữ số)"
                required
              />

              <Input
                label="Họ và tên người dùng *"
                value={phoneFullName}
                onChange={(e) => {
                  setPhoneFullName(e.target.value);
                  setModalError(null);
                }}
                leftIcon={<User size={16} />}
                placeholder="Nhập họ và tên của bạn"
                required
              />

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Gửi mã xác thực OTP
                </Button>
              </div>
            </form>
          )}

          {activeProvider === 'phone' && phoneStep === 'verify_otp' && (
            <form onSubmit={(e) => void handleVerifyOtpSubmit(e)} className={styles.formStack}>
              {generatedOtp && (
                <div className={styles.smsToast} role="status" aria-live="polite">
                  <div className={styles.smsToast__content}>
                    <span className={styles.smsToast__badge}>
                      <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Tin nhắn SMS vừa gửi tới {normalizeVietnamPhone(phoneNumber)}
                    </span>
                    <span className={styles.smsToast__text}>
                      Mã OTP xác thực NexusCRM của bạn là:{' '}
                      <strong className={styles.smsToast__code}>{generatedOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.smsToast__fillBtn}
                    onClick={handleAutoFillOtp}
                  >
                    Tự động điền OTP
                  </button>
                </div>
              )}

              <div className={styles.otpDigitsRow} role="group" aria-label="Nhập 6 chữ số OTP">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={`otp-${idx}`}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={styles.otpDigitInput}
                    aria-label={`Chữ số OTP thứ ${idx + 1}`}
                  />
                ))}
              </div>

              <div className={styles.otpFooterRow}>
                <span>
                  Đang xác thực cho số: <strong>{normalizeVietnamPhone(phoneNumber)}</strong>
                </span>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => {
                    setPhoneStep('input_phone');
                    setModalError(null);
                  }}
                >
                  <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Đổi số điện thoại / Gửi lại mã
                </button>
              </div>

              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPhoneStep('input_phone');
                    setModalError(null);
                  }}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Xác nhận OTP & Đăng nhập
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
