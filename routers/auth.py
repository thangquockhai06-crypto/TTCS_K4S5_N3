# routers/auth.py
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import GoogleAuthRequest, LoginRequest, RefreshTokenRequest, TokenResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
router_v1 = APIRouter(prefix="/api/v1/auth", tags=["Authentication v1"])


def get_token_from_header(authorization: Optional[str] = Header(None)) -> str:
    """Extracts bearer token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu tiêu đề Authorization: Bearer <token> để truy cập.",
        )
    return authorization.split(" ")[1]


@router.post("/google", response_model=TokenResponse, summary="Đăng nhập & Xác thực bằng Google")
@router_v1.post("/google", response_model=TokenResponse, include_in_schema=False)
def login_with_google(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Xác thực và đăng nhập người dùng thông qua tài khoản Google OAuth 2.0 / OpenID Connect.
    Hỗ trợ cả Google ID Token (GSI credential) và thông tin tài khoản được chọn.
    Tự động liên kết tài khoản vào cơ sở dữ liệu, ghi Audit Log và cấp JWT tokens.
    """
    service = AuthService(db)
    return service.authenticate_google(payload)


@router.post("/login", response_model=TokenResponse, summary="Đăng nhập tài khoản truyền thống")
@router_v1.post("/login", response_model=TokenResponse, include_in_schema=False)
def login_local(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Đăng nhập bằng Email và Mật khẩu."""
    service = AuthService(db)
    return service.authenticate_local(payload)


@router.post("/refresh", response_model=TokenResponse, summary="Làm mới Access Token")
@router_v1.post("/refresh", response_model=TokenResponse, include_in_schema=False)
def refresh_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Làm mới Access Token khi hết hạn bằng Refresh Token."""
    service = AuthService(db)
    return service.refresh_access_token(payload.refresh_token)


@router.get("/me", summary="Lấy thông tin người dùng đang đăng nhập")
@router_v1.get("/me", include_in_schema=False)
def get_current_user_profile(
    token: str = Depends(get_token_from_header),
    db: Session = Depends(get_db),
):
    """Lấy thông tin hồ sơ người dùng hiện tại dựa trên Bearer Access Token."""
    service = AuthService(db)
    user = service.get_current_user_by_token(token)
    return {
        "id": f"usr-{user.id}",
        "fullName": user.name,
        "email": user.email,
        "role": user.role,
        "group": user.group,
        "status": user.status,
        "auth_provider": user.auth_provider,
        "avatarUrl": user.avatar_url,
        "created_at": user.created_at,
    }
