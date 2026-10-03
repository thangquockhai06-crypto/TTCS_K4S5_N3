# repositories/user_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from models.user import User


class UserRepository:
    """
    Repository class providing data access operations for User model.
    """

    def __init__(self, db: Session) -> None:
        self.db: Session = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self) -> List[User]:
        """Fetch all users."""
        return self.db.query(User).all()

    def create(self, user: User) -> User:
        """Create a new user record."""
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        """Update user record (triggers after_update event on role changes)."""
        self.db.commit()
        self.db.refresh(user)
        return user
