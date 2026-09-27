import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Minus,
  Phone,
  Square,
  UserPlus,
  X,
} from 'lucide-react';
import logoUrl from '../../assets/logo.svg';
import { useAuth } from '../../hooks/useAuth';
import { AuthProviderType, IUser } from '../../interfaces';
import {
  AUTH_STORAGE_KEYS,
  IStoredAccount,
  isValidVietnamPhone,
  normalizeVietnamPhone,
} from '../../mock/auth.mock';
import { createAvatarSvgDataUri } from '../../utils/formatters';
import styles from './SocialPhoneAuthSection.module.css';

export interface ISocialPhoneAuthSectionProps {
  mode: 'login' | 'register';
  disabled?: boolean;
}

interface IOAuthChooserAccount {
  id: string;
  fullName: string;
  identifier: string;
  avatarUrl: string;
  companyName?: string;
  roleTitle?: string;
}

const DEFAULT_PROVIDER_ACCOUNTS: Record<AuthProviderType, ReadonlyArray<IOAuthChooserAccount>> = {
  google: [
    {
      id: 'gg-preset-1',
      fullName: 'Trần Minh Quân',
      identifier: 'minhquan.tran@gmail.com',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 1),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Quản trị viên (Tài khoản Google)',
    },
    {
      id: 'gg-preset-2',
      fullName: 'Lê Hoàng Bảo Ngọc',
      identifier: 'baongoc.le.crm@gmail.com',
      avatarUrl: createAvatarSvgDataUri('Le Hoang Bao Ngoc', 4),
      companyName: 'Nexus Cloud Vietnam',
      roleTitle: 'Giám đốc Kinh doanh (Google)',
    },
  ],
  apple: [
    {
      id: 'ap-preset-1',
      fullName: 'Trần Minh Quân',
      identifier: 'minhquan.tran@icloud.com',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 0),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Quản trị viên (Apple ID)',
    },
    {
      id: 'ap-preset-2',
      fullName: 'Phạm Gia Huy',
      identifier: 'giahuy.pham@icloud.com',
      avatarUrl: createAvatarSvgDataUri('Pham Gia Huy', 2),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Trưởng phòng Vận hành (Apple ID)',
    },
  ],
  linkedin: [
    {
      id: 'li-preset-1',
      fullName: 'Trần Minh Quân',
      identifier: 'minhquan.tran@linkedin.com',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 3),
      companyName: 'Tập đoàn Công nghệ Nexus',
      roleTitle: 'Giám đốc Phát triển Doanh thu (LinkedIn)',
    },
    {
      id: 'li-preset-2',
      fullName: 'Vũ Thu Phương',
      identifier: 'thuphuong.vu.b2b@linkedin.com',
      avatarUrl: createAvatarSvgDataUri('Vu Thu Phuong', 1),
      companyName: 'FPT Smart Cloud',
      roleTitle: 'Chuyên gia Tư vấn Giải pháp (LinkedIn)',
    },
  ],
  phone: [
    {
      id: 'ph-preset-1',
      fullName: 'Trần Minh Quân',
      identifier: '0912345678',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 2),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Xác thực Số điện thoại (+84)',
    },
    {
      id: 'ph-preset-2',
      fullName: 'Đỗ Hoàng Nam',
      identifier: '0987654321',
      avatarUrl: createAvatarSvgDataUri('Do Hoang Nam', 3),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Xác thực Số điện thoại (+84)',
    },
  ],
};

const GoogleIconSvg: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
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

const LinkedInIconSvg: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
    />
  </svg>
);

const AppleIconSvg: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

type ChooserStep = 'chooser' | 'confirm_account' | 'custom_form' | 'phone_otp';

