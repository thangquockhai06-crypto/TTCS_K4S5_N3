from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.deal import Deal
from app.schemas.deal import DealDTO, CreateDealDTO, MoveDealStageDTO
from app.services.deal_service import DealService

router = APIRouter(prefix="/deals", tags=["Deals Pipeline (Kanban)"])

@router.get("", response_model=List[DealDTO], summary="Lấy danh sách các cơ hội bán hàng")
def get_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[DealDTO]:
    deals: List[Deal] = DealService.get_deals(db)
    return [
        DealDTO(
            id=d.id,
            title=d.title,
            value=float(d.value),
            stage=d.stage,
            probability=d.probability,
            customerId=d.customer_id,
            ownerId=d.owner_id,
            expectedCloseDate=d.expected_close_date.isoformat() if d.expected_close_date else None,
            createdAt=d.created_at.isoformat() if d.created_at else None,
        )
        for d in deals
    ]

@router.post("", response_model=DealDTO, status_code=status.HTTP_201_CREATED, summary="Tạo mới cơ hội bán hàng")
def create_deal(
    dto: CreateDealDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DealDTO:
    deal: Deal = DealService.create_deal(db, dto, owner_id=current_user.id)
    return DealDTO(
        id=deal.id,
        title=deal.title,
        value=float(deal.value),
        stage=deal.stage,
        probability=deal.probability,
        customerId=deal.customer_id,
        ownerId=deal.owner_id,
        expectedCloseDate=deal.expected_close_date.isoformat() if deal.expected_close_date else None,
        createdAt=deal.created_at.isoformat() if deal.created_at else None,
    )

@router.patch("/{deal_id}/stage", response_model=DealDTO, summary="Di chuyển stage của deal trên bảng Kanban")
def move_stage(
    deal_id: str,
    dto: MoveDealStageDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DealDTO:
    deal: Optional[Deal] = DealService.move_stage(db, deal_id, dto.stage)
    if not deal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy deal.")
    return DealDTO(
        id=deal.id,
        title=deal.title,
        value=float(deal.value),
        stage=deal.stage,
        probability=deal.probability,
        customerId=deal.customer_id,
        ownerId=deal.owner_id,
        expectedCloseDate=deal.expected_close_date.isoformat() if deal.expected_close_date else None,
        createdAt=deal.created_at.isoformat() if deal.created_at else None,
    )
