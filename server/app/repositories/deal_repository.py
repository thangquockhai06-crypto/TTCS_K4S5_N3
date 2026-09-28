from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.deal import Deal

class DealRepository:
    """
    Tầng Repository xử lý truy vấn dữ liệu Cơ hội bán hàng (Kanban Deal Pipeline).
    Tuân thủ Clean Layered Architecture & 100% Type Hints.
    """

    @staticmethod
    def get_all(db: Session) -> List[Deal]:
        return db.query(Deal).order_by(Deal.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, deal_id: str) -> Optional[Deal]:
        return db.query(Deal).filter(Deal.id == deal_id).first()

    @staticmethod
    def create(db: Session, deal: Deal) -> Deal:
        db.add(deal)
        db.commit()
        db.refresh(deal)
        return deal

    @staticmethod
    def update_stage(db: Session, deal: Deal, new_stage: str) -> Deal:
        deal.stage = new_stage
        db.commit()
        db.refresh(deal)
        return deal

    @staticmethod
    def count_all(db: Session) -> int:
        return db.query(Deal).count()

    @staticmethod
    def get_total_pipeline_value(db: Session) -> float:
        total = db.query(func.sum(Deal.value)).scalar()
        return float(total) if total is not None else 0.0
