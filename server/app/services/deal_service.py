import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.deal import Deal
from app.schemas.deal import CreateDealDTO
from app.repositories.deal_repository import DealRepository

class DealService:
    """
    Tầng Service xử lý nghiệp vụ Quản lý Cơ hội bán hàng (Kanban Deal Pipeline).
    Tuân thủ Clean Layered Architecture & 100% Type Hints.
    """

    @staticmethod
    def get_deals(db: Session) -> List[Deal]:
        return DealRepository.get_all(db)

    @staticmethod
    def create_deal(db: Session, dto: CreateDealDTO, owner_id: str) -> Deal:
        new_deal: Deal = Deal(
            id=str(uuid.uuid4()),
            title=dto.title,
            value=dto.value,
            stage=dto.stage,
            probability=dto.probability or 20,
            customer_id=dto.customerId,
            owner_id=owner_id,
        )
        return DealRepository.create(db, new_deal)

    @staticmethod
    def move_stage(db: Session, deal_id: str, new_stage: str) -> Optional[Deal]:
        deal: Optional[Deal] = DealRepository.get_by_id(db, deal_id)
        if not deal:
            return None
        return DealRepository.update_stage(db, deal, new_stage)
