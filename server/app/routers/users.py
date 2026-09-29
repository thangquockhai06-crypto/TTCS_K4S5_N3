from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserDeactivateSchema,
    RoleAssignSchema,
    TeamAssignSchema,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["User Account Management"])


@router.get("", response_model=List[UserResponseSchema], summary="Lấy danh sách người dùng")
def get_users(
    search: Optional[str] = Query(None, description="Tìm kiếm theo họ tên hoặc email"),
    role: Optional[str] = Query(None, description="Lọc theo vai trò"),
    team: Optional[str] = Query(None, description="Lọc theo nhóm"),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái: active, inactive, locked"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[UserResponseSchema]:
    users, _ = UserService.list_users(
        db=db,
        search=search,
        role=role,
        team=team,
        status=status,
        skip=skip,
        limit=limit,
    )
    return [UserResponseSchema.model_validate(u) for u in users]


@router.post("", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED, summary="Tạo mới tài khoản người dùng")
def create_user(
    payload: UserCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponseSchema:
    user: User = UserService.create_user(db=db, payload=payload, current_user=current_user)
    return UserResponseSchema.model_validate(user)


@router.get("/{user_id}", response_model=UserResponseSchema, summary="Lấy chi tiết tài khoản người dùng")
def get_user_detail(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponseSchema:
    user: User = UserService.get_user_by_id(db=db, user_id=user_id)
    return UserResponseSchema.model_validate(user)


@router.put("/{user_id}", response_model=UserResponseSchema, summary="Cập nhật thông tin tài khoản người dùng")
def update_user(
    user_id: str,
    payload: UserUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponseSchema:
    updated_user: User = UserService.update_user(
        db=db,
        user_id=user_id,
        payload=payload,
        current_user=current_user,
    )
    return UserResponseSchema.model_validate(updated_user)


@router.delete("/{user_id}", summary="Xóa hoặc vô hiệu hóa tài khoản người dùng")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    return UserService.delete_user(db=db, user_id=user_id, current_user=current_user)


@router.post("/{user_id}/deactivate", summary="Vô hiệu hóa tài khoản và bàn giao toàn bộ dữ liệu")
def deactivate_user_endpoint(
    user_id: str,
    payload: UserDeactivateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    return UserService.deactivate_user_and_handover(
        db=db,
        target_user_id=user_id,
        payload=payload,
        current_user=current_user,
    )


@router.post("/{user_id}/roles", response_model=UserResponseSchema, summary="Gán vai trò cho người dùng")
def assign_role_endpoint(
    user_id: str,
    payload: RoleAssignSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponseSchema:
    user: User = UserService.assign_role_endpoint(
        db=db,
        user_id=user_id,
        payload=payload,
        current_user=current_user,
    )
    return UserResponseSchema.model_validate(user)


@router.post("/{user_id}/teams", response_model=UserResponseSchema, summary="Gán nhóm cho người dùng")
def assign_team_endpoint(
    user_id: str,
    payload: TeamAssignSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponseSchema:
    user: User = UserService.assign_team_endpoint(
        db=db,
        user_id=user_id,
        payload=payload,
        current_user=current_user,
    )
    return UserResponseSchema.model_validate(user)
