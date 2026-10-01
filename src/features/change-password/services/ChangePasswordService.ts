import axios from 'axios';
import { axiosInstance } from '../../../utils/axiosInstance';
import {
  ChangePasswordErrorResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/ChangePassword.types';

// Integration point: this route and response shape must match the backend contract.
// No change-password endpoint currently exists in this repository.
const CHANGE_PASSWORD_ENDPOINT = '/auth/change-password';

export async function changePassword(
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  try {
    const response = await axiosInstance.post<ChangePasswordResponse>(
      CHANGE_PASSWORD_ENDPOINT,
      payload
    );

    if (!response.data || typeof response.data.message !== 'string') {
      throw new Error('Phản hồi đổi mật khẩu không đúng định dạng.');
    }

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ChangePasswordErrorResponse>(error)) {
      const apiMessage = error.response?.data?.message ?? error.response?.data?.detail;
      throw new Error(apiMessage || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Không thể đổi mật khẩu. Vui lòng thử lại.');
  }
}