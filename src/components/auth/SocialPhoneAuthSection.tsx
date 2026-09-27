import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Phone,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import logoUrl from '../../assets/logo.svg';
import { useAuth } from '../../hooks/useAuth';
import { AuthProviderType } from '../../interfaces';
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

interface IReadyAccount {
  id: string;
  fullName: string;
  identifier: string;
  avatarUrl: string;
  companyName?: string;
  roleTitle?: string;
}

const DEFAULT_READY_ACCOUNTS: Record<AuthProviderType, ReadonlyArray<IReadyAccount>> = {
  google: [
    {
      id: 'gg-ready-1',
      fullName: 'Trần Minh Quân',
      identifier: 'minhquan.tran@gmail.com',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 1),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Quản trị viên (Google Cá nhân)',
    },
    {
      id: 'gg-ready-2',
      fullName: 'Lê Hoàng Bảo Ngọc',
      identifier: 'baongoc.le.crm@gmail.com',
      avatarUrl: createAvatarSvgDataUri('Le Hoang Bao Ngoc', 4),
      companyName: 'Nexus Cloud Vietnam',
      roleTitle: 'Giám đốc Kinh doanh (Google)',
    },
  ],
  apple: [
    {
      id: 'ap-ready-1',
      fullName: 'Trần Minh Quân',
      identifier: 'minhquan.tran@icloud.com',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 0),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Quản trị viên (Apple ID)',
    },
    {
      id: 'ap-ready-2',
      fullName: 'Phạm Gia Huy',
      identifier: 'giahuy.pham@icloud.com',
      avatarUrl: createAvatarSvgDataUri('Pham Gia Huy', 2),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Trưởng phòng Vận hành (Apple ID)',
    },
  ],
  linkedin: [
    {
      id: 'li-ready-1',
      fullName: 'Trần Minh Quân',
      identifier: 'minhquan.tran@linkedin.com',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 3),
      companyName: 'Tập đoàn Công nghệ Nexus',
      roleTitle: 'Giám đốc Phát triển Doanh thu (LinkedIn)',
    },
    {
      id: 'li-ready-2',
      fullName: 'Vũ Thu Phương',
      identifier: 'thuphuong.vu.b2b@linkedin.com',
      avatarUrl: createAvatarSvgDataUri('Vu Thu Phuong', 1),
      companyName: 'FPT Smart Cloud',
      roleTitle: 'Chuyên gia Tư vấn Giải pháp (LinkedIn)',
    },
  ],
  phone: [
    {
      id: 'ph-ready-1',
      fullName: 'Trần Minh Quân',
      identifier: '0912345678',
      avatarUrl: createAvatarSvgDataUri('Tran Minh Quan', 2),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Xác thực Số điện thoại (+84)',
    },
    {
      id: 'ph-ready-2',
      fullName: 'Đỗ Hoàng Nam',
      identifier: '0987654321',
      avatarUrl: createAvatarSvgDataUri('Do Hoang Nam', 3),
      companyName: 'NexusCRM Enterprise VN',
      roleTitle: 'Xác thực Số điện thoại (+84)',
    },
  ],
};

const GoogleIconSvg: React.FC<{ size?: number }> = ({ size = 17 }) => (
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

const LinkedInIconSvg: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
    />
  </svg>
);

