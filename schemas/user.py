# schemas/user.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBaseSchema(BaseModel):
    name: str = Field(..., description="Họ và tên người dùng")
    email: EmailStr = Field(..., description="Email hệ thống")
    group: str = Field("Default Group", description="Nhóm người dùng")
    role: str = Field("Viewer", description="Vai trò hệ thống (Admin, Manager, User, Viewer)")
    status: str = Field("active", description="Trạng thái tài khoản")


class UserCreateSchema(UserBaseSchema):
    pass


class UserUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, description="Họ và tên")
    group: Optional[str] = Field(None, description="Nhóm người dùng")
    role: Optional[str] = Field(None, description="Thay đổi vai trò người dùng")
    status: Optional[str] = Field(None, description="Trạng thái")


class UserResponseSchema(UserBaseSchema):
    id: int = Field(..., description="Mã ID người dùng")
    created_at: Optional[datetime] = Field(None, description="Thời điểm tạo")
    updated_at: Optional[datetime] = Field(None, description="Thời điểm cập nhật")

    model_config = ConfigDict(from_attributes=True)
