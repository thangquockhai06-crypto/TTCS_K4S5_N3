# schemas/audit_log.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class AuditLogBaseSchema(BaseModel):
    performed_by: str = Field(..., description="Mã người thực hiện thay đổi (User ID/Email)")
    user_name: Optional[str] = Field(None, description="Tên người thực hiện")
    user_email: Optional[str] = Field(None, description="Email người thực hiện")
    target_type: str = Field(..., description="Loại đối tượng (deal, customer, user, quota)")
    target_id: str = Field(..., description="ID của đối tượng bị thay đổi")
    field_name: str = Field(..., description="Tên trường nhạy cảm thay đổi (discount, quota, owner, role)")
    old_value: Optional[str] = Field(None, description="Giá trị trước khi thay đổi")
    new_value: Optional[str] = Field(None, description="Giá trị sau khi thay đổi")


class AuditLogCreateSchema(AuditLogBaseSchema):
    pass


class AuditLogResponseSchema(AuditLogBaseSchema):
    id: int = Field(..., description="ID duy nhất của bản ghi nhật ký")
    created_at: datetime = Field(..., description="Thời điểm ghi nhận nhật ký")

    model_config = ConfigDict(from_attributes=True)


class AuditLogFilterSchema(BaseModel):
    performed_by: Optional[str] = Field(None, description="Lọc theo người thực hiện")
    target_type: Optional[str] = Field(None, description="Lọc theo loại đối tượng (deal, customer, user, quota)")
    start_date: Optional[datetime] = Field(None, description="Thời điểm bắt đầu khoảng thời gian")
    end_date: Optional[datetime] = Field(None, description="Thời điểm kết thúc khoảng thời gian")
    page: int = Field(1, ge=1, description="Trang hiện tại")
    limit: int = Field(20, ge=1, description="Số lượng bản ghi trên một trang")


class AuditLogPaginatedResponseSchema(BaseModel):
    page: int = Field(..., description="Trang hiện tại")
    limit: int = Field(..., description="Số lượng phần tử mỗi trang")
    total_items: int = Field(..., description="Tổng số bản ghi nhật ký khớp bộ lọc")
    total_pages: int = Field(..., description="Tổng số trang")
    data: List[AuditLogResponseSchema] = Field(..., description="Danh sách nhật ký thay đổi")
