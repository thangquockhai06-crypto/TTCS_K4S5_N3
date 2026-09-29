import {
  IUserCreateInput,
  IUserFilterState,
  IUserItem,
  IUserPaginationResult,
  IUserUpdateInput,
} from '../interfaces/user-management.interface';
import { getStoredUsers, saveStoredUsers } from '../mock/users.mock';

/**
 * Sinh mật khẩu tạm ngẫu nhiên bảo mật 8 ký tự
 */
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = 'Nx#';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

class UserService {
  /**
   * Lấy danh sách người dùng có Tìm kiếm, Lọc và Phân trang (mặc định 20 dòng)
   */
  public async getUsers(filter: IUserFilterState): Promise<IUserPaginationResult> {
    // Độ trễ giả lập 120ms tạo cảm giác mượt mà thực tế
    await new Promise<void>((resolve) => window.setTimeout(resolve, 120));

    let users = getStoredUsers();

    // 1. Tìm theo tên, email, nhóm
    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      users = users.filter((u) => {
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchGroup = u.group.toLowerCase().includes(q);
        const matchPhone = u.phone ? u.phone.includes(q) : false;
        return matchName || matchEmail || matchGroup || matchPhone;
      });
    }

    // 2. Lọc theo vai trò (Một người dùng có thể giữ nhiều vai trò cùng lúc)
    if (filter.role && filter.role !== 'all') {
      users = users.filter((u) => u.roles.includes(filter.role as any));
    }

    // 3. Lọc theo trạng thái
    if (filter.status && filter.status !== 'all') {
      users = users.filter((u) => u.status === filter.status);
    }

    // 4. Lọc theo nhóm cụ thể
    if (filter.group && filter.group !== 'all') {
      users = users.filter((u) => u.group === filter.group);
    }

    // 5. Phân trang (mặc định 20 dòng)
    const limit = Number(filter.limit) || 20;
    const page = Math.max(1, Number(filter.page) || 1);
    const total = users.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.min(page, totalPages);

    const startIdx = (validPage - 1) * limit;
    const paginatedData = users.slice(startIdx, startIdx + limit);

