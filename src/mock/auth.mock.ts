import {
  IAuthResponse,
  ILoginPayload,
  IRefreshTokenResponseDTO,
  IRegisterPayload,
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
