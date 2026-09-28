# models/deal.py
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class Deal(Base):
    """
    Model representing commercial deal & revenue quota pipeline.
    Contains sensitive fields: discount, quota, owner.
    """
    __tablename__ = "deals"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title: str = Column(String(200), nullable=False)
    customer_id: str = Column(String(100), nullable=False)
    stage: str = Column(String(50), nullable=False, default="New")
    value: float = Column(Float, nullable=False, default=0.0)
    discount: float = Column(Float, nullable=False, default=0.0)  # Sensitive field: Chiết khấu (%)
    quota: float = Column(Float, nullable=False, default=0.0)     # Sensitive field: Chỉ tiêu (VND/USD)
    owner: str = Column(String(150), nullable=False, default="System Owner")  # Sensitive field: Quyền sở hữu
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
