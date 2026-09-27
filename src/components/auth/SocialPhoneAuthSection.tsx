import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Phone, UserPlus, X } from 'lucide-react';
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

/**
 * Cấu trúc Payload chuẩn của Mã thông báo nhận dạng JWT (JWT ID Token)
 * Theo đúng Bước 2 & Bước 6 của Google Codelab:
 * https://codelabs.developers.google.com/codelabs/sign-in-with-google-button?hl=vi
 */
export interface IOidcIdTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  nbf: number;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface ICredentialResponse {
  credential: string;
  select_by: 'btn' | 'user' | 'fedcm';
  provider: AuthProviderType;
}

/**
 * Hàm decodeJWT chuyển đổi mã thông báo nhận dạng JWT sang JSON thuần túy
 * (Đúng theo mẫu mã trong Bước 2 của Google Sign-In Codelab)
 */
export function decodeJWT(token: string): IOidcIdTokenPayload {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload) as IOidcIdTokenPayload;
}

/**
 * Hàm mã hóa UTF-8 sang Base64URL để tạo JWT ID Token chuẩn OIDC
 */
function encodeBase64Url(str: string): string {
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (_, p1: string) => String.fromCharCode(parseInt(p1, 16))
  );
  return btoa(utf8Bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Tạo JWT ID Token chuẩn OpenID Connect giống hệt phản hồi từ Google Identity Services (Bước 6 Codelab)
 */
function createOidcIdToken(params: {
  provider: AuthProviderType;
  sub: string;
  email: string;
  name: string;
  picture: string;
}): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const issuerMap: Record<AuthProviderType, string> = {
    google: 'https://accounts.google.com',
    apple: 'https://appleid.apple.com',
    linkedin: 'https://www.linkedin.com/oauth',
    phone: 'https://id.nexuscrm.vn/phone',
  };

  const header = {
    alg: 'RS256',
    kid: 'c7e04465649ffa606557650c7e65f0a87ae00fe8',
    typ: 'JWT',
  };

  const nameParts = params.name.trim().split(/\s+/);
  const givenName = nameParts.length > 1 ? nameParts.slice(-1)[0] : params.name;
  const familyName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const payload: IOidcIdTokenPayload = {
    iss: issuerMap[params.provider],
    azp: '721724668570-nexuscrm.apps.googleusercontent.com',
    aud: '721724668570-nexuscrm.apps.googleusercontent.com',
    sub: params.sub,
    email: params.email,
    email_verified: true,
    nbf: nowSec - 300,
    name: params.name,
    picture: params.picture,
    given_name: givenName,
    family_name: familyName,
    iat: nowSec,
    exp: nowSec + 3600,
    jti: `jti_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = encodeBase64Url(`sig_${params.provider}_${params.sub}_${nowSec}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

interface IOAuthAccountItem {
  sub: string;
  name: string;
  identifier: string;
  picture: string;
  consented: boolean;
}

const INITIAL_PROVIDER_ACCOUNTS: Record<AuthProviderType, ReadonlyArray<IOAuthAccountItem>> = {
  google: [
    {
      sub: '1082718281828459045',
      name: 'Trần Minh Quân',
      identifier: 'minhquan.tran@gmail.com',
      picture: createAvatarSvgDataUri('Tran Minh Quan', 1),
      consented: true,
    },
    {
      sub: '1094827163549201842',
      name: 'Lê Hoàng Bảo Ngọc',
      identifier: 'baongoc.le.crm@gmail.com',
      picture: createAvatarSvgDataUri('Le Hoang Bao Ngoc', 4),
      consented: false,
    },
  ],
  apple: [
    {
      sub: '001428.9a8b7c6d5e4f.2026',
      name: 'Trần Minh Quân',
      identifier: 'minhquan.tran@icloud.com',
      picture: createAvatarSvgDataUri('Tran Minh Quan', 0),
      consented: true,
    },
  ],
  linkedin: [
    {
      sub: 'li_member_98412045',
      name: 'Trần Minh Quân',
      identifier: 'minhquan.tran@linkedin.com',
      picture: createAvatarSvgDataUri('Tran Minh Quan', 3),
      consented: true,
    },
  ],
  phone: [
    {
      sub: 'vn_phone_0912345678',
      name: 'Trần Minh Quân',
      identifier: '0912345678',
      picture: createAvatarSvgDataUri('Tran Minh Quan', 2),
      consented: true,
    },
  ],
};

const GoogleLogoSvg: React.FC<{ size?: number }> = ({ size = 18 }) => (
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

const AppleLogoSvg: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const LinkedInLogoSvg: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
    />
  </svg>
);

/**
 * Các bước tuần tự chuẩn của luồng xác thực Google Identity Services / OAuth 2.0 (Bước 5 Codelab):
 * 1. account_chooser : Chọn tài khoản đang đăng nhập hoặc bấm "Sử dụng một tài khoản khác"
 * 2. enter_identifier: Nhập Email hoặc Số điện thoại -> Bấm "Tiếp theo"
 * 3. enter_secret    : Nhập Mật khẩu (hoặc mã OTP 6 số cho SĐT) -> Bấm "Tiếp theo"
 * 4. consent_prompt  : Lời nhắc đồng ý chia sẻ thông tin nếu đăng nhập lần đầu -> Phản hồi JWT ID Token
 */
type OAuthFlowStage =
  | 'account_chooser'
  | 'enter_identifier'
  | 'enter_secret'
  | 'consent_prompt';

export const SocialPhoneAuthSection: React.FC<ISocialPhoneAuthSectionProps> = ({
  mode,
  disabled = false,
}) => {
  const { loginWithSocial, sendPhoneOtp, verifyPhoneOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeProvider, setActiveProvider] = useState<AuthProviderType | null>(null);
  const [stage, setStage] = useState<OAuthFlowStage>('account_chooser');
  const [isProcessingJwt, setIsProcessingJwt] = useState<boolean>(false);
  const [selectedAcc, setSelectedAcc] = useState<IOAuthAccountItem | null>(null);

  // State cho bước "Sử dụng một tài khoản khác" (Tuần tự: Nhập Email/SĐT -> Nhập Mật khẩu/OTP)
  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [secretInput, setSecretInput] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [smsOtpGenerated, setSmsOtpGenerated] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Nạp thư viện nền tảng Google Identity Services (https://accounts.google.com/gsi/client) như Bước 2 Codelab
  useEffect(() => {
    const scriptId = 'google-gsi-client-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Danh sách tài khoản hiển thị trong "Chọn tài khoản"
  const accountChooserList = useMemo<IOAuthAccountItem[]>(() => {
    if (!activeProvider) return [];
    const defaults = [...INITIAL_PROVIDER_ACCOUNTS[activeProvider]];
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return defaults;

    try {
      const stored = JSON.parse(raw) as IStoredAccount[];
      const fromStorage = stored
        .filter((item) => item.user.id.includes(`usr-${activeProvider}`))
        .map((item): IOAuthAccountItem => ({
          sub: item.user.id,
          name: item.user.fullName,
          identifier:
            activeProvider === 'phone'
              ? item.email.replace('@phone.nexuscrm.vn', '')
              : item.email,
          picture: item.user.avatarUrl,
          consented: true,
        }));

      const combined = [...fromStorage];
      defaults.forEach((d) => {
        if (!combined.some((c) => c.identifier.toLowerCase() === d.identifier.toLowerCase())) {
          combined.push(d);
        }
      });
      return combined;
    } catch {
      return defaults;
    }
  }, [activeProvider]);

  /**
   * Hàm callback handleCredentialResponse nhận mã thông báo JWT ID từ nhà cung cấp,
   * giải mã bằng decodeJWT và đăng nhập phiên người dùng (Đúng theo Bước 2 & Bước 5 Codelab)
   */
  const handleCredentialResponse = async (response: ICredentialResponse): Promise<void> => {
    setIsProcessingJwt(true);
    try {
      const responsePayload = decodeJWT(response.credential);

      // Ghi nhật ký JWT và các trường đã giải mã vào Bảng điều khiển (giống hệt Bước 2 & 6 Codelab)
      console.info('Encoded JWT ID token: ' + response.credential);
      console.info('Decoded JWT ID token fields:', {
        fullName: responsePayload.name,
        givenName: responsePayload.given_name,
        familyName: responsePayload.family_name,
        uniqueSubId: responsePayload.sub,
        profilePicture: responsePayload.picture,
        email: responsePayload.email,
        issuer: responsePayload.iss,
      });

      if (response.provider === 'phone') {
        const phoneNum = responsePayload.email.replace('@phone.nexuscrm.vn', '');
        const otpRes = await sendPhoneOtp(phoneNum);
        await verifyPhoneOtp({
          phoneNumber: phoneNum,
          fullName: responsePayload.name,
          otpCode: otpRes.otpCode,
        });
      } else {
        await loginWithSocial({
          provider: response.provider,
          email: responsePayload.email,
          fullName: responsePayload.name,
        });
      }

      setActiveProvider(null);
      setIsProcessingJwt(false);
      navigate('/dashboard');
    } catch {
      setIsProcessingJwt(false);
      setFieldError('Không thể xác minh mã thông báo nhận dạng JWT.');
    }
  };

  const handleStartOAuth = (provider: AuthProviderType): void => {
    setActiveProvider(provider);
    setStage('account_chooser');
    setSelectedAcc(null);
    setIdentifierInput('');
    setNameInput('');
    setSecretInput('');
    setShowSecret(false);
    setSmsOtpGenerated(null);
    setFieldError(null);
  };

  const handleCloseOAuth = (): void => {
    if (isProcessingJwt) return;
    setActiveProvider(null);
    setFieldError(null);
  };

  /**
   * Bước 5 Codelab:
   * - Khi chọn một tài khoản đã cấp quyền (consented = true) -> Phát hành ngay JWT ID Token & vào thẳng.
   * - Khi chọn tài khoản đăng nhập lần đầu (consented = false) -> Hiện lời nhắc đồng ý (consent_prompt).
   */
  const handleChooseAccount = async (account: IOAuthAccountItem): Promise<void> => {
    if (!activeProvider) return;
    setSelectedAcc(account);
    setFieldError(null);

    if (account.consented) {
      const emailClaim =
        activeProvider === 'phone'
          ? `${normalizeVietnamPhone(account.identifier)}@phone.nexuscrm.vn`
          : account.identifier;

      const jwtToken = createOidcIdToken({
        provider: activeProvider,
        sub: account.sub,
        email: emailClaim,
        name: account.name,
        picture: account.picture,
      });

      await handleCredentialResponse({
        credential: jwtToken,
        select_by: 'user',
        provider: activeProvider,
      });
    } else {
      setStage('consent_prompt');
    }
  };

  /**
   * Bước 1 của "Sử dụng một tài khoản khác": Kiểm tra Email / Số điện thoại rồi bấm "Tiếp theo"
   */
  const handleIdentifierNext = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!activeProvider) return;
    setFieldError(null);

    const raw = identifierInput.trim();
    if (!raw) {
      setFieldError(
        activeProvider === 'phone'
          ? 'Hãy nhập số điện thoại di động của bạn.'
          : 'Hãy nhập một địa chỉ email hợp lệ.'
      );
      return;
    }

    if (activeProvider === 'phone') {
      if (!isValidVietnamPhone(raw)) {
        setFieldError('Số điện thoại không hợp lệ (gồm 10 chữ số, đầu 03, 05, 07, 08, 09).');
        return;
      }
      try {
        const res = await sendPhoneOtp(raw);
        setSmsOtpGenerated(res.otpCode);
        setSecretInput('');
        if (res.existingUser) {
          setNameInput(res.existingUser.fullName);
        }
        setStage('enter_secret');
      } catch {
        setFieldError('Không thể gửi mã xác minh SMS tới số điện thoại này.');
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(raw)) {
      setFieldError('Không tìm thấy tài khoản của bạn. Hãy kiểm tra lại định dạng email.');
      return;
    }

    if (activeProvider === 'google' && !raw.toLowerCase().endsWith('@gmail.com') && !raw.includes('.')) {
      setFieldError('Không tìm thấy Tài khoản Google của bạn.');
      return;
    }

    // Tự động nhận diện tên nếu tài khoản đã từng lưu trong localStorage
    const storedRaw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
    if (storedRaw) {
      try {
        const list = JSON.parse(storedRaw) as IStoredAccount[];
        const found = list.find((a) => a.email.toLowerCase() === raw.toLowerCase());
        if (found) {
          setNameInput(found.user.fullName);
        }
      } catch {
        // ignore
      }
    }

    setStage('enter_secret');
  };

  /**
   * Bước 2 của "Sử dụng một tài khoản khác": Xác minh Mật khẩu hoặc Mã OTP -> Chuyển sang Lời nhắc đồng ý
   */
  const handleSecretNext = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!activeProvider) return;
    setFieldError(null);

    const cleanId = identifierInput.trim().toLowerCase();

    if (activeProvider === 'phone') {
      if (!smsOtpGenerated || secretInput.trim() !== smsOtpGenerated) {
        setFieldError('Mã xác minh OTP không chính xác. Hãy kiểm tra lại tin nhắn SMS.');
        return;
      }
    } else {
      if (secretInput.length < 6) {
        setFieldError('Mật khẩu không chính xác. Hãy thử lại (tối thiểu 6 ký tự).');
        return;
      }

      // Nếu tài khoản đã lưu trước đó, kiểm tra khớp mật khẩu
      const storedRaw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
      if (storedRaw) {
        try {
          const list = JSON.parse(storedRaw) as IStoredAccount[];
          const existing = list.find((a) => a.email.toLowerCase() === cleanId);
          if (
            existing &&
            !existing.password.startsWith('oauth_') &&
            existing.password !== secretInput
          ) {
            setFieldError('Mật khẩu không chính xác. Hãy thử lại hoặc chọn Quên mật khẩu.');
            return;
          }
        } catch {
          // ignore
        }
      }
    }

    const resolvedName =
      nameInput.trim() ||
      (activeProvider === 'phone'
        ? `Người dùng (${normalizeVietnamPhone(cleanId).slice(-4)})`
        : cleanId
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()));

    const newAcc: IOAuthAccountItem = {
      sub: `sub_${activeProvider}_${Date.now()}`,
      name: resolvedName,
      identifier: activeProvider === 'phone' ? normalizeVietnamPhone(cleanId) : cleanId,
      picture: createAvatarSvgDataUri(resolvedName, 1),
      consented: false,
    };

    setSelectedAcc(newAcc);
    setStage('consent_prompt');
  };

  /**
   * Bước 3: Người dùng nhấn "Tiếp tục" trên lời nhắc đồng ý (Consent Prompt) -> Nhận JWT ID Token
   */
  const handleConsentContinue = async (): Promise<void> => {
    if (!activeProvider || !selectedAcc) return;

    const emailClaim =
      activeProvider === 'phone'
        ? `${normalizeVietnamPhone(selectedAcc.identifier)}@phone.nexuscrm.vn`
        : selectedAcc.identifier;

    const jwtToken = createOidcIdToken({
      provider: activeProvider,
      sub: selectedAcc.sub,
      email: emailClaim,
      name: selectedAcc.name,
      picture: selectedAcc.picture,
    });

    await handleCredentialResponse({
      credential: jwtToken,
      select_by: 'btn',
      provider: activeProvider,
    });
  };

  // Tuỳ chỉnh văn bản nút theo Bước 7 của Google Codelab (signin_with vs signup_with)
  const verbPrefix = mode === 'register' ? 'Đăng ký bằng' : 'Đăng nhập bằng';
  const isSignupBlue = mode === 'register';

  const getProviderHeaderInfo = () => {
    switch (activeProvider) {
      case 'google':
        return {
          title: 'Đăng nhập bằng Google',
          icon: <GoogleLogoSvg size={18} />,
          inputLabel: 'Email hoặc số điện thoại Google',
          placeholder: 'tenban@gmail.com',
        };
      case 'apple':
        return {
          title: 'Đăng nhập bằng Tài khoản Apple',
          icon: <AppleLogoSvg size={18} />,
          inputLabel: 'Apple ID (Email iCloud)',
          placeholder: 'tenban@icloud.com',
        };
      case 'linkedin':
        return {
          title: 'Đăng nhập bằng LinkedIn',
          icon: <LinkedInLogoSvg size={18} />,
          inputLabel: 'Email đăng nhập LinkedIn',
          placeholder: 'tenban@linkedin.com',
        };
      case 'phone':
      default:
        return {
          title: 'Xác thực bằng Số điện thoại',
          icon: <Phone size={17} color="#81C995" />,
          inputLabel: 'Số điện thoại di động (Việt Nam)',
          placeholder: '0912345678',
        };
    }
  };

  const providerInfo = getProviderHeaderInfo();

  return (
    <div className={styles.gsiSection}>
      {/* Phần tử cấu hình g_id_onload theo chuẩn Google Identity Services (Bước 2 Codelab) */}
      <div
        id="g_id_onload"
        data-auto_prompt="false"
        data-client_id="721724668570-nexuscrm.apps.googleusercontent.com"
        style={{ display: 'none' }}
      />

      <div className={styles.divider}>
        <span>HOẶC {mode === 'register' ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'} VỚI</span>
      </div>

      {/* Lưới 2x2 nút bấm chuẩn Google Codelab Bước 7 (Hỗ trợ theme outline ở Login và filled_blue ở Register) */}
      <div className={styles.gsiGrid}>
        <button
          type="button"
          className={`${styles.gsiButton} ${
            isSignupBlue ? styles['gsiButton--filledBlue'] : ''
          }`}
          disabled={disabled || isLoading}
          onClick={() => handleStartOAuth('google')}
        >
          <span className={styles.gsiButton__iconWrap}>
            <GoogleLogoSvg size={16} />
          </span>
          <span className={styles.gsiButton__label}>{verbPrefix} Google</span>
        </button>

        <button
          type="button"
          className={styles.gsiButton}
          disabled={disabled || isLoading}
          onClick={() => handleStartOAuth('apple')}
        >
          <span className={styles.gsiButton__iconWrap}>
            <AppleLogoSvg size={17} />
          </span>
          <span className={styles.gsiButton__label}>{verbPrefix} Apple</span>
        </button>

        <button
          type="button"
          className={styles.gsiButton}
          disabled={disabled || isLoading}
          onClick={() => handleStartOAuth('linkedin')}
        >
          <span className={styles.gsiButton__iconWrap}>
            <LinkedInLogoSvg size={17} />
          </span>
          <span className={styles.gsiButton__label}>{verbPrefix} LinkedIn</span>
        </button>

        <button
          type="button"
          className={styles.gsiButton}
          disabled={disabled || isLoading}
          onClick={() => handleStartOAuth('phone')}
        >
          <span className={styles.gsiButton__iconWrap} style={{ color: '#059669' }}>
            <Phone size={16} />
          </span>
          <span className={styles.gsiButton__label}>{verbPrefix} SĐT</span>
        </button>
      </div>

      {/* Hộp thoại Xác thực OAuth 2.0 & Phản hồi JWT ID Token (Đúng theo Bước 5 & 6 Codelab) */}
      <AnimatePresence>
        {activeProvider !== null && (
          <div
            className={styles.oauthBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label={providerInfo.title}
          >
            <motion.div
              className={styles.oauthDialog}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.16 }}
            >
              {isProcessingJwt && (
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} />
                </div>
              )}

              <div className={styles.oauthTopBar}>
                <div className={styles.oauthTopBar__brand}>
                  {providerInfo.icon}
                  <span>{providerInfo.title}</span>
                </div>
                <button
                  type="button"
                  className={styles.oauthTopBar__close}
                  onClick={handleCloseOAuth}
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.oauthContent}>
                {/* GIAI ĐOẠN 1: CHỌN TÀI KHOẢN (Account Chooser - Bước 5 Codelab) */}
                {stage === 'account_chooser' && (
                  <>
                    <div className={styles.appIdentity}>
                      <img
                        src={logoUrl}
                        alt="NexusCRM"
                        className={styles.appIdentity__logo}
                      />
                      <h2 className={styles.appIdentity__title}>Chọn một tài khoản</h2>
                      <p className={styles.appIdentity__subtitle}>
                        để tiếp tục tới <strong>NexusCRM</strong>
                      </p>
                    </div>

                    <div className={styles.chooserList}>
                      {accountChooserList.map((acc) => (
                        <button
                          key={acc.sub}
                          type="button"
                          className={styles.chooserItem}
                          disabled={isProcessingJwt}
                          onClick={() => void handleChooseAccount(acc)}
                        >
                          <img
                            src={acc.picture}
                            alt={acc.name}
                            className={styles.chooserItem__avatar}
                          />
                          <div className={styles.chooserItem__text}>
                            <span className={styles.chooserItem__name}>{acc.name}</span>
                            <span className={styles.chooserItem__email}>
                              {acc.identifier}
                            </span>
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        className={styles.chooserItem}
                        disabled={isProcessingJwt}
                        onClick={() => {
                          setFieldError(null);
                          setStage('enter_identifier');
                        }}
                      >
                        <span className={styles.chooserItem__iconCircle}>
                          <UserPlus size={18} />
                        </span>
                        <div className={styles.chooserItem__text}>
                          <span className={styles.chooserItem__name}>
                            {activeProvider === 'phone'
                              ? 'Sử dụng một số điện thoại khác'
                              : 'Sử dụng một tài khoản khác'}
                          </span>
                        </div>
                      </button>
                    </div>

                    <p className={styles.policyCopy}>
                      Để tiếp tục, nhà cung cấp danh tính sẽ chia sẻ tên, địa chỉ email và ảnh
                      hồ sơ của bạn với <span>NexusCRM</span> thông qua mã thông báo JWT.
                    </p>
                  </>
                )}

                {/* GIAI ĐOẠN 2: NHẬP EMAIL HOẶC SỐ ĐIỆN THOẠI */}
                {stage === 'enter_identifier' && (
                  <form
                    onSubmit={(e) => void handleIdentifierNext(e)}
                    className={styles.stepForm}
                    noValidate
                  >
                    <div className={styles.appIdentity}>
                      <img
                        src={logoUrl}
                        alt="NexusCRM"
                        className={styles.appIdentity__logo}
                      />
                      <h2 className={styles.appIdentity__title}>Đăng nhập</h2>
                      <p className={styles.appIdentity__subtitle}>
                        Tiếp tục tới <strong>NexusCRM</strong>
                      </p>
                    </div>

                    <div className={styles.outlinedField}>
                      <label htmlFor="gsi-identifier-input">{providerInfo.inputLabel}</label>
                      <input
                        id="gsi-identifier-input"
                        type={activeProvider === 'phone' ? 'tel' : 'email'}
                        className={styles.outlinedInput}
                        value={identifierInput}
                        onChange={(e) => {
                          setIdentifierInput(e.target.value);
                          setFieldError(null);
                        }}
                        placeholder={providerInfo.placeholder}
                        autoFocus
                      />
                      {fieldError && (
                        <div className={styles.fieldError} role="alert">
                          <AlertCircle size={14} />
                          <span>{fieldError}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.outlinedField}>
                      <label htmlFor="gsi-name-input">Tên hiển thị trên hồ sơ (tuỳ chọn)</label>
                      <input
                        id="gsi-name-input"
                        type="text"
                        className={styles.outlinedInput}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="VD: Nguyễn Minh Khôi"
                      />
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        onClick={() => {
                          setFieldError(null);
                          setStage('account_chooser');
                        }}
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={isLoading}
                      >
                        Tiếp theo
                      </button>
                    </div>
                  </form>
                )}

                {/* GIAI ĐOẠN 3: NHẬP MẬT KHẨU HOẶC MÃ XÁC MINH OTP */}
                {stage === 'enter_secret' && (
                  <form onSubmit={handleSecretNext} className={styles.stepForm} noValidate>
                    <div className={styles.appIdentity}>
                      <h2 className={styles.appIdentity__title}>Chào mừng bạn</h2>
                      <button
                        type="button"
                        className={styles.userChip}
                        onClick={() => {
                          setFieldError(null);
                          setStage('enter_identifier');
                        }}
                      >
                        <img
                          src={createAvatarSvgDataUri(nameInput || identifierInput, 1)}
                          alt=""
                          className={styles.userChip__avatar}
                        />
                        <span>{identifierInput}</span>
                      </button>
                    </div>

                    {activeProvider === 'phone' && smsOtpGenerated && (
                      <div className={styles.smsHintBox}>
                        <span>
                          <CheckCircle2
                            size={13}
                            style={{ display: 'inline', marginRight: 5, color: '#81C995' }}
                          />
                          Mã SMS OTP gửi tới máy bạn: <strong>{smsOtpGenerated}</strong>
                        </span>
                        <button
                          type="button"
                          className={styles.ghostBtn}
                          onClick={() => {
                            setSecretInput(smsOtpGenerated);
                            setFieldError(null);
                          }}
                        >
                          Điền mã
                        </button>
                      </div>
                    )}

                    <div className={styles.outlinedField}>
                      <label htmlFor="gsi-secret-input">
                        {activeProvider === 'phone'
                          ? 'Nhập mã xác minh 6 chữ số'
                          : 'Nhập mật khẩu của bạn'}
                      </label>
                      <div className={styles.outlinedInputWrap}>
                        <input
                          id="gsi-secret-input"
                          type={
                            activeProvider === 'phone'
                              ? 'text'
                              : showSecret
                              ? 'text'
                              : 'password'
                          }
                          className={styles.outlinedInput}
                          value={secretInput}
                          onChange={(e) => {
                            setSecretInput(e.target.value);
                            setFieldError(null);
                          }}
                          placeholder={
                            activeProvider === 'phone' ? '6 chữ số OTP' : '••••••••'
                          }
                          autoFocus
                        />
                        {activeProvider !== 'phone' && (
                          <button
                            type="button"
                            className={styles.oauthTopBar__close}
                            style={{ position: 'absolute', right: 8 }}
                            onClick={() => setShowSecret((p) => !p)}
                            aria-label={showSecret ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </div>
                      {fieldError && (
                        <div className={styles.fieldError} role="alert">
                          <AlertCircle size={14} />
                          <span>{fieldError}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        onClick={() => {
                          setFieldError(null);
                          setStage('enter_identifier');
                        }}
                      >
                        Thử cách khác
                      </button>
                      <button type="submit" className={styles.primaryBtn}>
                        Tiếp theo
                      </button>
                    </div>
                  </form>
                )}

                {/* GIAI ĐOẠN 4: LỜI NHẮC ĐỒNG Ý (OAuth Consent Prompt - Bước 5 Codelab) */}
                {stage === 'consent_prompt' && selectedAcc && (
                  <>
                    <div className={styles.appIdentity}>
                      <img
                        src={logoUrl}
                        alt="NexusCRM"
                        className={styles.appIdentity__logo}
                      />
                      <h2 className={styles.appIdentity__title}>
                        Đăng nhập vào NexusCRM
                      </h2>
                      <div className={styles.userChip}>
                        <img
                          src={selectedAcc.picture}
                          alt={selectedAcc.name}
                          className={styles.userChip__avatar}
                        />
                        <span>{selectedAcc.identifier}</span>
                      </div>
                    </div>

                    <p className={styles.policyCopy}>
                      Khi bạn nhấp vào <strong>Tiếp tục</strong>, nhà cung cấp xác thực sẽ cấp
                      một <span>Mã thông báo nhận dạng JWT (ID Token)</span> chứa tên (
                      <strong>{selectedAcc.name}</strong>), ảnh hồ sơ và địa chỉ định danh của
                      bạn cho ứng dụng <span>NexusCRM</span>.
                    </p>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        disabled={isProcessingJwt}
                        onClick={() => setStage('account_chooser')}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        disabled={isProcessingJwt}
                        onClick={() => void handleConsentContinue()}
                      >
                        {isProcessingJwt ? 'Đang cấp JWT...' : 'Tiếp tục'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
