import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.models.token import RefreshToken
from app.repositories.user_repository import UserRepository
from app.repositories.token_repository import TokenRepository
from app.schemas.auth import (
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    RefreshTokenResponseDTO,
    UserDTO,
)
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

# Constants theo chuẩn PEP 8 (UPPER_CASE_SNAKE)
MAX_LOGIN_ATTEMPTS: int = 5
LOCKOUT_DURATION_MINUTES: int = 15
GENERIC_AUTH_ERROR_MESSAGE: str = "Email hoặc mật khẩu không chính xác."

class AuthService:
    """
    Tầng Service chứa toàn bộ Business Logic nghiệp vụ Xác thực & Phiên làm việc.
    Tuân thủ Clean Layered Architecture (gọi qua UserRepository & TokenRepository).
    Triển khai 100% Type Hints.
    """

    @staticmethod
    def authenticate_user(db: Session, payload: LoginPayload) -> AuthResponse:
        """
        [SCRUM-32 / SCRUM-101]
        1. Đăng nhập đúng thì vào được trang chủ tương ứng với vai trò
        2. Sai thông tin hiển thị thông báo chung, không tiết lộ email có tồn tại hay không (Anti-Enumeration)
        3. Khóa tạm 15 phút sau 5 lần sai liên tiếp
        """
        normalized_email: str = payload.email.strip().lower()
        now_utc: datetime = datetime.utcnow()

        user: Optional[User] = UserRepository.get_by_email(db, normalized_email)

        # 0. Kiểm tra tài khoản có bị vô hiệu hóa hay không
        if user and getattr(user, "status", "active") in ["inactive", "deactivated"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
            )

        # 1. Kiểm tra tài khoản có đang trong thời gian bị khóa 15 phút không
        if user and user.lockout_until:
            if user.lockout_until > now_utc:
                seconds_remaining: int = int((user.lockout_until - now_utc).total_seconds())
                minutes_remaining: int = max(1, seconds_remaining // 60)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Tài khoản đang bị tạm khóa {minutes_remaining} phút do nhập sai quá 5 lần liên tiếp. Vui lòng thử lại sau.",
                )
            else:
                # Đã hết 15 phút -> tự động mở khóa
                UserRepository.reset_failed_attempts(db, user)

        # 2. Kiểm tra mật khẩu (Chống dò email: luôn trả về cùng thông báo chung)
        if not user or not verify_password(payload.password, user.password_hash):
            if user:
                current_fails: int = UserRepository.increment_failed_attempts(db, user)
                if current_fails >= MAX_LOGIN_ATTEMPTS:
                    lockout_time: datetime = now_utc + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                    UserRepository.lock_user(db, user, lockout_time)
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Bạn đã nhập sai 5 lần liên tiếp. Tài khoản tạm thời bị khóa trong {LOCKOUT_DURATION_MINUTES} phút để bảo mật.",
                    )
                else:
                    remaining_attempts: int = MAX_LOGIN_ATTEMPTS - current_fails
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"{GENERIC_AUTH_ERROR_MESSAGE} Còn {remaining_attempts} lần thử trước khi khóa 15 phút.",
                    )
            else:
                # Anti-Enumeration: Không tiết lộ email có tồn tại hay không
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=GENERIC_AUTH_ERROR_MESSAGE,
                )

        # 3. Đăng nhập thành công -> Reset số lần sai
        UserRepository.reset_failed_attempts(db, user)

        # 4. Sinh cặp mã JWT: Access Token (15p) + Refresh Token (7-30 ngày)
        access_token: str = create_access_token(user.id, user.email, user.role)
        refresh_token_str, refresh_expires_at = create_refresh_token(user.id, payload.rememberMe or False)

        # Lưu Refresh Token vào CSDL thông qua TokenRepository
        new_token_record: RefreshToken = RefreshToken(
            id=str(uuid.uuid4()),
            user_id=user.id,
            token=refresh_token_str,
            expires_at=refresh_expires_at,
            is_revoked=False,
        )
        TokenRepository.create(db, new_token_record)

        user_dto: UserDTO = UserDTO(
            id=user.id,
            fullName=user.full_name,
            email=user.email,
            role=user.role,
            title=user.title or "Quản trị viên",
            department=user.department or "Vận hành",
            avatarUrl=user.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={user.full_name}",
            workspaceName=user.workspace_name or "NexusCRM Enterprise VN",
        )

        return AuthResponse(
            accessToken=access_token,
            refreshToken=refresh_token_str,
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            tokenType="Bearer",
            user=user_dto,
            issuedAt=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def register_user(db: Session, payload: RegisterPayload) -> AuthResponse:
        """Đăng ký tài khoản doanh nghiệp mới qua UserRepository."""
        normalized_email: str = payload.email.strip().lower()
        existing_user: Optional[User] = UserRepository.get_by_email(db, normalized_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác.",
            )

        new_user: User = User(
            id=str(uuid.uuid4()),
            email=normalized_email,
            password_hash=hash_password(payload.password),
            full_name=payload.fullName.strip(),
            role="Account Executive",
            title=payload.roleTitle or "Account Executive",
            department="Phòng Kinh Doanh & Quan Hệ Khách Hàng",
            workspace_name=payload.companyName or "NexusCRM Enterprise VN",
            avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={payload.fullName}",
            failed_attempts=0,
            lockout_until=None,
        )
        saved_user: User = UserRepository.create(db, new_user)

        access_token: str = create_access_token(saved_user.id, saved_user.email, saved_user.role)
        refresh_token_str, refresh_expires_at = create_refresh_token(saved_user.id, False)

        token_record: RefreshToken = RefreshToken(
            id=str(uuid.uuid4()),
            user_id=saved_user.id,
            token=refresh_token_str,
            expires_at=refresh_expires_at,
            is_revoked=False,
        )
        TokenRepository.create(db, token_record)

        user_dto: UserDTO = UserDTO(
            id=saved_user.id,
            fullName=saved_user.full_name,
            email=saved_user.email,
            role=saved_user.role,
            title=saved_user.title,
            department=saved_user.department,
            avatarUrl=saved_user.avatar_url,
            workspaceName=saved_user.workspace_name,
        )

        return AuthResponse(
            accessToken=access_token,
            refreshToken=refresh_token_str,
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            tokenType="Bearer",
            user=user_dto,
            issuedAt=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def refresh_access_token(db: Session, refresh_token_str: str) -> RefreshTokenResponseDTO:
        """
        [SCRUM-34 / SCRUM-103]
        1. Phiên được gia hạn tự động khi còn hoạt động
        3. Phiên hết hạn đưa về trang đăng nhập kèm thông báo rõ ràng
        """
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
            )

        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Dữ liệu token không hợp lệ.",
            )

        token_record: Optional[RefreshToken] = TokenRepository.get_by_token_and_user_id(
            db, refresh_token_str, user_id
        )

        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.",
            )

        if token_record.is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phiên đăng nhập này đã bị hủy (Đã đăng xuất). Vui lòng đăng nhập lại.",
            )

        now_utc: datetime = datetime.utcnow()
        if token_record.expires_at < now_utc:
            TokenRepository.revoke_token(db, token_record)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
            )

        user: Optional[User] = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tài khoản không tồn tại hoặc đã bị khóa.",
            )

        # Cấp Access Token mới (15 phút tiếp theo)
        new_access_token: str = create_access_token(user.id, user.email, user.role)

        return RefreshTokenResponseDTO(
            accessToken=new_access_token,
            refreshToken=refresh_token_str,
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refreshedAt=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def logout(db: Session, user_id: str, refresh_token_str: Optional[str] = None) -> None:
        """
        [SCRUM-34 / SCRUM-103]
        2. Đăng xuất làm mất hiệu lực phiên ngay lập tức phía server
        """
        TokenRepository.revoke_all_user_tokens(db, user_id, refresh_token_str)
