# routers/deals.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.deal_service import DealService
from schemas.deal import DealCreateSchema, DealUpdateSchema, DealResponseSchema

router = APIRouter(prefix="/api/deals", tags=["Deals"])


@router.post("", response_model=DealResponseSchema, status_code=201)
def create_deal(
    payload: DealCreateSchema,
    db: Session = Depends(get_db),
) -> DealResponseSchema:
    """Tạo mới một thương vụ / chỉ tiêu."""
    service = DealService(db)
    return service.create_deal(payload)


@router.put("/{deal_id}", response_model=DealResponseSchema)
def update_deal(
    deal_id: int,
    payload: DealUpdateSchema,
    db: Session = Depends(get_db),
) -> DealResponseSchema:
    """
    Cập nhật thương vụ. Thay đổi trên chiết khấu (discount), chỉ tiêu (quota),
    hoặc quyền sở hữu (owner) sẽ tự động chụp snapshot vào Audit Log.
    """
    service = DealService(db)
    return service.update_deal(deal_id, payload)


@router.get("/{deal_id}", response_model=DealResponseSchema)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
) -> DealResponseSchema:
    """Lấy chi tiết thương vụ theo ID."""
    service = DealService(db)
    return service.get_deal(deal_id)
