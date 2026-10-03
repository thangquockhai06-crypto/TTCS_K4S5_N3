# models/audit_log.py
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base


class AuditLog(Base):
    """
    Model representing system audit logs for tracking changes on sensitive data fields:
    discount, quota, owner, and role.
    """
    __tablename__ = "audit_logs"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    performed_by: str = Column(String(100), nullable=False, index=True)
    user_name: Optional[str] = Column(String(150), nullable=True)
    user_email: Optional[str] = Column(String(150), nullable=True)
    target_type: str = Column(String(50), nullable=False, index=True)  # e.g., 'deal', 'customer', 'user', 'quota'
    target_id: str = Column(String(100), nullable=False, index=True)
    field_name: str = Column(String(50), nullable=False, index=True)   # 'discount', 'quota', 'owner', 'role'
    old_value: Optional[str] = Column(Text, nullable=True)
    new_value: Optional[str] = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
