# routers/audit_logs.py
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.audit_log_service import AuditLogService
from schemas.audit_log import AuditLogPaginatedResponseSchema

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])


@router.get("", response_model=AuditLogPaginatedResponseSchema)
def get_audit_logs(
    performed_by: Optional[str] = Query(None, description="Lọc theo người thực hiện (User ID, Tên hoặc Email)"),
    target_type: Optional[str] = Query(None, description="Lọc theo loại đối tượng (deal, customer, user, quota)"),
    start_date: Optional[datetime] = Query(None, description="Lọc từ ngày (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Lọc đến ngày (ISO format)"),
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    limit: int = Query(20, ge=1, description="Mặc định 20 bản ghi/trang"),
    db: Session = Depends(get_db),
) -> AuditLogPaginatedResponseSchema:
    """
    API xem nhật ký thay đổi trên dữ liệu nhạy cảm dành cho Quản trị hệ thống.
    Cho phép lọc theo người dùng thực hiện, loại đối tượng, và khoảng thời gian.
    """
    service = AuditLogService(db)
    return service.get_audit_logs(
        performed_by=performed_by,
        target_type=target_type,
        start_date=start_date,
        end_date=end_date,
        page=page,
        limit=limit,
    )
