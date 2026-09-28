import {
  IAuthResponse,
  ILoginPayload,
  IPhoneOtpVerifyPayload,
  IRefreshTokenResponseDTO,
  IRegisterPayload,
  ISocialAuthPayload,
  IUser,
} from '../interfaces';
import { createAvatarSvgDataUri } from '../utils/formatters';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'nexus_crm_access_token',
  REFRESH_TOKEN: 'nexus_crm_refresh_token',
  USER: 'nexus_crm_user_profile',
  REGISTERED_USERS: 'nexus_crm_registered_users',
  LOCKOUT_UNTIL: 'nexus_crm_lockout_until_ts',
  FAILED_ATTEMPTS: 'nexus_crm_failed_login_attempts',
} as const;

export interface IStoredAccount {
  email: string;
  password: string;
  user: IUser;
}

export const ADMIN_ACCOUNT: IStoredAccount = {
  email: 'admin@nexuscrm.vn',
  password: 'Admin@2026',
  user: {
    id: 'usr-admin-01',
    fullName: 'Quản Trị Viên Hệ Thống',
    email: 'admin@nexuscrm.vn',
    role: 'Super Admin',
    title: 'Quản trị viên cấp cao (System Admin)',
    department: 'Ban Quản Trị & Vận Hành Doanh Thu',
    avatarUrl: createAvatarSvgDataUri('Quan Tri Vien', 0),
    workspaceName: 'NexusCRM Enterprise VN',
  },
};

function getRegisteredAccounts(): IStoredAccount[] {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.REGISTERED_USERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as IStoredAccount[];
  } catch {
    return [];
  }
}

export function generateMockJwt(prefix: string, userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      type: prefix,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  );
  const signature = btoa(`${prefix}_${userId}_${Date.now()}`).slice(0, 24);
  return `${header}.${payload}.${signature}`;
}

