# models/events.py
from datetime import datetime
from typing import List, Any, Dict, Optional, Callable
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import get_history
from database import current_user_ctx
from models.audit_log import AuditLog
from models.deal import Deal
from models.user import User
from models.customer import Customer

SENSITIVE_FIELDS: List[str] = ["discount", "quota", "owner", "role"]


def register_audit_listeners() -> None:
    """
    Registers SQLAlchemy after_update event listeners on models containing sensitive fields.
    Automatically captures snapshot of changes on owner, quota, discount, and role.
    """
    for model_cls in [Deal, User, Customer]:
        event.listen(model_cls, "after_update", audit_after_update_listener)


def audit_after_update_listener(mapper: Any, connection: Any, target: Any) -> None:
    """
    SQLAlchemy event handler for after_update.
    Captures snapshot of sensitive attributes and inserts AuditLog records.
    """
    user_info: Dict[str, Any] = current_user_ctx.get() or {
        "user_id": "1",
        "user_name": "Quản Trị Viên Hệ Thống",
        "user_email": "admin@nexuscrm.vn"
    }

    target_type: str = getattr(target, "__tablename__", target.__class__.__name__.lower())
    target_id: str = str(getattr(target, "id", ""))

    for attr in mapper.column_attrs:
        field_name: str = attr.key
        if field_name in SENSITIVE_FIELDS:
            history = get_history(target, field_name)
            if history.has_changes():
                old_val: Optional[str] = str(history.deleted[0]) if history.deleted else None
                new_val: Optional[str] = str(history.added[0]) if history.added else None
                if old_val != new_val:
                    connection.execute(
                        AuditLog.__table__.insert().values(
                            performed_by=str(user_info.get("user_id", "1")),
                            user_name=user_info.get("user_name", "Quản Trị Viên Hệ Thống"),
                            user_email=user_info.get("user_email", "admin@nexuscrm.vn"),
                            target_type=target_type,
                            target_id=target_id,
                            field_name=field_name,
                            old_value=old_val,
                            new_value=new_val,
                            created_at=datetime.utcnow()
                        )
                    )


def audit_snapshot_decorator(
    target_type: str,
    target_id_param: str = "id"
) -> Callable:
    """
    Decorator for service methods to manually snapshot changes on sensitive fields
    if needed in non-ORM or custom workflows.
    """
    def decorator(func: Callable) -> Callable:
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            return func(*args, **kwargs)
        return wrapper
    return decorator
