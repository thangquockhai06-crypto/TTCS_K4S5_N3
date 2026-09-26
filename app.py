# app.py
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

app = FastAPI()

# ---------------------------------------------------------
# 1. Thông báo rõ ràng khi truy cập nhầm chỗ (404) & Không đủ quyền (403)
# ---------------------------------------------------------
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "NOT_FOUND",
            "message": f"Đường dẫn '{request.url.path}' không tồn tại trên hệ thống.",
            "suggestion": "Vui lòng kiểm tra lại đường dẫn URL hoặc quay lại trang chủ (/)."
        }
    )

@app.exception_handler(403)
async def custom_403_handler(request: Request, exc):
    return JSONResponse(
        status_code=403,
        content={
            "error": "FORBIDDEN",
            "message": "Tài khoản của bạn không có đủ quyền để truy cập tài nguyên này.",
            "suggestion": "Vui lòng liên hệ Quản trị viên (Admin) để đăng ký cấp quyền."
        }
    )

# Giả lập cơ sở dữ liệu người dùng
db_users = []

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    group: str
    role: str

# ---------------------------------------------------------
# 2. Tạo tài khoản, gửi email kích hoạt & từ chối email trùng
# ---------------------------------------------------------
@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    # Email trùng bị từ chối kèm thông báo cụ thể
    if any(u["email"] == user.email for u in db_users):
        raise HTTPException(
            status_code=400,
            detail=f"Email '{user.email}' đã được sử dụng trong hệ thống. Vui lòng thử email khác."
        )
    
    # Tạo mật khẩu tạm
    temp_password = str(uuid.uuid4())[:8]
    
    new_user = {
        "id": len(db_users) + 1,
        "name": user.name,
        "email": user.email,
        "group": user.group,
        "role": user.role,
        "status": "pending_activation"
    }
    db_users.append(new_user)
    
    # Giả lập gửi email kích hoạt
    print(f"[EMAIL SERVICE] Đã gửi email kích hoạt đến '{user.email}' với mật khẩu tạm: {temp_password}")
    
    return {
        "message": "Tạo tài khoản thành công! Email kích hoạt kèm mật khẩu tạm đã được gửi.",
        "data": new_user
    }

# ---------------------------------------------------------
# 3. Tìm kiếm, Lọc & Phân trang danh sách (mặc định 20 dòng)
# ---------------------------------------------------------
@app.get("/users")
def get_users(
    search: Optional[str] = Query(None, description="Tìm theo tên, email, nhóm"),
    role: Optional[str] = Query(None, description="Lọc theo vai trò"),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    limit: int = Query(20, ge=1, description="Mặc định 20 dòng")
):
    results = db_users

    # Tìm theo tên, email, nhóm
    if search:
        s = search.lower()
        results = [
            u for u in results
            if s in u["name"].lower() or s in u["email"].lower() or s in u["group"].lower()
        ]

    # Lọc theo vai trò
    if role:
        results = [u for u in results if u["role"] == role]

    # Lọc theo trạng thái
    if status:
        results = [u for u in results if u["status"] == status]

    # Phân trang (mặc định 20 dòng mỗi trang)
    total_items = len(results)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_data = results[start_idx:end_idx]

    return {
        "page": page,
        "limit": limit,
        "total_items": total_items,
        "total_pages": (total_items + limit - 1) // limit if total_items > 0 else 0,
        "data": paginated_data
    }