export async function authenticateWithMock(payload: ILoginPayload): Promise<IAuthResponse> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 380);
  });

  const normalizedEmail = payload.email.trim().toLowerCase();
  const allAccounts: IStoredAccount[] = [ADMIN_ACCOUNT, ...getRegisteredAccounts()];

  const matched = allAccounts.find(
    (entry) =>
      entry.email.toLowerCase() === normalizedEmail && entry.password === payload.password
  );

  if (!matched) {
    throw new Error('INVALID_CREDENTIALS');
  }

  return {
    accessToken: generateMockJwt('access', matched.user.id),
    refreshToken: generateMockJwt('refresh', matched.user.id),
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: matched.user,
    issuedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

export async function registerWithMock(payload: IRegisterPayload): Promise<IAuthResponse> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 420);
  });

  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingAccounts: IStoredAccount[] = [ADMIN_ACCOUNT, ...getRegisteredAccounts()];

  if (existingAccounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const newUser: IUser = {
    id: `usr-${Date.now()}`,
    fullName: payload.fullName.trim(),
    email: normalizedEmail,
    role: 'Super Admin',
    title: payload.roleTitle.trim() || 'Quản trị viên Doanh nghiệp',
    department: 'Ban Điều Hành & Kinh Doanh',
    avatarUrl: createAvatarSvgDataUri(payload.fullName.trim(), 2),
    workspaceName: payload.companyName.trim() || 'NexusCRM Workspace',
  };

  const newAccount: IStoredAccount = {
    email: normalizedEmail,
    password: payload.password,
    user: newUser,
  };

  const updatedList = [...getRegisteredAccounts(), newAccount];
  window.localStorage.setItem(AUTH_STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedList));

  return {
    accessToken: generateMockJwt('access', newUser.id),
    refreshToken: generateMockJwt('refresh', newUser.id),
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: newUser,
    issuedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

export async function refreshTokenWithMock(
  currentRefreshToken: string
): Promise<IRefreshTokenResponseDTO> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 260);
  });

  if (!currentRefreshToken || currentRefreshToken === 'EXPIRED_REFRESH_TOKEN') {
    throw new Error('REFRESH_TOKEN_EXPIRED');
  }

  return {
    accessToken: generateMockJwt('access_refreshed', 'usr-admin-01'),
    refreshToken: generateMockJwt('refresh_rotated', 'usr-admin-01'),
    expiresIn: 3600,
    refreshedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

const PENDING_OTP_STORAGE_KEY = 'nexus_crm_pending_phone_otp';

interface IPendingOtpRecord {
  phoneNumber: string;
  otpCode: string;
  expiresAt: number;
}

export function normalizeVietnamPhone(rawPhone: string): string {
  const digitsAndPlus = rawPhone.replace(/[\s.-]/g, '');
  if (digitsAndPlus.startsWith('+84')) {
    return `0${digitsAndPlus.slice(3)}`;
  }
  if (digitsAndPlus.startsWith('84') && digitsAndPlus.length === 11) {
    return `0${digitsAndPlus.slice(2)}`;
  }
  return digitsAndPlus;
}

export function isValidVietnamPhone(rawPhone: string): boolean {
  const normalized = normalizeVietnamPhone(rawPhone);
  return /^0[35789][0-9]{8}$/.test(normalized);
}

export async function authenticateWithSocialMock(
  payload: ISocialAuthPayload
): Promise<IAuthResponse> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 420);
  });

  const rawEmail = payload.email.trim().toLowerCase();
  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    throw new Error('INVALID_SOCIAL_EMAIL');
  }

  const effectiveEmail =
    payload.provider === 'apple' && payload.hideAppleEmail
      ? `${rawEmail.split('@')[0]}.relay@privaterelay.appleid.com`
      : rawEmail;

  const existingAccounts: IStoredAccount[] = [ADMIN_ACCOUNT, ...getRegisteredAccounts()];
  const matched = existingAccounts.find(
    (acc) =>
      acc.email.toLowerCase() === effectiveEmail || acc.email.toLowerCase() === rawEmail
  );

  if (matched) {
    const updatedUser: IUser = {
      ...matched.user,
      fullName: payload.fullName.trim() || matched.user.fullName,
    };
    return {
      accessToken: generateMockJwt(`access_${payload.provider}`, updatedUser.id),
      refreshToken: generateMockJwt(`refresh_${payload.provider}`, updatedUser.id),
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: updatedUser,
      issuedAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  }

  const providerLabelMap: Record<ISocialAuthPayload['provider'], string> = {
    google: 'Tài khoản Google Cá nhân',
    linkedin: 'Hồ sơ LinkedIn Doanh nghiệp',
    apple: 'Tài khoản Apple ID',
  };

  const colorIdxMap: Record<ISocialAuthPayload['provider'], number> = {
    google: 1,
    linkedin: 3,
    apple: 4,
  };

  const displayName =
    payload.fullName.trim() ||
    rawEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const newUser: IUser = {
    id: `usr-${payload.provider}-${Date.now()}`,
    fullName: displayName,
    email: effectiveEmail,
    role: 'Super Admin',
    title: payload.roleTitle?.trim() || `Quản trị viên (${providerLabelMap[payload.provider]})`,
    department: 'Ban Điều Hành & Kinh Doanh',
    avatarUrl: createAvatarSvgDataUri(displayName, colorIdxMap[payload.provider]),
    workspaceName: payload.companyName?.trim() || 'NexusCRM Enterprise VN',
  };

  const newAccount: IStoredAccount = {
    email: effectiveEmail,
    password: `oauth_${payload.provider}_${Date.now()}`,
    user: newUser,
  };

  const updatedList = [...getRegisteredAccounts(), newAccount];
  window.localStorage.setItem(
    AUTH_STORAGE_KEYS.REGISTERED_USERS,
    JSON.stringify(updatedList)
  );

  return {
    accessToken: generateMockJwt(`access_${payload.provider}`, newUser.id),
    refreshToken: generateMockJwt(`refresh_${payload.provider}`, newUser.id),
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: newUser,
    issuedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

export async function sendPhoneOtpWithMock(
  rawPhoneNumber: string
): Promise<{ otpCode: string; expiresInSeconds: number; existingUser: IUser | null }> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 350);
  });

  if (!isValidVietnamPhone(rawPhoneNumber)) {
    throw new Error('INVALID_PHONE_NUMBER');
  }

  const normalizedPhone = normalizeVietnamPhone(rawPhoneNumber);
  const syntheticEmail = `${normalizedPhone}@phone.nexuscrm.vn`;
  const existingAccounts = getRegisteredAccounts();
  const existingAccount = existingAccounts.find(
    (acc) => acc.email.toLowerCase() === syntheticEmail
  );

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const record: IPendingOtpRecord = {
    phoneNumber: normalizedPhone,
    otpCode,
    expiresAt: Date.now() + 120 * 1000,
  };

  window.sessionStorage.setItem(PENDING_OTP_STORAGE_KEY, JSON.stringify(record));

  return {
    otpCode,
    expiresInSeconds: 120,
    existingUser: existingAccount ? existingAccount.user : null,
  };
}

