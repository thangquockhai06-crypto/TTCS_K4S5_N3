from app.routers.auth import router as auth_router
from app.routers.customers import router as customers_router
from app.routers.deals import router as deals_router
from app.routers.dashboard import router as dashboard_router

__all__ = ["auth_router", "customers_router", "deals_router", "dashboard_router"]
