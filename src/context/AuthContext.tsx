import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  IAuthContext,
  IAuthResponse,
  ILoginPayload,
  IPhoneOtpVerifyPayload,
  IRegisterPayload,
  ISocialAuthPayload,
  IUser,
} from '../interfaces';
import {
  AUTH_STORAGE_KEYS,
  authenticateWithMock,
  authenticateWithSocialMock,
  registerWithMock,
  sendPhoneOtpWithMock,
  verifyPhoneOtpWithMock,
} from '../mock/auth.mock';
import {
  axiosInstance,
  triggerSimulated401OnNextCall,
  USE_REAL_BACKEND,
} from '../utils/axiosInstance';

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface IAuthProviderProps {
  children: React.ReactNode;
}

interface ITokenRefreshedEventDetail {
  accessToken: string;
  refreshToken: string;
  refreshedAt: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const getInitialAuthState = (): {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
} => {
  const localToken = window.localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (localToken === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.nexus_admin_session_token') {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT);
    return { user: null, accessToken: null, refreshToken: null };
  }

  // 1. Kiểm tra phiên duy trì 30 ngày trong localStorage
  const isRemembered = window.localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';
  const expiresAtRaw = window.localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT);
  const localUserRaw = window.localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  const localRefreshToken = window.localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

  if (isRemembered && localToken && localUserRaw) {
    if (expiresAtRaw) {
      const expiresAt = Number(expiresAtRaw);
      if (Date.now() > expiresAt) {
        // Đã quá 30 ngày -> Hết hạn duy trì đăng nhập
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT);
        return { user: null, accessToken: null, refreshToken: null };
      }
    }
    try {
      return {
        user: JSON.parse(localUserRaw) as IUser,
        accessToken: localToken,
        refreshToken: localRefreshToken,
      };
    } catch {
      return { user: null, accessToken: null, refreshToken: null };
    }
  }

  // 2. Kiểm tra phiên tạm thời trong sessionStorage (khi rememberMe = false)
  const sessionToken = window.sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  const sessionUserRaw = window.sessionStorage.getItem(AUTH_STORAGE_KEYS.USER);
  const sessionRefreshToken = window.sessionStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

  if (sessionToken && sessionUserRaw) {
    try {
      return {
        user: JSON.parse(sessionUserRaw) as IUser,
        accessToken: sessionToken,
        refreshToken: sessionRefreshToken,
      };
    } catch {
      return { user: null, accessToken: null, refreshToken: null };
    }
  }

  return { user: null, accessToken: null, refreshToken: null };
};

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [initialAuth] = useState(getInitialAuthState);
  const [user, setUser] = useState<IUser | null>(initialAuth.user);
  const [accessToken, setAccessToken] = useState<string | null>(initialAuth.accessToken);
  const [refreshToken, setRefreshToken] = useState<string | null>(initialAuth.refreshToken);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastTokenRefresh, setLastTokenRefresh] = useState<string | null>(
    initialAuth.user ? 'Phiên đang hoạt động' : null
  );

  useEffect(() => {
    const handleTokenRefreshed = (event: Event): void => {
      const customEvent = event as CustomEvent<ITokenRefreshedEventDetail>;
      if (customEvent.detail) {
        setAccessToken(customEvent.detail.accessToken);
        setRefreshToken(customEvent.detail.refreshToken);
        setLastTokenRefresh(`Làm mới lúc ${customEvent.detail.refreshedAt}`);
      }
    };

    const handleAuthExpired = (): void => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    window.addEventListener('nexus:token-refreshed', handleTokenRefreshed);
    window.addEventListener('nexus:auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('nexus:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('nexus:auth-expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (payload: ILoginPayload): Promise<IAuthResponse> => {
    setIsLoading(true);
    try {
      let response: IAuthResponse;
      if (USE_REAL_BACKEND) {
        try {
          const { data } = await axiosInstance.post<IAuthResponse>('/auth/login', payload, {
            timeout: 1500,
          });
          response = data;
        } catch (error: any) {
          // Nếu Backend lỗi (chưa cấu hình MySQL / 500 / Network Error), tự động fallback sang Mock Auth cho Admin
          if (
            !error.response ||
            error.response.status >= 500 ||
            error.code === 'ERR_NETWORK' ||
            error.code === 'ECONNABORTED'
          ) {
            console.warn('[AUTH] Backend 500 hoặc mất kết nối, chuyển sang Mock Auth dự phòng.');
            response = await authenticateWithMock(payload);
          } else {
            throw error;
          }
        }
      } else {
        response = await authenticateWithMock(payload);
      }

      const rememberMe = payload.rememberMe !== false;
      const expiresAt = Date.now() + THIRTY_DAYS_MS;

      if (rememberMe) {
        // Duy trì đăng nhập 30 ngày trong localStorage
        window.localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.user));
        window.localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
        window.localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT, String(expiresAt));

        window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      } else {
        // Phiên tạm thời: chỉ lưu trong sessionStorage (khi tắt tab/trình duyệt sẽ mất)
        window.sessionStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        window.sessionStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        window.sessionStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.user));

        window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT);
      }

      window.localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
      window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);
      setLastTokenRefresh(`Cấp lúc ${response.issuedAt}`);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (payload: IRegisterPayload): Promise<IAuthResponse> => {
      setIsLoading(true);
      try {
        let response: IAuthResponse;
        if (USE_REAL_BACKEND) {
          const { data } = await axiosInstance.post<IAuthResponse>('/auth/register', payload, {
            timeout: 1500,
          });
          response = data;
        } else {
          response = await registerWithMock(payload);
        }

        window.localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.user));
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);

        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUser(response.user);
        setLastTokenRefresh(`Khởi tạo lúc ${response.issuedAt}`);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loginWithSocial = useCallback(
    async (payload: ISocialAuthPayload): Promise<IAuthResponse> => {
      setIsLoading(true);
      try {
        const response = await authenticateWithSocialMock(payload);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.user));
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);

        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUser(response.user);
        setLastTokenRefresh(`Cấp qua ${payload.provider.toUpperCase()} lúc ${response.issuedAt}`);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendPhoneOtp = useCallback(
    async (
      phoneNumber: string
    ): Promise<{ otpCode: string; expiresInSeconds: number; existingUser: IUser | null }> => {
      setIsLoading(true);
      try {
        return await sendPhoneOtpWithMock(phoneNumber);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyPhoneOtp = useCallback(
    async (payload: IPhoneOtpVerifyPayload): Promise<IAuthResponse> => {
      setIsLoading(true);
      try {
        const response = await verifyPhoneOtpWithMock(payload);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(response.user));
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);

        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUser(response.user);
        setLastTokenRefresh(`Xác thực OTP lúc ${response.issuedAt}`);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * [S1-02] Nút Logout: Gửi request thu hồi phiên phía server & xóa sạch storage
   */
  const logout = useCallback((): void => {
    if (USE_REAL_BACKEND) {
      const storedRefreshToken =
        window.localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) ||
        window.sessionStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      axiosInstance
        .post('/auth/logout', { refreshToken: storedRefreshToken })
        .catch(() => {});
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_EXPIRES_AT);
    window.sessionStorage.clear();

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setLastTokenRefresh(null);
  }, []);

  const triggerMockTokenRefresh = useCallback(async (): Promise<string> => {
    triggerSimulated401OnNextCall();
    await axiosInstance.get('/auth/session-heartbeat');
    const updatedToken =
      window.localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      '';
    return updatedToken;
  }, []);

  const updateUserProfile = useCallback((partial: Partial<IUser>): void => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: IUser = { ...prev, ...partial };
      const serialized = JSON.stringify(updated);
      if (window.localStorage.getItem(AUTH_STORAGE_KEYS.USER)) {
        window.localStorage.setItem(AUTH_STORAGE_KEYS.USER, serialized);
      }
      if (window.sessionStorage.getItem(AUTH_STORAGE_KEYS.USER)) {
        window.sessionStorage.setItem(AUTH_STORAGE_KEYS.USER, serialized);
      }
      return updated;
    });
  }, []);

  const contextValue = useMemo<IAuthContext>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      lastTokenRefresh,
      login,
      register,
      loginWithSocial,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      triggerMockTokenRefresh,
      updateUserProfile,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isLoading,
      lastTokenRefresh,
      login,
      register,
      loginWithSocial,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      triggerMockTokenRefresh,
      updateUserProfile,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
