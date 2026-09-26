from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.customer import Customer
from app.models.activity import Activity, Note

class CustomerRepository:
    """
    Tầng Repository xử lý truy vấn dữ liệu khách hàng, ghi chú và hoạt động.
    Tuân thủ Clean Layered Architecture & 100% Type Hints.
    """

    @staticmethod
    def get_all(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Customer], int]:
        query = db.query(Customer)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Customer.full_name.ilike(search_pattern),
                    Customer.email.ilike(search_pattern),
                    Customer.phone.ilike(search_pattern),
                    Customer.company.ilike(search_pattern),
                )
            )

        if status and status.lower() != "all":
            query = query.filter(Customer.status == status.lower())

        total = query.count()
        customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
        return customers, total

    @staticmethod
    def get_by_id(db: Session, customer_id: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def create(db: Session, customer: Customer) -> Customer:
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update_status(db: Session, customer: Customer, new_status: str) -> Customer:
        customer.status = new_status
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def add_note(db: Session, note: Note) -> Note:
        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def add_activity(db: Session, activity: Activity) -> Activity:
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def count_all(db: Session) -> int:
        return db.query(Customer).count()

    @staticmethod
    def count_by_status(db: Session, status: str) -> int:
        return db.query(Customer).filter(Customer.status == status.lower()).count()
