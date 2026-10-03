# routers/__init__.py
from routers.audit_logs import router as audit_logs_router
from routers.deals import router as deals_router
from routers.users import router as users_router

__all__ = [
    "audit_logs_router",
    "deals_router",
    "users_router",
]
