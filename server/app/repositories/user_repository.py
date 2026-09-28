from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    """
    Tầng Repository xử lý truy vấn CSDL cho bảng User (SCRUM-32 / SCRUM-101).
    Tuân thủ Clean Layered Architecture & 100% Type Hints.
    """

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.strip().lower()).first()

    @staticmethod
    def get_by_phone(db: Session, phone_number: str) -> Optional[User]:
        clean = phone_number.strip().replace(" ", "").replace("+84", "0")
        return db.query(User).filter(
            (User.phone_number == clean) | 
            (User.email == f"{clean}@phone.nexuscrm.vn")
        ).first()

    @staticmethod
    def get_by_google_id(db: Session, google_id: str) -> Optional[User]:
        return db.query(User).filter(User.google_id == google_id).first()

    @staticmethod
    def create(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def increment_failed_attempts(db: Session, user: User) -> int:
        user.failed_attempts += 1
        db.commit()
        db.refresh(user)
        return user.failed_attempts

    @staticmethod
    def lock_user(db: Session, user: User, lockout_until: datetime) -> None:
        user.lockout_until = lockout_until
        db.commit()
        db.refresh(user)

    @staticmethod
    def reset_failed_attempts(db: Session, user: User) -> None:
        user.failed_attempts = 0
        user.lockout_until = None
        db.commit()
        db.refresh(user)

    @staticmethod
    def count_all(db: Session) -> int:
        return db.query(User).count()