export async function verifyPhoneOtpWithMock(
  payload: IPhoneOtpVerifyPayload
): Promise<IAuthResponse> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 380);
  });

  const normalizedPhone = normalizeVietnamPhone(payload.phoneNumber);
  const rawRecord = window.sessionStorage.getItem(PENDING_OTP_STORAGE_KEY);

  if (!rawRecord) {
    throw new Error('OTP_EXPIRED');
  }

  let parsedRecord: IPendingOtpRecord;
  try {
    parsedRecord = JSON.parse(rawRecord) as IPendingOtpRecord;
  } catch {
    throw new Error('OTP_EXPIRED');
  }

  if (Date.now() > parsedRecord.expiresAt || parsedRecord.phoneNumber !== normalizedPhone) {
    throw new Error('OTP_EXPIRED');
  }

  if (parsedRecord.otpCode !== payload.otpCode.trim()) {
    throw new Error('INVALID_OTP_CODE');
  }

  window.sessionStorage.removeItem(PENDING_OTP_STORAGE_KEY);

  const syntheticEmail = `${normalizedPhone}@phone.nexuscrm.vn`;
  const existingAccounts = getRegisteredAccounts();
  const matched = existingAccounts.find(
    (acc) => acc.email.toLowerCase() === syntheticEmail
  );

  if (matched) {
    return {
      accessToken: generateMockJwt('access_phone', matched.user.id),
      refreshToken: generateMockJwt('refresh_phone', matched.user.id),
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: matched.user,
      issuedAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  }

  const displayName =
    payload.fullName?.trim() || `Người dùng SĐT (${normalizedPhone.slice(-4)})`;

  const newUser: IUser = {
    id: `usr-phone-${Date.now()}`,
    fullName: displayName,
    email: syntheticEmail,
    role: 'Super Admin',
    title: `Xác thực SĐT (${normalizedPhone})`,
    department: 'Ban Điều Hành & Kinh Doanh',
    avatarUrl: createAvatarSvgDataUri(displayName, 2),
    workspaceName: 'NexusCRM Enterprise VN',
  };

  const newAccount: IStoredAccount = {
    email: syntheticEmail,
    password: `phone_otp_${normalizedPhone}`,
    user: newUser,
  };

  const updatedList = [...existingAccounts, newAccount];
  window.localStorage.setItem(
    AUTH_STORAGE_KEYS.REGISTERED_USERS,
    JSON.stringify(updatedList)
  );

  return {
    accessToken: generateMockJwt('access_phone', newUser.id),
    refreshToken: generateMockJwt('refresh_phone', newUser.id),
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: newUser,
    issuedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

