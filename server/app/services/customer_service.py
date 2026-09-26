import uuid
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.activity import Activity, Note
from app.schemas.customer import CreateCustomerDTO
from app.repositories.customer_repository import CustomerRepository

class CustomerService:
    """
    Tầng Service xử lý nghiệp vụ Quản lý Khách hàng 360°.
    Tuân thủ Clean Layered Architecture & 100% Type Hints.
    """

    @staticmethod
    def get_customers(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Customer], int]:
        return CustomerRepository.get_all(db, search=search, status=status, skip=skip, limit=limit)

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: str) -> Optional[Customer]:
        return CustomerRepository.get_by_id(db, customer_id)

    @staticmethod
    def create_customer(
        db: Session,
        dto: CreateCustomerDTO,
        assigned_user_id: Optional[str] = None,
    ) -> Customer:
        new_customer: Customer = Customer(
            id=str(uuid.uuid4()),
            full_name=dto.fullName,
            email=dto.email,
            phone=dto.phone,
            company=dto.company or "",
            status=dto.status or "lead",
            health_score=dto.healthScore or 85,
            assigned_user_id=assigned_user_id,
            avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={dto.fullName}",
        )
        return CustomerRepository.create(db, new_customer)

    @staticmethod
    def update_status(db: Session, customer_id: str, new_status: str) -> Optional[Customer]:
        customer: Optional[Customer] = CustomerRepository.get_by_id(db, customer_id)
        if not customer:
            return None
        return CustomerRepository.update_status(db, customer, new_status)

    @staticmethod
    def add_note(db: Session, customer_id: str, content: str, user_id: str) -> Note:
        new_note: Note = Note(
            id=str(uuid.uuid4()),
            customer_id=customer_id,
            author_id=user_id,
            content=content,
        )
        return CustomerRepository.add_note(db, new_note)

    @staticmethod
    def add_activity(
        db: Session,
        customer_id: str,
        activity_type: str,
        title: str,
        description: str,
        user_id: str,
    ) -> Activity:
        new_activity: Activity = Activity(
            id=str(uuid.uuid4()),
            customer_id=customer_id,
            user_id=user_id,
            type=activity_type,
            title=title,
            description=description,
        )
        return CustomerRepository.add_activity(db, new_activity)
