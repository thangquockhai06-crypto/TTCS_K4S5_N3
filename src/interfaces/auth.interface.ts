export interface ILoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type LoginRequestDTO = ILoginPayload;

export interface IRegisterPayload {
  fullName: string;
  email: string;
  companyName: string;
  roleTitle: string;
  password: string;
  confirmPassword: string;
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'VP of Sales' | 'Account Executive' | 'RevOps Lead';
  title: string;
  department: string;
  avatarUrl: string;
  workspaceName: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: IUser;
  issuedAt: string;
}

export interface IRefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshedAt: string;
}

export interface IAuthContext {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastTokenRefresh: string | null;
  login: (payload: ILoginPayload) => Promise<IAuthResponse>;
  register: (payload: IRegisterPayload) => Promise<IAuthResponse>;
  logout: () => void;
  triggerMockTokenRefresh: () => Promise<string>;
  updateUserProfile: (partial: Partial<IUser>) => void;
}
