# services/deal_service.py
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.deal import Deal
from repositories.deal_repository import DealRepository
from schemas.deal import DealCreateSchema, DealUpdateSchema, DealResponseSchema


class DealService:
    """
    Service handling deal pipeline operations and modifications to sensitive fields (discount, quota, owner).
    """

    def __init__(self, db: Session) -> None:
        self.db: Session = db
        self.repository: DealRepository = DealRepository(db)

    def create_deal(self, payload: DealCreateSchema) -> DealResponseSchema:
        """Create a new commercial deal."""
        new_deal = Deal(
            title=payload.title,
            customer_id=payload.customer_id,
            stage=payload.stage,
            value=payload.value,
            discount=payload.discount,
            quota=payload.quota,
            owner=payload.owner,
        )
        created_deal = self.repository.create(new_deal)
        return DealResponseSchema.model_validate(created_deal)

    def update_deal(self, deal_id: int, payload: DealUpdateSchema) -> DealResponseSchema:
        """
        Updates deal properties. Any updates to discount, quota, or owner
        will automatically trigger SQLAlchemy after_update audit logging.
        """
        deal = self.repository.get_by_id(deal_id)
        if not deal:
            raise HTTPException(
                status_code=404,
                detail=f"Thương vụ có mã ID '{deal_id}' không tồn tại trên hệ thống."
            )

        if payload.title is not None:
            deal.title = payload.title
        if payload.stage is not None:
            deal.stage = payload.stage
        if payload.value is not None:
            deal.value = payload.value
        if payload.discount is not None:
            deal.discount = payload.discount
        if payload.quota is not None:
            deal.quota = payload.quota
        if payload.owner is not None:
            deal.owner = payload.owner

        updated_deal = self.repository.update(deal)
        return DealResponseSchema.model_validate(updated_deal)

    def get_deal(self, deal_id: int) -> DealResponseSchema:
        """Fetch deal by ID."""
        deal = self.repository.get_by_id(deal_id)
        if not deal:
            raise HTTPException(
                status_code=404,
                detail=f"Thương vụ có mã ID '{deal_id}' không tồn tại."
            )
        return DealResponseSchema.model_validate(deal)
