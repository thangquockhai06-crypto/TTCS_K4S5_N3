# models/user.py
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime
from database import Base


class User(Base):
    """
    Model representing system users & access privileges.
    Contains sensitive field: role (Vai trò người dùng).
    """
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name: str = Column(String(150), nullable=False)
    email: str = Column(String(150), unique=True, index=True, nullable=False)
    group: str = Column(String(100), nullable=False, default="Default Group")
    role: str = Column(String(50), nullable=False, default="Viewer")  # Sensitive field: Vai trò người dùng
    status: str = Column(String(50), nullable=False, default="active")
    auth_provider: str = Column(String(50), nullable=False, default="local")
    google_id: Optional[str] = Column(String(100), nullable=True, index=True)
    avatar_url: Optional[str] = Column(String(500), nullable=True)
    hashed_password: Optional[str] = Column(String(255), nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