    return {
      data: paginatedData,
      total,
      page: validPage,
      limit,
      totalPages,
    };
  }

  /**
   * Lấy chi tiết một người dùng
   */
  public async getUserById(userId: string): Promise<IUserItem | null> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
    const users = getStoredUsers();
    return users.find((u) => u.id === userId) || null;
  }

  /**
   * Tạo tài khoản người dùng mới
   * - Kiểm tra email trùng
   * - Ràng buộc Trưởng nhóm phải có nhóm cụ thể
   * - Tạo mật khẩu tạm & gửi email kích hoạt
   */
  public async createUser(
    payload: IUserCreateInput
  ): Promise<{ user: IUserItem; tempPassword: string; message: string }> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 200));

    const users = getStoredUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();

    // 1. Email trùng bị từ chối kèm thông báo cụ thể
    const isDuplicate = users.some(
      (u) => u.email.trim().toLowerCase() === normalizedEmail
    );
    if (isDuplicate) {
      throw new Error(
        `Email '${payload.email.trim()}' đã được sử dụng trong hệ thống. Vui lòng thử email khác.`
      );
    }

    // 2. Kiểm tra vai trò
    if (!payload.roles || payload.roles.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một vai trò cho người dùng.');
    }

    // 3. Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể
    if (payload.roles.includes('manager')) {
      if (!payload.group || payload.group.trim() === '' || payload.group === 'Chưa phân nhóm') {
        throw new Error('Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể.');
      }
    }

    // 4. Sinh mật khẩu tạm và khởi tạo tài khoản
    const tempPassword = generateTemporaryPassword();
    const newUser: IUserItem = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: payload.name.trim(),
      email: normalizedEmail,
      group: payload.group.trim() || 'Chưa phân nhóm',
      roles: payload.roles,
      status: payload.status || 'pending_activation',
      tempPassword,
      activationSentAt: new Date().toISOString(),
      phone: payload.phone?.trim() || '',
      createdAt: new Date().toISOString(),
      lastLogin: 'Chưa đăng nhập',
      avatarIndex: Math.floor(Math.random() * 20),
    };

    const updatedUsers = [newUser, ...users];
    saveStoredUsers(updatedUsers);

    return {
      user: newUser,
      tempPassword,
      message: `Tạo tài khoản thành công! Email kích hoạt kèm mật khẩu tạm (${tempPassword}) đã được gửi tới '${newUser.email}'.`,
    };
  }

  /**
   * Cập nhật thông tin tài khoản người dùng
   * - Không thể tự thu hồi vai trò quản trị của chính mình
   * - Email trùng bị từ chối
   * - Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể
   */
  public async updateUser(
    userId: string,
    payload: IUserUpdateInput,
    currentUserId?: string,
    currentUserEmail?: string
  ): Promise<{ user: IUserItem; message: string }> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 200));

    const users = getStoredUsers();
    const targetIdx = users.findIndex((u) => u.id === userId);

    if (targetIdx === -1) {
      throw new Error(`Người dùng với ID '${userId}' không tồn tại trên hệ thống.`);
    }

    const existingUser = users[targetIdx];

    // 1. Kiểm tra email trùng với người dùng khác
    if (payload.email) {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const isDuplicate = users.some(
        (u) => u.id !== userId && u.email.trim().toLowerCase() === normalizedEmail
      );
      if (isDuplicate) {
        throw new Error(
          `Email '${payload.email.trim()}' đã được sử dụng trong hệ thống. Vui lòng thử email khác.`
        );
      }
    }

    // 2. Không thể tự thu hồi vai trò quản trị của chính mình
    const isEditingSelf =
      (currentUserId && userId === currentUserId) ||
      (currentUserEmail &&
        existingUser.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase());

    if (isEditingSelf && payload.roles) {
      const wasAdmin = existingUser.roles.includes('admin');
      const willBeAdmin = payload.roles.includes('admin');

      if (wasAdmin && !willBeAdmin) {
        throw new Error(
          'Không thể tự thu hồi vai trò quản trị của chính mình để tránh mất quyền điều hành hệ thống.'
        );
      }
    }

    // 3. Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể
    const finalRoles = payload.roles || existingUser.roles;
    const finalGroup = payload.group !== undefined ? payload.group.trim() : existingUser.group;

    if (finalRoles.includes('manager')) {
      if (!finalGroup || finalGroup === '' || finalGroup === 'Chưa phân nhóm') {
        throw new Error('Người giữ vai trò Trưởng nhóm phải được gán một nhóm cụ thể.');
      }
    }

    const updatedUser: IUserItem = {
      ...existingUser,
      name: payload.name ? payload.name.trim() : existingUser.name,
      email: payload.email ? payload.email.trim().toLowerCase() : existingUser.email,
      group: finalGroup || 'Chưa phân nhóm',
      roles: finalRoles,
      status: payload.status !== undefined ? payload.status : existingUser.status,
      phone: payload.phone !== undefined ? payload.phone.trim() : existingUser.phone,
      updatedAt: new Date().toISOString(),
    };

    users[targetIdx] = updatedUser;
    saveStoredUsers(users);

    return {
      user: updatedUser,
      message: `Cập nhật thông tin tài khoản '${updatedUser.name}' thành công!`,
    };
  }

  /**
   * Xóa tài khoản người dùng
   */
  public async deleteUser(
    userId: string,
    currentUserId?: string,
    currentUserEmail?: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));

    const users = getStoredUsers();
    const target = users.find((u) => u.id === userId);

    if (!target) {
      throw new Error(`Người dùng không tồn tại.`);
    }

    const isDeletingSelf =
      (currentUserId && userId === currentUserId) ||
      (currentUserEmail &&
        target.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase());

    if (isDeletingSelf) {
      throw new Error('Không thể tự xóa tài khoản của chính mình.');
    }

    const remaining = users.filter((u) => u.id !== userId);
    saveStoredUsers(remaining);

    return {
      success: true,
      message: `Đã xóa tài khoản '${target.name}' khỏi hệ thống.`,
    };
  }

  /**
   * Đổi trạng thái hoạt động (Khóa / Mở khóa / Kích hoạt)
   */
  public async toggleStatus(
    userId: string,
    currentUserId?: string,
    currentUserEmail?: string
  ): Promise<{ user: IUserItem; message: string }> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));

    const users = getStoredUsers();
    const targetIdx = users.findIndex((u) => u.id === userId);

    if (targetIdx === -1) {
      throw new Error(`Người dùng không tồn tại.`);
    }

    const target = users[targetIdx];

    const isModifyingSelf =
      (currentUserId && userId === currentUserId) ||
      (currentUserEmail &&
        target.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase());

    if (isModifyingSelf) {
      throw new Error('Không thể tự khóa tài khoản quản trị của chính mình.');
    }

    const newStatus = target.status === 'locked' ? 'active' : 'locked';
    target.status = newStatus;
    target.updatedAt = new Date().toISOString();

    users[targetIdx] = target;
    saveStoredUsers(users);

    return {
      user: target,
      message:
        newStatus === 'locked'
          ? `Đã khóa tài khoản '${target.name}'.`
          : `Đã mở khóa tài khoản '${target.name}'.`,
    };
  }

  /**
   * Gửi lại email kích hoạt kèm mật khẩu tạm
   */
  public async resendActivationEmail(
    userId: string
  ): Promise<{ message: string; tempPassword: string }> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 200));

    const users = getStoredUsers();
    const target = users.find((u) => u.id === userId);

    if (!target) {
      throw new Error('Người dùng không tồn tại.');
    }

    const tempPassword = target.tempPassword || generateTemporaryPassword();
    target.tempPassword = tempPassword;
    target.activationSentAt = new Date().toISOString();
    target.status = 'pending_activation';
    saveStoredUsers(users);

    return {
      tempPassword,
      message: `Đã gửi lại email kích hoạt kèm mật khẩu tạm (${tempPassword}) đến '${target.email}'.`,
    };
  }
}

export const userService = new UserService();
