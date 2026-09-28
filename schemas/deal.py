# schemas/deal.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DealBaseSchema(BaseModel):
    title: str = Field(..., description="Tên cơ hội / thương vụ")
    customer_id: str = Field(..., description="Mã khách hàng")
    stage: str = Field("New", description="Giai đoạn thương vụ")
    value: float = Field(0.0, description="Giá trị thương vụ")
    discount: float = Field(0.0, description="Tỷ lệ chiết khấu (%)")
    quota: float = Field(0.0, description="Chỉ tiêu doanh thu")
    owner: str = Field("System Owner", description="Quyền sở hữu thương vụ")


class DealCreateSchema(DealBaseSchema):
    pass


class DealUpdateSchema(BaseModel):
    title: Optional[str] = Field(None, description="Tên cơ hội")
    stage: Optional[str] = Field(None, description="Giai đoạn thương vụ")
    value: Optional[float] = Field(None, description="Giá trị thương vụ")
    discount: Optional[float] = Field(None, description="Cập nhật chiết khấu (%)")
    quota: Optional[float] = Field(None, description="Cập nhật chỉ tiêu")
    owner: Optional[str] = Field(None, description="Thay đổi quyền sở hữu")


class DealResponseSchema(DealBaseSchema):
    id: int = Field(..., description="ID thương vụ")
    created_at: datetime = Field(..., description="Ngày tạo")
    updated_at: datetime = Field(..., description="Ngày cập nhật")

    model_config = ConfigDict(from_attributes=True)
