"""
Run file for NexusCRM Backend Server
Usage: python run.py
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"[*] Khởi động {settings.PROJECT_NAME} tại http://localhost:{settings.PORT}")
    print(f"[*] Tài liệu Swagger API: http://localhost:{settings.PORT}/docs")
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=settings.PORT,
        reload=False,
    )
