from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.routers import auth_router, customers_router, deals_router, dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tự động tạo các bảng trong CSDL nếu chưa tồn tại
    try:
        Base.metadata.create_all(bind=engine)
        print("[DATABASE] Đã kết nối và đồng bộ cấu trúc bảng thành công.")
    except Exception as exc:
        print(f"[DATABASE WARNING] Không thể tự động tạo bảng: {exc}")
        print("[DATABASE TIP] Hãy chắc chắn MySQL Server đang chạy và database nexuscrm_db đã được tạo.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=(
        "Backend API cho hệ thống NexusCRM (TTCS_K4S5_N3). "
        "Triển khai xác thực JWT an toàn, bảo vệ Brute-force 15 phút (SCRUM-32), "
        "và duy trì/thu hồi phiên đăng xuất (SCRUM-34)."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Cấu hình CORS (Cho phép Frontend React/Vite tại localhost:5173 truy cập)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount các Router API
for prefix in [settings.API_V1_STR, "/api"]:
    app.include_router(auth_router, prefix=prefix)
    app.include_router(customers_router, prefix=prefix)
    app.include_router(deals_router, prefix=prefix)
    app.include_router(dashboard_router, prefix=prefix)


@app.get("/", summary="Health Check")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docsUrl": "/docs",
        "version": "1.0.0",
        "scrum_stories": ["SCRUM-32 (Login & 15m Lockout)", "SCRUM-34 (Session & Logout Revocation)"],
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "Đã xảy ra lỗi máy chủ nội bộ.", "details": str(exc) if settings.DEBUG else None},
    )