export const SocialPhoneAuthSection: React.FC<ISocialPhoneAuthSectionProps> = ({
  disabled = false,
}) => {
  const { loginWithSocial, sendPhoneOtp, verifyPhoneOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeProvider, setActiveProvider] = useState<AuthProviderType | null>(null);
  const [step, setStep] = useState<ChooserStep>('chooser');
  const [selectedAccount, setSelectedAccount] = useState<IOAuthChooserAccount | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Custom Account Form States
  const [customEmailOrPhone, setCustomEmailOrPhone] = useState<string>('');
  const [customFullName, setCustomFullName] = useState<string>('');
  const [customPassword, setCustomPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [hideAppleEmail, setHideAppleEmail] = useState<boolean>(false);

  // Phone OTP States
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [matchedPhoneUser, setMatchedPhoneUser] = useState<IUser | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Merge preset accounts with any accounts the user previously registered in localStorage
  const chooserAccounts = useMemo<IOAuthChooserAccount[]>(() => {
    if (!activeProvider) return [];
    const presets = [...DEFAULT_PROVIDER_ACCOUNTS[activeProvider]];
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return presets;

    try {
      const stored = JSON.parse(raw) as IStoredAccount[];
      const providerStored = stored
        .filter((item) => item.user.id.includes(`usr-${activeProvider}`))
        .map((item): IOAuthChooserAccount => ({
          id: item.user.id,
          fullName: item.user.fullName,
          identifier:
            activeProvider === 'phone'
              ? item.email.replace('@phone.nexuscrm.vn', '')
              : item.email,
          avatarUrl: item.user.avatarUrl,
          companyName: item.user.workspaceName,
          roleTitle: item.user.title,
        }));

      const merged = [...providerStored];
      presets.forEach((p) => {
        if (!merged.some((m) => m.identifier.toLowerCase() === p.identifier.toLowerCase())) {
          merged.push(p);
        }
      });
      return merged;
    } catch {
      return presets;
    }
  }, [activeProvider]);

  const handleOpenProvider = (provider: AuthProviderType): void => {
    setActiveProvider(provider);
    setStep('chooser');
    setSelectedAccount(null);
    setModalError(null);
    setCustomEmailOrPhone('');
    setCustomFullName('');
    setCustomPassword('');
    setShowPassword(false);
    setHideAppleEmail(false);
    setGeneratedOtp(null);
    setOtpDigits(['', '', '', '', '', '']);
  };

  const handleClose = (): void => {
    setActiveProvider(null);
    setModalError(null);
  };

  // Clicking an account row in "Chọn tài khoản"
  const handleSelectAccountFromList = async (account: IOAuthChooserAccount): Promise<void> => {
    setSelectedAccount(account);
    setModalError(null);

    if (activeProvider === 'phone') {
      // Send OTP to this selected phone number and go to OTP confirmation
      try {
        const res = await sendPhoneOtp(account.identifier);
        setCustomEmailOrPhone(account.identifier);
        setCustomFullName(account.fullName);
        setGeneratedOtp(res.otpCode);
        setMatchedPhoneUser(res.existingUser);
        setOtpDigits(res.otpCode.split(''));
        setStep('phone_otp');
      } catch {
        setModalError('Không thể gửi mã xác thực tới số điện thoại này.');
      }
      return;
    }

    setStep('confirm_account');
  };

  // Confirm connecting the chosen Google / LinkedIn / Apple account
  const handleConfirmChosenAccount = async (): Promise<void> => {
    if (!activeProvider || activeProvider === 'phone' || !selectedAccount) return;
    try {
      await loginWithSocial({
        provider: activeProvider,
        email: selectedAccount.identifier,
        fullName: selectedAccount.fullName,
        companyName: selectedAccount.companyName,
        roleTitle: selectedAccount.roleTitle,
        hideAppleEmail: activeProvider === 'apple' ? hideAppleEmail : undefined,
      });
      handleClose();
      navigate('/dashboard');
    } catch {
      setModalError('Không thể kết nối tài khoản. Vui lòng thử lại.');
    }
  };

  // Submitting "Sử dụng một tài khoản khác"
  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!activeProvider) return;
    setModalError(null);

    if (activeProvider === 'phone') {
      if (!isValidVietnamPhone(customEmailOrPhone)) {
        setModalError('Vui lòng nhập số điện thoại di động Việt Nam 10 chữ số (VD: 0912345678).');
        return;
      }
      if (customFullName.trim().length < 2) {
        setModalError('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      try {
        const res = await sendPhoneOtp(customEmailOrPhone);
        setGeneratedOtp(res.otpCode);
        setMatchedPhoneUser(res.existingUser);
        setOtpDigits(['', '', '', '', '', '']);
        setStep('phone_otp');
      } catch {
        setModalError('Không thể gửi mã OTP. Vui lòng kiểm tra lại số điện thoại.');
      }
      return;
    }

    const trimmedEmail = customEmailOrPhone.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setModalError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    const derivedName =
      customFullName.trim() ||
      trimmedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    if (customPassword.length < 6) {
      setModalError('Mật khẩu xác thực phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      await loginWithSocial({
        provider: activeProvider,
        email: trimmedEmail,
        fullName: derivedName,
        hideAppleEmail: activeProvider === 'apple' ? hideAppleEmail : undefined,
      });
      handleClose();
      navigate('/dashboard');
    } catch {
      setModalError('Không thể xác thực tài khoản. Vui lòng kiểm tra lại.');
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

  const handleVerifyPhoneOtpSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setModalError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    try {
      await verifyPhoneOtp({
        phoneNumber: customEmailOrPhone,
        fullName:
          customFullName.trim() ||
          matchedPhoneUser?.fullName ||
          `Người dùng (${normalizeVietnamPhone(customEmailOrPhone).slice(-4)})`,
        otpCode: enteredOtp,
      });
      handleClose();
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_OTP_CODE') {
        setModalError('Mã OTP không chính xác. Vui lòng kiểm tra lại.');
      } else {
        setModalError('Mã OTP đã hết hạn. Vui lòng thử lại.');
      }
    }
  };

  const getWindowMeta = () => {
    switch (activeProvider) {
      case 'google':
        return {
          windowTitle: 'Đăng nhập - Tài khoản Google - Cá nhân',
          domain: 'accounts.google.com',
          path: '/v3/signin/accountchooser?client_id=nexuscrm.vn&flowName=GeneralOAuthFlow',
          subheader: 'Đăng nhập bằng Google',
          icon: <GoogleIconSvg size={16} />,
        };
      case 'apple':
        return {
          windowTitle: 'Đăng nhập bằng Apple ID - Cá nhân',
          domain: 'appleid.apple.com',
          path: '/auth/authorize?client_id=vn.nexuscrm.enterprise&response_type=code',
          subheader: 'Đăng nhập bằng Apple',
          icon: <AppleIconSvg size={16} />,
        };
      case 'linkedin':
        return {
          windowTitle: 'Đăng nhập LinkedIn - Kết nối Doanh nghiệp',
          domain: 'www.linkedin.com',
          path: '/oauth/v2/authorization?client_id=nexuscrm_b2b&scope=openid+profile+email',
          subheader: 'Đăng nhập bằng LinkedIn',
          icon: <LinkedInIconSvg size={16} />,
        };
      case 'phone':
      default:
        return {
          windowTitle: 'Xác thực Số điện thoại - Cổng định danh cá nhân',
          domain: 'id.nexuscrm.vn',
          path: '/v3/signin/phonechooser?region=VN&channel=sms_otp',
          subheader: 'Đăng nhập bằng Số điện thoại',
          icon: <Phone size={15} color="#81C995" />,
        };
    }
  };

  const meta = getWindowMeta();

  return (
    <div className={styles.socialSection}>
      <div className={styles.divider}>
        <span>HOẶC TIẾP TỤC VỚI</span>
      </div>

      {/* 4 nút hình viên thuốc (Pill Buttons) giống hệt Bức ảnh số 2 */}
      <div className={styles.pillStack}>
        <button
          type="button"
          className={styles.pillBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('phone')}
        >
          <span className={styles.pillBtn__icon}>
            <Phone size={18} strokeWidth={2.1} />
          </span>
          <span>Tiếp tục với số điện thoại</span>
        </button>

        <button
          type="button"
          className={styles.pillBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('google')}
        >
          <span className={styles.pillBtn__icon}>
            <GoogleIconSvg size={19} />
          </span>
          <span>Tiếp tục với Google</span>
        </button>

        <button
          type="button"
          className={styles.pillBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('apple')}
        >
          <span className={styles.pillBtn__icon}>
            <AppleIconSvg size={19} />
          </span>
          <span>Tiếp tục với Apple</span>
        </button>

        <button
          type="button"
          className={styles.pillBtn}
          disabled={disabled || isLoading}
          onClick={() => handleOpenProvider('linkedin')}
        >
          <span className={styles.pillBtn__icon}>
            <LinkedInIconSvg size={19} />
          </span>
          <span>Tiếp tục với LinkedIn</span>
        </button>
      </div>

      {/* Cửa sổ Popup kết nối tài khoản giống hệt Bức ảnh số 1 */}
      <AnimatePresence>
        {activeProvider !== null && (
          <div
            className={styles.oauthOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={meta.windowTitle}
          >
            <motion.div
              className={styles.oauthWindow}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Thanh tiêu đề cửa sổ trình duyệt */}
              <div className={styles.windowTitleBar}>
                <div className={styles.windowTitleBar__left}>
                  {meta.icon}
                  <span className={styles.windowTitleBar__title}>{meta.windowTitle}</span>
                </div>
                <div className={styles.windowTitleBar__controls}>
                  <button
                    type="button"
                    className={styles.windowControlBtn}
                    onClick={handleClose}
                    aria-label="Thu nhỏ"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.windowControlBtn}
                    aria-label="Phóng to"
                  >
                    <Square size={12} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.windowControlBtn} ${styles['windowControlBtn--close']}`}
                    onClick={handleClose}
                    aria-label="Đóng cửa sổ"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Thanh địa chỉ URL có ổ khóa bảo mật */}
              <div className={styles.windowUrlBar}>
                <Lock size={13} className={styles.windowUrlBar__lock} />
                <div className={styles.windowUrlBar__url}>
                  https://<span className={styles.windowUrlBar__domain}>{meta.domain}</span>
                  {meta.path}
                </div>
              </div>

              {/* Thanh Subheader ("G Đăng nhập bằng Google") */}
              <div className={styles.oauthSubheader}>
                {meta.icon}
                <span>{meta.subheader}</span>
              </div>

              {/* Nội dung chính của cửa sổ kết nối */}
              <div className={styles.oauthBody}>
                <div className={styles.appLogoBadge}>
                  <img src={logoUrl} alt="NexusCRM" />
                </div>

                {/* BƯỚC 1: MÀN HÌNH "CHỌN TÀI KHOẢN" GIỐNG HỆT ẢNH 1 */}
                {step === 'chooser' && (
                  <>
                    <div className={styles.chooserHeader}>
                      <h2 className={styles.chooserTitle}>Chọn tài khoản</h2>
                      <p className={styles.chooserSubtitle}>
                        Tiếp tục tới{' '}
                        <span className={styles.chooserSubtitle__app}>NexusCRM</span>
                      </p>
                    </div>

                    {modalError && (
                      <div className={styles.oauthError} role="alert">
                        <AlertTriangle size={15} />
                        <span>{modalError}</span>
                      </div>
                    )}

                    <div className={styles.accountList}>
                      {chooserAccounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          className={styles.accountItem}
                          onClick={() => void handleSelectAccountFromList(acc)}
                        >
                          <span className={styles.accountItem__avatar}>
                            <img src={acc.avatarUrl} alt={acc.fullName} />
                          </span>
                          <div className={styles.accountItem__details}>
                            <span className={styles.accountItem__name}>{acc.fullName}</span>
                            <span className={styles.accountItem__email}>
                              {acc.identifier}
                            </span>
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        className={styles.accountItem}
                        onClick={() => {
                          setModalError(null);
                          setStep('custom_form');
                        }}
                      >
                        <span className={styles.accountItem__anotherIcon}>
                          <UserPlus size={20} />
                        </span>
                        <div className={styles.accountItem__details}>
                          <span className={styles.accountItem__name}>
                            {activeProvider === 'phone'
                              ? 'Sử dụng một số điện thoại khác'
                              : 'Sử dụng một tài khoản khác'}
                          </span>
                        </div>
                      </button>
                    </div>

                    <p className={styles.consentText}>
                      Để tiếp tục, {meta.domain} sẽ chia sẻ tên, địa chỉ email và ảnh hồ sơ của
                      bạn với <span>NexusCRM</span>.
                    </p>
                  </>
                )}

                {/* BƯỚC 2A: XÁC NHẬN KẾT NỐI TÀI KHOẢN ĐÃ CHỌN */}
                {step === 'confirm_account' && selectedAccount && (
                  <>
                    <div className={styles.chooserHeader}>
                      <h2 className={styles.chooserTitle}>
                        Đăng nhập vào NexusCRM
                      </h2>
                      <div className={styles.selectedAccountPill}>
                        <span
                          className={styles.accountItem__avatar}
                          style={{ width: 24, height: 24 }}
                        >
                          <img
                            src={selectedAccount.avatarUrl}
                            alt={selectedAccount.fullName}
                          />
                        </span>
                        <span>{selectedAccount.identifier}</span>
                      </div>
                    </div>

                    {activeProvider === 'apple' && (
                      <div className={styles.appleRelayOptions}>
                        <label className={styles.appleRelayLabel}>
                          <input
                            type="radio"
                            name="appleRelay"
                            checked={!hideAppleEmail}
                            onChange={() => setHideAppleEmail(false)}
                          />
                          <span>Chia sẻ Email của tôi ({selectedAccount.identifier})</span>
                        </label>
                        <label className={styles.appleRelayLabel}>
                          <input
                            type="radio"
                            name="appleRelay"
                            checked={hideAppleEmail}
                            onChange={() => setHideAppleEmail(true)}
                          />
                          <span>Ẩn địa chỉ Email (@privaterelay.appleid.com)</span>
                        </label>
                      </div>
                    )}

                    <p className={styles.consentText}>
                      Bằng cách bấm <strong>Tiếp tục</strong>, bạn cho phép{' '}
                      <span>NexusCRM</span> kết nối với tài khoản{' '}
                      <strong>{selectedAccount.fullName}</strong> để khởi tạo phiên làm việc.
                    </p>

                    <div className={styles.oauthActions}>
                      <button
                        type="button"
                        className={styles.oauthCancelBtn}
                        onClick={() => setStep('chooser')}
                      >
                        Đổi tài khoản
                      </button>
                      <button
                        type="button"
                        className={styles.oauthPrimaryBtn}
                        disabled={isLoading}
                        onClick={() => void handleConfirmChosenAccount()}
                      >
                        {isLoading ? 'Đang kết nối...' : `Tiếp tục dưới tên ${selectedAccount.fullName}`}
                      </button>
                    </div>
                  </>
                )}

                {/* BƯỚC 2B: NHẬP TÀI KHOẢN KHÁC / SỐ ĐIỆN THOẠI KHÁC */}
                {step === 'custom_form' && (
                  <form
                    onSubmit={(e) => void handleCustomSubmit(e)}
                    className={styles.oauthForm}
                  >
                    <div className={styles.chooserHeader}>
                      <h2 className={styles.chooserTitle}>
                        {activeProvider === 'phone'
                          ? 'Nhập số điện thoại'
                          : 'Sử dụng tài khoản khác'}
                      </h2>
                      <p className={styles.chooserSubtitle}>
                        Tiếp tục tới{' '}
                        <span className={styles.chooserSubtitle__app}>NexusCRM</span>
                      </p>
                    </div>

                    {modalError && (
                      <div className={styles.oauthError} role="alert">
                        <AlertTriangle size={15} />
                        <span>{modalError}</span>
                      </div>
                    )}

                    <div className={styles.oauthField}>
                      <label htmlFor="oauth-identifier">
                        {activeProvider === 'phone'
                          ? 'Số điện thoại di động Việt Nam (10 số)'
                          : activeProvider === 'google'
                          ? 'Địa chỉ Gmail của bạn'
                          : activeProvider === 'apple'
                          ? 'Apple ID (Email iCloud)'
                          : 'Email LinkedIn của bạn'}
                      </label>
                      <input
                        id="oauth-identifier"
                        type={activeProvider === 'phone' ? 'tel' : 'email'}
                        className={styles.oauthInput}
                        value={customEmailOrPhone}
                        onChange={(e) => {
                          setCustomEmailOrPhone(e.target.value);
                          setModalError(null);
                        }}
                        placeholder={
                          activeProvider === 'phone'
                            ? '0912345678'
                            : activeProvider === 'google'
                            ? 'tenban@gmail.com'
                            : activeProvider === 'apple'
                            ? 'tenban@icloud.com'
                            : 'tenban@linkedin.com'
                        }
                        required
                      />
                    </div>

                    <div className={styles.oauthField}>
                      <label htmlFor="oauth-fullname">Họ và tên hiển thị</label>
                      <input
                        id="oauth-fullname"
                        type="text"
                        className={styles.oauthInput}
                        value={customFullName}
                        onChange={(e) => {
                          setCustomFullName(e.target.value);
                          setModalError(null);
                        }}
                        placeholder="Nhập họ và tên của bạn"
                        required
                      />
                    </div>

                    {activeProvider !== 'phone' && (
                      <div className={styles.oauthField}>
                        <label htmlFor="oauth-password">Mật khẩu xác thực</label>
                        <div className={styles.oauthInputWrap}>
                          <input
                            id="oauth-password"
                            type={showPassword ? 'text' : 'password'}
                            className={styles.oauthInput}
                            value={customPassword}
                            onChange={(e) => {
                              setCustomPassword(e.target.value);
                              setModalError(null);
                            }}
                            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                            required
                          />
                          <button
                            type="button"
                            className={styles.oauthEyeBtn}
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={styles.oauthActions}>
                      <button
                        type="button"
                        className={styles.oauthCancelBtn}
                        onClick={() => {
                          setModalError(null);
                          setStep('chooser');
                        }}
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className={styles.oauthPrimaryBtn}
                        disabled={isLoading}
                      >
                        {isLoading
                          ? 'Đang xử lý...'
                          : activeProvider === 'phone'
                          ? 'Nhận mã OTP'
                          : 'Tiếp theo'}
                      </button>
                    </div>
                  </form>
                )}

                {/* BƯỚC 2C: XÁC THỰC MÃ SMS OTP CHO SỐ ĐIỆN THOẠI */}
                {step === 'phone_otp' && (
                  <form
                    onSubmit={(e) => void handleVerifyPhoneOtpSubmit(e)}
                    className={styles.oauthForm}
                  >
                    <div className={styles.chooserHeader}>
                      <h2 className={styles.chooserTitle}>Xác minh số điện thoại</h2>
                      <p className={styles.chooserSubtitle}>
                        Nhập mã 6 chữ số vừa gửi tới{' '}
                        <span className={styles.chooserSubtitle__app}>
                          {normalizeVietnamPhone(customEmailOrPhone)}
                        </span>
                      </p>
                    </div>

                    {modalError && (
                      <div className={styles.oauthError} role="alert">
                        <AlertTriangle size={15} />
                        <span>{modalError}</span>
                      </div>
                    )}

                    {generatedOtp && (
                      <div className={styles.smsBanner}>
                        <div className={styles.smsBanner__info}>
                          <span className={styles.smsBanner__tag}>
                            <CheckCircle2
                              size={12}
                              style={{ display: 'inline', marginRight: 4 }}
                            />
                            Tin nhắn SMS OTP
                          </span>
                          <span>
                            Mã xác thực NexusCRM:{' '}
                            <strong className={styles.smsBanner__code}>
                              {generatedOtp}
                            </strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.smsBanner__autoBtn}
                          onClick={() => {
                            setOtpDigits(generatedOtp.split(''));
                            setModalError(null);
                          }}
                        >
                          Điền nhanh
                        </button>
                      </div>
                    )}

                    <div className={styles.otpRow}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={`otp-cell-${idx}`}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={styles.otpCell}
                          aria-label={`Số OTP thứ ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className={styles.oauthActions}>
                      <button
                        type="button"
                        className={styles.oauthCancelBtn}
                        onClick={() => {
                          setModalError(null);
                          setStep('chooser');
                        }}
                      >
                        Chọn số khác
                      </button>
                      <button
                        type="submit"
                        className={styles.oauthPrimaryBtn}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Đang kết nối...' : 'Xác nhận & Kết nối'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
