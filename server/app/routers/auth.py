from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginPayload,
    RegisterPayload,
    RefreshTokenPayload,
    AuthResponse,
    RefreshTokenResponseDTO,
    UserDTO,
    MessageResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Session"])

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Đăng nhập hệ thống (SCRUM-32 / SCRUM-101)",
    description=(
        "Đăng nhập bằng email công ty và mật khẩu. "
        "Sai mật khẩu 5 lần liên tiếp sẽ bị khóa 15 phút. "
        "Không tiết lộ email có tồn tại hay không (Anti-Enumeration)."
    ),
)
def login(payload: LoginPayload, db: Session = Depends(get_db)) -> AuthResponse:
    return AuthService.authenticate_user(db, payload)

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản doanh nghiệp mới",
)
def register(payload: RegisterPayload, db: Session = Depends(get_db)) -> AuthResponse:
    return AuthService.register_user(db, payload)

@router.post(
    "/refresh-token",
    response_model=RefreshTokenResponseDTO,
    summary="Gia hạn phiên tự động khi còn hoạt động (SCRUM-34 / SCRUM-103)",
    description="Cấp mới Access Token khi token cũ hết hạn, bảo đảm người dùng không bị mất phiên.",
)
def refresh_token(payload: RefreshTokenPayload, db: Session = Depends(get_db)) -> RefreshTokenResponseDTO:
    return AuthService.refresh_access_token(db, payload.refreshToken)

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Đăng xuất làm mất hiệu lực phiên ngay lập tức phía server (SCRUM-34 / SCRUM-103)",
)
def logout(
    payload: Optional[RefreshTokenPayload] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    refresh_token_str: Optional[str] = payload.refreshToken if payload else None
    AuthService.logout(db, current_user.id, refresh_token_str)
    return MessageResponse(message="Đã đăng xuất và hủy phiên an toàn trên máy chủ.")

@router.get(
    "/me",
    response_model=UserDTO,
    summary="Lấy thông tin tài khoản hiện tại qua Access Token",
)
def get_me(current_user: User = Depends(get_current_user)) -> UserDTO:
    return UserDTO(
        id=current_user.id,
        fullName=current_user.full_name,
        email=current_user.email,
        role=current_user.role,
        title=current_user.title or "Quản trị viên",
        department=current_user.department or "Vận hành",
        avatarUrl=current_user.avatar_url,
        workspaceName=current_user.workspace_name or "NexusCRM Enterprise VN",
        teamId=getattr(current_user, "team_id", None),
        dataScope=getattr(current_user, "data_scope", None),
    )

@router.get(
    "/session-heartbeat",
    summary="Kiểm tra nhịp tim phiên hoạt động (Heartbeat)",
)
def session_heartbeat(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "status": "active",
        "email": current_user.email,
        "role": current_user.role,
        "authenticated": True,
    }
