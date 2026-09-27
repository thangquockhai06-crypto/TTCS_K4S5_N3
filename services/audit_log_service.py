# services/audit_log_service.py
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from repositories.audit_log_repository import AuditLogRepository
from schemas.audit_log import AuditLogPaginatedResponseSchema, AuditLogResponseSchema


class AuditLogService:
    """
    Business logic service for managing and querying sensitive data change audit logs.
    """

    def __init__(self, db: Session) -> None:
        self.repository: AuditLogRepository = AuditLogRepository(db)

    def get_audit_logs(
        self,
        performed_by: Optional[str] = None,
        target_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        limit: int = 20,
    ) -> AuditLogPaginatedResponseSchema:
        """
        Retrieves filtered and paginated audit logs for System Administrator inspection.
        """
        records, total_items = self.repository.get_audit_logs(
            performed_by=performed_by,
            target_type=target_type,
            start_date=start_date,
            end_date=end_date,
            page=page,
            limit=limit,
        )

        total_pages: int = (total_items + limit - 1) // limit if total_items > 0 else 0

        # Convert ORM instances to Pydantic Response DTOs
        data_dtos: List[AuditLogResponseSchema] = [
            AuditLogResponseSchema.model_validate(rec) for rec in records
        ]

        return AuditLogPaginatedResponseSchema(
            page=page,
            limit=limit,
            total_items=total_items,
            total_pages=total_pages,
            data=data_dtos,
        )