const AppleIconSvg: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export const SocialPhoneAuthSection: React.FC<ISocialPhoneAuthSectionProps> = ({
  disabled = false,
}) => {
  const { loginWithSocial, sendPhoneOtp, verifyPhoneOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeProvider, setActiveProvider] = useState<AuthProviderType | null>(null);
  const [activeTab, setActiveTab] = useState<'ready' | 'custom'>('ready');
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State cho tab "Tự nhập tài khoản"
  const [customIdentifier, setCustomIdentifier] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customPasswordOrOtp, setCustomPasswordOrOtp] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [hideAppleEmail, setHideAppleEmail] = useState<boolean>(false);
  const [sentOtpCode, setSentOtpCode] = useState<string | null>(null);

  // Gộp tài khoản có sẵn và tài khoản người dùng đã từng tự nhập vào localStorage
  const readyAccounts = useMemo<IReadyAccount[]>(() => {
    if (!activeProvider) return [];
    const presets = [...DEFAULT_READY_ACCOUNTS[activeProvider]];
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return presets;

    try {
      const stored = JSON.parse(raw) as IStoredAccount[];
      const fromStorage = stored
        .filter((item) => item.user.id.includes(`usr-${activeProvider}`))
        .map((item): IReadyAccount => ({
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

      const merged = [...fromStorage];
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

  const openPopup = (provider: AuthProviderType): void => {
    setActiveProvider(provider);
    setActiveTab('ready');
    setConnectingName(null);
    setErrorMsg(null);
    setCustomIdentifier('');
    setCustomName('');
    setCustomPasswordOrOtp('');
    setShowPass(false);
    setHideAppleEmail(false);
    setSentOtpCode(null);
  };

  const closePopup = (): void => {
    if (connectingName) return;
    setActiveProvider(null);
    setErrorMsg(null);
  };

  // ẤN 1 CHẠM VÀO TÀI KHOẢN SẴN CÓ -> KẾT NỐI VÀ VÀO THẲNG LUÔN
  const handleInstantConnectAccount = async (acc: IReadyAccount): Promise<void> => {
    if (!activeProvider) return;
    setErrorMsg(null);
    setConnectingName(acc.fullName);

    try {
      if (activeProvider === 'phone') {
        const otpRes = await sendPhoneOtp(acc.identifier);
        await verifyPhoneOtp({
          phoneNumber: acc.identifier,
          fullName: acc.fullName,
          otpCode: otpRes.otpCode,
        });
      } else {
        await loginWithSocial({
          provider: activeProvider,
          email: acc.identifier,
          fullName: acc.fullName,
          companyName: acc.companyName,
          roleTitle: acc.roleTitle,
        });
      }
      setActiveProvider(null);
      setConnectingName(null);
      navigate('/dashboard');
    } catch {
      setConnectingName(null);
      setErrorMsg('Kết nối tới tài khoản bị gián đoạn. Vui lòng thử lại.');
    }
  };

  // Gửi mã OTP khi tự nhập số điện thoại mới
  const handleSendOtpForCustomPhone = async (): Promise<void> => {
    setErrorMsg(null);
    if (!isValidVietnamPhone(customIdentifier)) {
      setErrorMsg('Số điện thoại không đúng định dạng 10 số Việt Nam (đầu 03, 05, 07, 08, 09).');
      return;
    }
    try {
      const res = await sendPhoneOtp(customIdentifier);
      setSentOtpCode(res.otpCode);
      setCustomPasswordOrOtp(res.otpCode);
      if (res.existingUser && !customName.trim()) {
        setCustomName(res.existingUser.fullName);
      }
    } catch {
      setErrorMsg('Không thể gửi mã OTP tới số điện thoại này.');
    }
  };

  // TỰ NHẬP TÀI KHOẢN CỦA MÌNH -> ĐÚNG THÌ VÀO ĐƯỢC, SAI THÌ BÁO LỖI
  const handleCustomConnectSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!activeProvider) return;
    setErrorMsg(null);

    const idVal = customIdentifier.trim().toLowerCase();

    // Xử lý riêng cho Số điện thoại
    if (activeProvider === 'phone') {
      if (!isValidVietnamPhone(idVal)) {
        setErrorMsg('Lỗi: Số điện thoại phải gồm 10 chữ số hợp lệ (VD: 0912345678).');
        return;
      }
      if (!sentOtpCode) {
        setErrorMsg('Vui lòng bấm nút "Nhận OTP" trước khi xác nhận kết nối.');
        return;
      }
      if (customPasswordOrOtp.trim() !== sentOtpCode) {
        setErrorMsg('Lỗi xác thực: Mã OTP không chính xác. Vui lòng kiểm tra lại.');
        return;
      }

      setConnectingName(customName.trim() || normalizeVietnamPhone(idVal));
      try {
        await verifyPhoneOtp({
          phoneNumber: idVal,
          fullName: customName.trim() || `Tài khoản SĐT (${normalizeVietnamPhone(idVal).slice(-4)})`,
          otpCode: customPasswordOrOtp.trim(),
        });
        setActiveProvider(null);
        setConnectingName(null);
        navigate('/dashboard');
      } catch {
        setConnectingName(null);
        setErrorMsg('Lỗi kết nối: Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
      return;
    }

    // Kiểm tra định dạng Email cho Google / Apple / LinkedIn
    if (!idVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(idVal)) {
      setErrorMsg('Lỗi định dạng: Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (activeProvider === 'google' && !idVal.endsWith('@gmail.com') && !idVal.endsWith('.vn')) {
      setErrorMsg('Không tìm thấy Tài khoản Google: Vui lòng nhập địa chỉ @gmail.com.');
      return;
    }

    if (customPasswordOrOtp.length < 6) {
      setErrorMsg('Mật khẩu không chính xác (yêu cầu tối thiểu 6 ký tự).');
      return;
    }

    // Kiểm tra nếu tài khoản này đã lưu trước đó trong localStorage nhưng nhập sai mật khẩu
    const rawStored = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (rawStored) {
      try {
        const list = JSON.parse(rawStored) as IStoredAccount[];
        const existing = list.find((a) => a.email.toLowerCase() === idVal);
        if (
          existing &&
          !existing.password.startsWith('oauth_') &&
          existing.password !== customPasswordOrOtp
        ) {
          setErrorMsg('Mật khẩu không chính xác cho tài khoản này. Vui lòng thử lại.');
          return;
        }
      } catch {
        // ignore parse error
      }
    }

    const displayName =
      customName.trim() ||
      idVal
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    setConnectingName(displayName);
    try {
      await loginWithSocial({
        provider: activeProvider,
        email: idVal,
        fullName: displayName,
        hideAppleEmail: activeProvider === 'apple' ? hideAppleEmail : undefined,
      });

      // Lưu lại mật khẩu người dùng tự nhập để lần sau kiểm tra đúng mật khẩu
      const currentRaw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
      if (currentRaw) {
        const parsed = JSON.parse(currentRaw) as IStoredAccount[];
        const updated = parsed.map((item) =>
          item.email.toLowerCase() === idVal
            ? { ...item, password: customPasswordOrOtp }
            : item
        );
        window.localStorage.setItem(
          AUTH_STORAGE_KEYS.REGISTERED_USERS,
          JSON.stringify(updated)
        );
      }

      setActiveProvider(null);
      setConnectingName(null);
      navigate('/dashboard');
    } catch {
      setConnectingName(null);
      setErrorMsg('Không thể kết nối tài khoản. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const getProviderConfig = () => {
    switch (activeProvider) {
      case 'google':
        return {
          name: 'Google',
          domain: 'accounts.google.com',
          path: '/o/oauth2/v2/auth?client_id=nexuscrm',
          icon: <GoogleIconSvg size={20} />,
          inputLabel: 'Email Google (@gmail.com)',
          inputPlaceholder: 'tenban@gmail.com',
        };
      case 'apple':
        return {
          name: 'Apple ID',
          domain: 'appleid.apple.com',
          path: '/auth/authorize?client_id=vn.nexuscrm',
          icon: <AppleIconSvg size={20} />,
          inputLabel: 'Apple ID (iCloud Email)',
          inputPlaceholder: 'tenban@icloud.com',
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          domain: 'www.linkedin.com',
          path: '/oauth/v2/authorization?client_id=nexuscrm',
          icon: <LinkedInIconSvg size={20} />,
          inputLabel: 'Email LinkedIn',
          inputPlaceholder: 'tenban@linkedin.com',
        };
      case 'phone':
      default:
        return {
          name: 'Số điện thoại',
          domain: 'id.nexuscrm.vn',
          path: '/oauth/phone-connect?region=VN',
          icon: <Phone size={19} color="#81C995" />,
          inputLabel: 'Số điện thoại (10 số)',
          inputPlaceholder: '0912345678',
        };
    }
  };

  const cfg = getProviderConfig();

  return (
    <div className={styles.socialSection}>
      <div className={styles.divider}>
        <span>HOẶC TIẾP TỤC NHANH VỚI</span>
      </div>

      {/* Bố cục 2x2 ngang gọn gàng như các nền tảng SaaS hiện đại */}
      <div className={styles.compactGrid}>
        <button
          type="button"
          className={styles.compactProviderBtn}
          disabled={disabled || isLoading}
          onClick={() => openPopup('google')}
        >
          <span className={styles.compactProviderBtn__icon}>
            <GoogleIconSvg />
          </span>
          <span>Google</span>
        </button>

        <button
          type="button"
          className={styles.compactProviderBtn}
          disabled={disabled || isLoading}
          onClick={() => openPopup('apple')}
        >
          <span className={styles.compactProviderBtn__icon}>
            <AppleIconSvg />
          </span>
          <span>Apple</span>
        </button>

        <button
          type="button"
          className={styles.compactProviderBtn}
          disabled={disabled || isLoading}
          onClick={() => openPopup('linkedin')}
        >
          <span className={styles.compactProviderBtn__icon}>
            <LinkedInIconSvg />
          </span>
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          className={styles.compactProviderBtn}
          disabled={disabled || isLoading}
          onClick={() => openPopup('phone')}
        >
          <span className={styles.compactProviderBtn__icon} style={{ color: '#10B981' }}>
            <Phone size={16} strokeWidth={2.2} />
          </span>
          <span>Số điện thoại</span>
        </button>
      </div>

      {/* Cửa sổ kết nối OAuth gọn nhẹ: Ấn tài khoản sẵn có là vào thẳng, hoặc tự nhập tài khoản */}
      <AnimatePresence>
        {activeProvider !== null && (
          <div
            className={styles.popupOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={`Kết nối ${cfg.name}`}
          >
            <motion.div
              className={styles.popupWindow}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.16 }}
            >
              {connectingName && <div className={styles.connectingBar} />}

              {/* Thanh URL gọn gàng trên đỉnh */}
              <div className={styles.browserBar}>
                <div className={styles.browserBar__url}>
                  <Lock size={12} />
                  <span>
                    https://<span className={styles.browserBar__domain}>{cfg.domain}</span>
                    {cfg.path}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.browserBar__close}
                  onClick={closePopup}
                  aria-label="Đóng cửa sổ kết nối"
                >
                  <X size={15} />
                </button>
              </div>

              <div className={styles.popupContent}>
                {/* Header ngang gọn */}
                <div className={styles.popupHeader}>
                  <div className={styles.popupHeader__left}>
                    <div className={styles.popupHeader__badge}>{cfg.icon}</div>
                    <div className={styles.popupHeader__titles}>
                      <h2 className={styles.popupHeader__title}>
                        Kết nối tài khoản {cfg.name}
                      </h2>
                      <p className={styles.popupHeader__subtitle}>
                        Tiếp tục tới <strong>NexusCRM</strong>
                      </p>
                    </div>
                  </div>
                  <img
                    src={logoUrl}
                    alt="NexusCRM"
                    className={styles.popupHeader__appLogo}
                  />
                </div>

                {/* Thanh chuyển chế độ ngang gọn: Chọn sẵn có vs Tự nhập */}
                <div className={styles.modeTabs}>
                  <button
                    type="button"
                    className={`${styles.modeTab} ${
                      activeTab === 'ready' ? styles['modeTab--active'] : ''
                    }`}
                    onClick={() => {
                      setActiveTab('ready');
                      setErrorMsg(null);
                    }}
                  >
                    <UserCheck size={14} />
                    <span>Tài khoản sẵn có ({readyAccounts.length})</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeTab} ${
                      activeTab === 'custom' ? styles['modeTab--active'] : ''
                    }`}
                    onClick={() => {
                      setActiveTab('custom');
                      setErrorMsg(null);
                    }}
                  >
                    <UserPlus size={14} />
                    <span>Tự nhập tài khoản</span>
                  </button>
                </div>

                {connectingName && (
                  <div className={styles.connectingBanner}>
                    <span>Đang kết nối với tài khoản {connectingName}...</span>
                  </div>
                )}

                {errorMsg && (
                  <div className={styles.errorBanner} role="alert">
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* TAB 1: ẤN VÀO TÀI KHOẢN SẴN CÓ LÀ VÀO THẲNG LUÔN */}
                {activeTab === 'ready' && (
                  <div className={styles.accountCardsList}>
                    {readyAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        className={styles.accountRowBtn}
                        disabled={Boolean(connectingName)}
                        onClick={() => void handleInstantConnectAccount(acc)}
                      >
                        <div className={styles.accountRowBtn__left}>
                          <span className={styles.accountRowBtn__avatar}>
                            <img src={acc.avatarUrl} alt={acc.fullName} />
                          </span>
                          <div className={styles.accountRowBtn__info}>
                            <span className={styles.accountRowBtn__name}>
                              {acc.fullName}
                            </span>
                            <span className={styles.accountRowBtn__sub}>
                              {acc.identifier}
                            </span>
                          </div>
                        </div>
                        <span className={styles.accountRowBtn__badge}>Kết nối ngay →</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* TAB 2: TỰ NHẬP TÀI KHOẢN CỦA MÌNH (GỌN 2 CỘT NGANG, KIỂM TRA ĐÚNG/LỖI) */}
                {activeTab === 'custom' && (
                  <form
                    onSubmit={(e) => void handleCustomConnectSubmit(e)}
                    className={styles.compactForm}
                    noValidate
                  >
                    <div className={styles.formRow2}>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="custom-oauth-id">{cfg.inputLabel} *</label>
                        <input
                          id="custom-oauth-id"
                          type={activeProvider === 'phone' ? 'tel' : 'email'}
                          className={styles.compactInput}
                          value={customIdentifier}
                          onChange={(e) => {
                            setCustomIdentifier(e.target.value);
                            setErrorMsg(null);
                          }}
                          placeholder={cfg.inputPlaceholder}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label htmlFor="custom-oauth-name">Họ và tên hiển thị</label>
                        <input
                          id="custom-oauth-name"
                          type="text"
                          className={styles.compactInput}
                          value={customName}
                          onChange={(e) => {
                            setCustomName(e.target.value);
                            setErrorMsg(null);
                          }}
                          placeholder="VD: Nguyễn Minh Khôi"
                        />
                      </div>
                    </div>

                    {activeProvider !== 'phone' ? (
                      <div className={styles.fieldGroup}>
                        <label htmlFor="custom-oauth-pass">
                          Mật khẩu {cfg.name} (Tối thiểu 6 ký tự) *
                        </label>
                        <div className={styles.inputWrap}>
                          <input
                            id="custom-oauth-pass"
                            type={showPass ? 'text' : 'password'}
                            className={styles.compactInput}
                            value={customPasswordOrOtp}
                            onChange={(e) => {
                              setCustomPasswordOrOtp(e.target.value);
                              setErrorMsg(null);
                            }}
                            placeholder="Nhập mật khẩu để kết nối"
                          />
                          <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPass((p) => !p)}
                            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {sentOtpCode && (
                          <div className={styles.inlineOtpBox}>
                            <span>
                              <CheckCircle2
                                size={13}
                                style={{ display: 'inline', marginRight: 4, color: '#81C995' }}
                              />
                              Mã SMS OTP vừa gửi: <strong>{sentOtpCode}</strong>
                            </span>
                            <span>(Đã tự điền)</span>
                          </div>
                        )}
                        <div className={styles.fieldGroup}>
                          <label htmlFor="custom-phone-otp">Mã xác thực OTP (6 chữ số) *</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              id="custom-phone-otp"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              className={styles.compactInput}
                              value={customPasswordOrOtp}
                              onChange={(e) => {
                                setCustomPasswordOrOtp(e.target.value.replace(/\D/g, ''));
                                setErrorMsg(null);
                              }}
                              placeholder="Nhập 6 số OTP"
                            />
                            <button
                              type="button"
                              className={styles.otpSendBtn}
                              onClick={() => void handleSendOtpForCustomPhone()}
                            >
                              {sentOtpCode ? 'Gửi lại OTP' : 'Nhận mã OTP'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {activeProvider === 'apple' && (
                      <label className={styles.appleRelayToggle}>
                        <input
                          type="checkbox"
                          checked={hideAppleEmail}
                          onChange={(e) => setHideAppleEmail(e.target.checked)}
                        />
                        <span>Ẩn địa chỉ Email của tôi (@privaterelay.appleid.com)</span>
                      </label>
                    )}

                    <div className={styles.formFooter}>
                      <button
                        type="submit"
                        className={styles.submitConnectBtn}
                        disabled={isLoading || Boolean(connectingName)}
                      >
                        <span>Kết nối & Truy cập NexusCRM</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                )}

                <p className={styles.footerNote}>
                  {activeTab === 'ready'
                    ? 'Nhấn trực tiếp vào tài khoản sẵn có ở trên để đăng nhập tức thì vào hệ thống.'
                    : 'Tài khoản bạn tự nhập sẽ được lưu lại vào danh sách Tài khoản sẵn có cho lần sau.'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
