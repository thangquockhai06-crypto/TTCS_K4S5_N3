export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ChangePasswordField = keyof ChangePasswordFormValues;

export type ChangePasswordFieldErrors = Partial<
  Record<ChangePasswordField, string>
>;

export type ChangePasswordSubmitState =
  | 'idle'
  | 'submitting'
  | 'api-error'
  | 'success';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ChangePasswordErrorResponse {
  message?: string;
  detail?: string;
}