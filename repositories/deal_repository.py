# repositories/deal_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from models.deal import Deal


class DealRepository:
    """
    Repository class providing data access operations for Deal model.
    """

    def __init__(self, db: Session) -> None:
        self.db: Session = db

    def get_by_id(self, deal_id: int) -> Optional[Deal]:
        """Fetch a deal by its primary key ID."""
        return self.db.query(Deal).filter(Deal.id == deal_id).first()

    def get_all(self) -> List[Deal]:
        """Fetch all deals."""
        return self.db.query(Deal).all()

    def create(self, deal: Deal) -> Deal:
        """Create a new deal record."""
        self.db.add(deal)
        self.db.commit()
        self.db.refresh(deal)
        return deal

    def update(self, deal: Deal) -> Deal:
        """Update an existing deal record (triggers after_update event)."""
        self.db.commit()
        self.db.refresh(deal)
        return deal
