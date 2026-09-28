from routers.audit_logs import router as audit_logs_router
from routers.deals import router as deals_router
from routers.users import router as users_router
from routers.auth import router as auth_router, router_v1 as auth_router_v1

__all__ = [
    "audit_logs_router",
    "deals_router",
    "users_router",
    "auth_router",
    "auth_router_v1",
]

