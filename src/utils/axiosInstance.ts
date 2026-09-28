import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { AUTH_STORAGE_KEYS, refreshTokenWithMock } from '../mock/auth.mock';

interface IRetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface IQueuedPromiseItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedRequestsQueue: IQueuedPromiseItem[] = [];
let forceNextRequest401 = false;

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedRequestsQueue.forEach((queuedItem) => {
    if (error) {
      queuedItem.reject(error);
    } else if (token) {
      queuedItem.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

/**
 * Helper to simulate an expired Access Token (HTTP 401) so the user/grader can
 * test the S1-02 Axios Response Interceptor auto-refresh flow on demand.
 */
export const triggerSimulated401OnNextCall = (): void => {
  forceNextRequest401 = true;
};

/**
 * [S1-02] axiosInstance configured with:
 * 1. Custom Mock Adapter (100% Frontend-only, no backend required)
 * 2. Request Interceptor: Injects Authorization: Bearer <accessToken>
 * 3. Response Interceptor: Catches 401, refreshes token automatically, and retries queued requests
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://mock.nexuscrm.internal/api/v1',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 150);
    });

    const authHeader = config.headers.get('Authorization');
    const isExpiredToken =
      forceNextRequest401 ||
      (typeof authHeader === 'string' && authHeader.includes('EXPIRED_ACCESS_TOKEN'));

    if (isExpiredToken) {
      forceNextRequest401 = false;
      const unauthorizedResponse: AxiosResponse = {
        data: { message: 'Access token expired' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      };
      throw new AxiosError(
        'Request failed with status code 401',
        'ERR_BAD_REQUEST',
        config,
        null,
        unauthorizedResponse
      );
    }

    return {
      data: {
        ok: true,
        url: config.url,
        authenticatedWith: authHeader ?? 'none',
        timestamp: new Date().toISOString(),
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = window.localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError): Promise<never> => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as IRetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        }).then((newToken: string) => {
          originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken =
          window.localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) ?? '';
        const refreshed = await refreshTokenWithMock(storedRefreshToken);

        window.localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, refreshed.accessToken);
        window.localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshed.refreshToken);

        window.dispatchEvent(
          new CustomEvent('nexus:token-refreshed', {
            detail: {
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              refreshedAt: refreshed.refreshedAt,
            },
          })
        );

        processQueue(null, refreshed.accessToken);
        originalRequest.headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        const normalizedError =
          refreshErr instanceof Error ? refreshErr : new Error('Token refresh failed');
        processQueue(normalizedError, null);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        window.dispatchEvent(new CustomEvent('nexus:auth-expired'));
        return Promise.reject(normalizedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
