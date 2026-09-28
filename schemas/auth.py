# schemas/auth.py
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


class GoogleAuthRequest(BaseModel):
    """Payload sent by client when authenticating with Google account."""
    credential: Optional[str] = Field(None, description="Google JWT ID Token from Google Identity Services (GSI)")
    id_token: Optional[str] = Field(None, description="Alias for credential")
    token: Optional[str] = Field(None, description="Alias for credential")
    email: Optional[EmailStr] = Field(None, description="User Google email address")
    name: Optional[str] = Field(None, description="User full name")
    avatar_url: Optional[str] = Field(None, description="Google profile picture URL")
    google_id: Optional[str] = Field(None, description="Google Subject ID (sub)")
    company_name: Optional[str] = Field("NexusCRM Enterprise VN", description="Tổ chức / Doanh nghiệp")
    role_title: Optional[str] = Field("Quản trị viên Doanh nghiệp", description="Chức danh")


class LoginRequest(BaseModel):
    """Payload for local username/password login."""
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., description="Mật khẩu tài khoản")
    remember_me: Optional[bool] = Field(True, description="Duy trì phiên đăng nhập")


class RefreshTokenRequest(BaseModel):
    """Payload for refreshing an expired access token."""
    refresh_token: str = Field(..., description="Refresh token hợp lệ")


class UserAuthProfile(BaseModel):
    """User profile structure returned in auth responses."""
    id: str = Field(..., description="Mã người dùng (usr-...)")
    fullName: str = Field(..., description="Họ và tên người dùng")
    email: str = Field(..., description="Email người dùng")
    role: str = Field("Super Admin", description="Vai trò quyền hạn")
    title: str = Field("Quản trị viên Doanh nghiệp", description="Chức vụ")
    department: str = Field("Ban Điều Hành & Kinh Doanh", description="Phòng ban")
    avatarUrl: str = Field(..., description="Đường dẫn avatar")
    workspaceName: str = Field("NexusCRM Enterprise VN", description="Tên không gian làm việc")
    auth_provider: str = Field("google", description="Phương thức xác thực")


class TokenResponse(BaseModel):
    """JWT Token response matching frontend IAuthResponse."""
    access_token: str = Field(..., description="Mã truy cập JWT Access Token")
    refresh_token: str = Field(..., description="Mã làm mới JWT Refresh Token")
    token_type: str = Field("bearer", description="Loại token")
    expires_in: int = Field(3600, description="Thời gian hiệu lực tính bằng giây")
    issued_at: str = Field(..., description="Thời điểm cấp phát token")
    user: Dict[str, Any] = Field(..., description="Thông tin người dùng đã xác thực")
