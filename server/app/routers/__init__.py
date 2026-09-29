from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.customers import router as customers_router
from app.routers.deals import router as deals_router
from app.routers.opportunities import router as opportunities_router
from app.routers.activities import router as activities_router
from app.routers.quotations import router as quotations_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "users_router",
    "customers_router",
    "deals_router",
    "opportunities_router",
    "activities_router",
    "quotations_router",
    "dashboard_router",
]
