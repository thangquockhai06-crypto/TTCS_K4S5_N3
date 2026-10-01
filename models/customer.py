# models/customer.py
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class Customer(Base):
    """
    Model representing enterprise customers & data ownership.
    Contains sensitive field: owner (Quyền sở hữu dữ liệu).
    """
    __tablename__ = "customers"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name: str = Column(String(150), nullable=False)
    email: str = Column(String(150), nullable=False)
    company: str = Column(String(150), nullable=False)
    owner: str = Column(String(150), nullable=False)  # Sensitive field: Quyền sở hữu dữ liệu
    quota: float = Column(Float, nullable=False, default=0.0)  # Sensitive field: Chỉ tiêu
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
