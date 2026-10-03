# routers/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.user_service import UserService
from schemas.user import UserCreateSchema, UserUpdateSchema, UserResponseSchema

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("", response_model=UserResponseSchema, status_code=201)
def create_user_record(
    payload: UserCreateSchema,
    db: Session = Depends(get_db),
) -> UserResponseSchema:
    """Tạo người dùng mới."""
    service = UserService(db)
    return service.create_user(payload)


@router.put("/{user_id}", response_model=UserResponseSchema)
def update_user_record(
    user_id: int,
    payload: UserUpdateSchema,
    db: Session = Depends(get_db),
) -> UserResponseSchema:
    """
    Cập nhật thông tin người dùng. Sửa đổi vai trò người dùng (role)
    sẽ tự động ghi lại nhật ký thay đổi (Audit Log).
    """
    service = UserService(db)
    return service.update_user_role(user_id, payload)
