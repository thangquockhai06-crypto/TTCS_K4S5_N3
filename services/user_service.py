# services/user_service.py
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreateSchema, UserUpdateSchema, UserResponseSchema


class UserService:
    """
    Service handling user management and role privilege updates.
    """

    def __init__(self, db: Session) -> None:
        self.db: Session = db
        self.repository: UserRepository = UserRepository(db)

    def create_user(self, payload: UserCreateSchema) -> UserResponseSchema:
        """Create a new user."""
        existing_user = self.repository.get_by_email(payload.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"Email '{payload.email}' đã được sử dụng trong hệ thống. Vui lòng thử email khác."
            )

        new_user = User(
            name=payload.name,
            email=payload.email,
            group=payload.group,
            role=payload.role,
            status=payload.status,
        )
        created_user = self.repository.create(new_user)
        return UserResponseSchema.model_validate(created_user)

    def update_user_role(self, user_id: int, payload: UserUpdateSchema) -> UserResponseSchema:
        """
        Updates user fields (name, group, role, status).
        Modifying the 'role' field automatically triggers SQLAlchemy after_update audit logging.
        """
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"Người dùng có mã ID '{user_id}' không tồn tại trên hệ thống."
            )

        if payload.name is not None:
            user.name = payload.name
        if payload.group is not None:
            user.group = payload.group
        if payload.role is not None:
            user.role = payload.role
        if payload.status is not None:
            user.status = payload.status

        updated_user = self.repository.update(user)
        return UserResponseSchema.model_validate(updated_user)
