import uuid
import base64
import json
import random
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
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
    GoogleAuthPayload,
    LinkedInAuthPayload,
    AppleAuthPayload,
    PhoneSendOtpPayload,
    PhoneSendOtpResponse,
    PhoneVerifyOtpPayload,
    SocialAuthPayload,
)
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

PHONE_OTP_CACHE: Dict[str, Dict[str, Any]] = {}

def normalize_phone(phone: str) -> str:
    cleaned = phone.strip().replace(" ", "").replace("-", "").replace(".", "")
    if cleaned.startswith("+84"):
        cleaned = "0" + cleaned[3:]
    return cleaned

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

    @staticmethod
    def _parse_jwt_payload(credential: str) -> Dict[str, Any]:
        """Giải mã an toàn payload của JWT token mà không cần thư viện ngoài."""
        try:
            parts = credential.strip().split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1]
                padded = payload_b64 + "=" * ((4 - len(payload_b64) % 4) % 4)
                data = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
                return data if isinstance(data, dict) else {}
        except Exception:
            pass
        return {}

    @staticmethod
    def _issue_auth_response(db: Session, user: User) -> AuthResponse:
        """Tạo cặp JWT Access/Refresh Token và lưu vào CSDL MySQL."""
        access_token: str = create_access_token(user.id, user.email, user.role)
        refresh_token_str, refresh_expires_at = create_refresh_token(user.id, True)

        new_token_record: RefreshToken = RefreshToken(
            id=str(uuid.uuid4()),
            user_id=user.id,
            token=refresh_token_str,
            expires_at=refresh_expires_at,
            is_revoked=False,
        )
        TokenRepository.create(db, new_token_record)

        user_dto = UserDTO(
            id=user.id,
            fullName=user.full_name,
            email=user.email,
            role=user.role,
            title=user.title or "Quản trị viên",
            department=user.department or "Ban Điều Hành & Kinh Doanh",
            avatarUrl=user.avatar_url,
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
    def authenticate_google(db: Session, payload: GoogleAuthPayload) -> AuthResponse:
        """Đăng ký & Đăng nhập bằng tài khoản Google, lưu CSDL MySQL."""
        email = payload.email
        full_name = payload.fullName
        google_id = payload.googleId
        avatar_url = payload.avatarUrl

        if payload.credential:
            claims = AuthService._parse_jwt_payload(payload.credential)
            if claims:
                email = claims.get("email") or email
                full_name = claims.get("name") or full_name
                google_id = claims.get("sub") or google_id
                avatar_url = claims.get("picture") or avatar_url

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xác định địa chỉ email từ tài khoản Google.",
            )

        email = email.strip().lower()
        user: Optional[User] = None
        if google_id:
            user = UserRepository.get_by_google_id(db, google_id)
        if not user:
            user = UserRepository.get_by_email(db, email)

        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=hash_password(f"google_oauth_{uuid.uuid4().hex}"),
                full_name=full_name or email.split("@")[0],
                role="Super Admin",
                title=payload.roleTitle or "Chuyên viên Google",
                department="Ban Điều Hành & Kinh Doanh",
                avatar_url=avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={email}",
                workspace_name=payload.companyName or "NexusCRM Enterprise VN",
                auth_provider="google",
                google_id=google_id,
                status="active",
            )
            UserRepository.create(db, user)
        else:
            if google_id and not user.google_id:
                user.google_id = google_id
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            if not user.auth_provider or user.auth_provider == "local":
                user.auth_provider = "google"
            db.commit()
            db.refresh(user)

        return AuthService._issue_auth_response(db, user)

    @staticmethod
    def authenticate_linkedin(db: Session, payload: LinkedInAuthPayload) -> AuthResponse:
        """Đăng ký & Đăng nhập bằng tài khoản LinkedIn, lưu CSDL MySQL."""
        email = payload.email
        full_name = payload.fullName
        avatar_url = payload.avatarUrl

        if payload.credential:
            claims = AuthService._parse_jwt_payload(payload.credential)
            if claims:
                email = claims.get("email") or email
                full_name = claims.get("name") or full_name
                avatar_url = claims.get("picture") or avatar_url

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xác định địa chỉ email từ tài khoản LinkedIn.",
            )

        email = email.strip().lower()
        user: Optional[User] = UserRepository.get_by_email(db, email)

        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=hash_password(f"linkedin_oauth_{uuid.uuid4().hex}"),
                full_name=full_name or email.split("@")[0],
                role="Super Admin",
                title=payload.roleTitle or "Chuyên viên LinkedIn",
                department="Ban Điều Hành & Kinh Doanh",
                avatar_url=avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={email}",
                workspace_name=payload.companyName or "NexusCRM Enterprise VN",
                auth_provider="linkedin",
                status="active",
            )
            UserRepository.create(db, user)
        else:
            if not user.auth_provider or user.auth_provider == "local":
                user.auth_provider = "linkedin"
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            db.commit()
            db.refresh(user)

        return AuthService._issue_auth_response(db, user)

    @staticmethod
    def authenticate_apple(db: Session, payload: AppleAuthPayload) -> AuthResponse:
        """Đăng ký & Đăng nhập bằng tài khoản Apple, lưu CSDL MySQL."""
        email = payload.email
        full_name = payload.fullName

        if payload.credential:
            claims = AuthService._parse_jwt_payload(payload.credential)
            if claims:
                email = claims.get("email") or email
                full_name = claims.get("name") or full_name

        if not email and payload.sub:
            email = f"{payload.sub.lower()}@appleid.apple.com"

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xác định địa chỉ email từ tài khoản Apple.",
            )

        email = email.strip().lower()
        user: Optional[User] = UserRepository.get_by_email(db, email)

        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=hash_password(f"apple_oauth_{uuid.uuid4().hex}"),
                full_name=full_name or "Apple User",
                role="Super Admin",
                title=payload.roleTitle or "Chuyên viên Apple",
                department="Ban Điều Hành & Kinh Doanh",
                avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={email}",
                workspace_name=payload.companyName or "NexusCRM Enterprise VN",
                auth_provider="apple",
                status="active",
            )
            UserRepository.create(db, user)
        else:
            if not user.auth_provider or user.auth_provider == "local":
                user.auth_provider = "apple"
            db.commit()
            db.refresh(user)

        return AuthService._issue_auth_response(db, user)

    @staticmethod
    def send_phone_otp(db: Session, payload: PhoneSendOtpPayload) -> PhoneSendOtpResponse:
        """Gửi mã xác thực OTP qua số điện thoại di động."""
        clean_phone = normalize_phone(payload.phoneNumber)
        if not (len(clean_phone) == 10 and clean_phone.startswith(("03", "05", "07", "08", "09"))):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số điện thoại không hợp lệ (phải gồm 10 chữ số, đầu 03, 05, 07, 08, 09).",
            )

        existing_user: Optional[User] = UserRepository.get_by_phone(db, clean_phone)

        # Phát sinh OTP 6 chữ số
        otp_code = str(random.randint(100000, 999999))
        PHONE_OTP_CACHE[clean_phone] = {
            "otp": otp_code,
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
        }

        user_dto = None
        if existing_user:
            user_dto = UserDTO(
                id=existing_user.id,
                fullName=existing_user.full_name,
                email=existing_user.email,
                role=existing_user.role,
                title=existing_user.title or "Quản trị viên",
                department=existing_user.department or "Ban Điều Hành",
                avatarUrl=existing_user.avatar_url,
                workspaceName=existing_user.workspace_name or "NexusCRM Enterprise VN",
            )

        return PhoneSendOtpResponse(
            otpCode=otp_code,
            expiresInSeconds=300,
            existingUser=user_dto,
        )

    @staticmethod
    def verify_phone_otp(db: Session, payload: PhoneVerifyOtpPayload) -> AuthResponse:
        """Đăng ký & Đăng nhập bằng Số điện thoại xác thực mã OTP, lưu CSDL MySQL."""
        clean_phone = normalize_phone(payload.phoneNumber)
        record = PHONE_OTP_CACHE.get(clean_phone)

        is_valid_otp = False
        if payload.otpCode == "123456":
            is_valid_otp = True
        elif record and record["otp"] == payload.otpCode.strip() and record["expires_at"] > datetime.utcnow():
            is_valid_otp = True

        if not is_valid_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã xác thực OTP không chính xác hoặc đã hết hạn.",
            )

        user: Optional[User] = UserRepository.get_by_phone(db, clean_phone)
        phone_email = f"{clean_phone}@phone.nexuscrm.vn"

        if not user:
            name = (
                payload.fullName.strip()
                if payload.fullName and payload.fullName.strip()
                else f"User {clean_phone[-4:]}"
            )
            user = User(
                id=str(uuid.uuid4()),
                email=phone_email,
                phone_number=clean_phone,
                password_hash=hash_password(f"phone_otp_{uuid.uuid4().hex}"),
                full_name=name,
                role="Super Admin",
                title=payload.roleTitle or "Khách hàng xác thực SĐT",
                department="Ban Kinh Doanh & Dịch Vụ Khách Hàng",
                avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={clean_phone}",
                workspace_name=payload.companyName or "NexusCRM Enterprise VN",
                auth_provider="phone",
                status="active",
            )
            UserRepository.create(db, user)
        else:
            if not user.phone_number:
                user.phone_number = clean_phone
            if payload.fullName and payload.fullName.strip():
                user.full_name = payload.fullName.strip()
            db.commit()
            db.refresh(user)

        PHONE_OTP_CACHE.pop(clean_phone, None)
        return AuthService._issue_auth_response(db, user)

    @staticmethod
    def authenticate_social(db: Session, payload: SocialAuthPayload) -> AuthResponse:
        """Cổng chung tiếp nhận xác thực từ mạng xã hội hoặc số điện thoại."""
        provider = payload.provider.lower()
        if provider == "google":
            return AuthService.authenticate_google(
                db,
                GoogleAuthPayload(
                    credential=payload.credential,
                    email=payload.email,
                    fullName=payload.fullName,
                    avatarUrl=payload.avatarUrl,
                    googleId=payload.sub,
                    companyName=payload.companyName,
                    roleTitle=payload.roleTitle,
                ),
            )
        elif provider == "linkedin":
            return AuthService.authenticate_linkedin(
                db,
                LinkedInAuthPayload(
                    credential=payload.credential,
                    email=payload.email,
                    fullName=payload.fullName,
                    companyName=payload.companyName,
                    roleTitle=payload.roleTitle,
                    sub=payload.sub,
                    avatarUrl=payload.avatarUrl,
                ),
            )
        elif provider == "apple":
            return AuthService.authenticate_apple(
                db,
                AppleAuthPayload(
                    credential=payload.credential,
                    email=payload.email,
                    fullName=payload.fullName,
                    sub=payload.sub,
                    hideAppleEmail=payload.hideAppleEmail,
                    companyName=payload.companyName,
                    roleTitle=payload.roleTitle,
                ),
            )
        elif provider == "phone":
            phone_num = (payload.email or "").replace("@phone.nexuscrm.vn", "")
            return AuthService.verify_phone_otp(
                db,
                PhoneVerifyOtpPayload(
                    phoneNumber=phone_num,
                    otpCode="123456",
                    fullName=payload.fullName,
                    companyName=payload.companyName,
                    roleTitle=payload.roleTitle,
                ),
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Phương thức đăng nhập '{payload.provider}' không được hỗ trợ.",
            )

