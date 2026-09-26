# NexusCRM — Hệ thống Quản trị Quan hệ Khách hàng & Doanh thu Doanh nghiệp (Phiên bản 2026)

> **Công nghệ sử dụng:** 
> - **Frontend:** React 19 · TypeScript (Strict Mode, `0% any`) · Vite 6 · React Router DOM v7 · Framer Motion · Lucide React · Axios Interceptor
> - **Backend:** Python 3.10+ · FastAPI · SQLAlchemy 2.0 · PyMySQL · PyJWT · Bcrypt · MySQL Workbench (`nexuscrm_db`)

---

## I. Hướng Dẫn Dành Cho Thành Viên Trong Nhóm (Clone & Chạy Dự Án)

### 1. Chuẩn bị Cơ sở dữ liệu MySQL (MySQL Workbench)
1. Mở **MySQL Workbench**, kết nối vào máy chủ cục bộ (Localhost cổng `3306`).
2. Mở file `server/init_db.sql` hoặc chạy lệnh:
   ```sql
   CREATE DATABASE IF NOT EXISTS nexuscrm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Mở file `server/.env`, chỉnh sửa mật khẩu root MySQL của máy bạn:
   ```env
   DATABASE_URL="mysql+pymysql://root:MAT_KHAU_CUA_BAN@localhost:3306/nexuscrm_db?charset=utf8mb4"
   ```

### 2. Cài đặt và Chạy Backend (Python FastAPI)
Mở Terminal tại thư mục `server/` (hoặc nhấp đúp file `server/start-server.bat` trên Windows):
```bash
cd server

# Cài đặt thư viện Python
pip install -r requirements.txt

# Nạp tài khoản Admin & dữ liệu mẫu vào CSDL
python seed.py

# Khởi chạy Backend Server (http://localhost:8000)
python run.py
```
> **Tài liệu Swagger API tự động:** Truy cập `http://localhost:8000/docs` để kiểm thử toàn bộ API.

### 3. Cài đặt và Chạy Frontend (React Vite)
Mở một cửa sổ Terminal khác tại thư mục gốc của dự án:
```bash
# Cài đặt thư viện
npm install

# Khởi chạy Frontend (http://localhost:5173)
npm run dev
```
*(Trên Windows, bạn có thể nhấp đúp vào `start-all.bat` để chạy đồng thời cả Backend và Frontend).*

### 4. Tài khoản Quản trị viên (Admin) mặc định
- **Tên hiển thị:** `Quản Trị Viên Hệ Thống`
- **Email:** `admin@nexuscrm.vn`
- **Mật khẩu:** `Admin@2026`

---

## II. Tiến Độ Triển Khai & Phân Chia Công Việc

| Mã Jira | Hạng mục / Task | Mô tả chi tiết & Tiêu chí nghiệm thu | File triển khai chính | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SCRUM-32**<br>`SCRUM-100 FE`<br>`SCRUM-101 BE` | **Đăng nhập hệ thống & Khóa 15 phút** | - Đăng nhập đúng vào trang chủ tương ứng với vai trò.<br>- Sai thông tin hiển thị thông báo chung (Anti-Enumeration).<br>- Khóa tạm 15 phút sau 5 lần sai liên tiếp (`lockout_until`). | **BE:** `server/app/routers/auth.py`, `auth_service.py`<br>**FE:** `src/components/auth/LoginForm.tsx`, `useCountdown.ts` | Đã hoàn thành |
| **SCRUM-34**<br>`SCRUM-102 FE`<br>`SCRUM-103 BE` | **Duy trì phiên & Đăng xuất an toàn** | - Phiên gia hạn tự động qua Refresh Token khi còn hoạt động.<br>- Đăng xuất vô hiệu hóa phiên ngay lập tức phía server (`refresh_tokens.is_revoked`).<br>- Phiên hết hạn điều hướng về đăng nhập kèm thông báo. | **BE:** `server/app/routers/auth.py`, `models/token.py`<br>**FE:** `src/utils/axiosInstance.ts`, `AuthContext.tsx` | Đã hoàn thành |
| **UI-CORE** | **Hệ thống giao diện CRM 100% Tiếng Việt** | Dashboard KPI, 50 Khách hàng 360°, Kanban Deal Pipeline, Nhật ký hoạt động, Cài đặt | `src/pages/*`, `src/components/*` | Đã hoàn thành |

---

## III. Cấu Trúc Thư Mục Chuẩn Toàn Dự Án

```text
TTCS_K4S5_N3/
├── server/                          # [BACKEND PYTHON - FastAPI + MySQL]
│   ├── app/
│   │   ├── config.py                # Đọc cấu hình .env (CORS, JWT, MySQL URL)
│   │   ├── database.py              # Kết nối SQLAlchemy engine & SessionLocal
│   │   ├── dependencies.py          # get_db, get_current_user (Bearer JWT)
│   │   ├── main.py                  # Khởi tạo FastAPI app, CORS, mount routers
│   │   ├── core/
│   │   │   └── security.py          # Hash mật khẩu (bcrypt), sinh & decode JWT
│   │   ├── routers/                 # API Endpoints (routes)
│   │   │   ├── auth.py              # /api/v1/auth (login, register, refresh-token, logout, me)
│   │   │   ├── customers.py         # /api/v1/customers
│   │   │   ├── deals.py             # /api/v1/deals
│   │   │   └── dashboard.py         # /api/v1/dashboard
│   │   ├── services/                # Nghiệp vụ logic chính (Business Logic)
│   │   │   ├── auth_service.py      # AuthService
│   │   │   ├── customer_service.py  # CustomerService
│   │   │   └── deal_service.py      # DealService
│   │   ├── repositories/            # Tầng truy vấn CSDL (Database Query / ORM)
│   │   │   ├── user_repository.py       # UserRepository
│   │   │   ├── token_repository.py      # TokenRepository
│   │   │   ├── customer_repository.py   # CustomerRepository
│   │   │   └── deal_repository.py       # DealRepository
│   │   ├── models/                  # Cấu trúc bảng CSDL (SQLAlchemy ORM)
│   │   │   ├── user.py              # Bảng users
│   │   │   ├── token.py             # Bảng refresh_tokens
│   │   │   ├── customer.py          # Bảng customers
│   │   │   ├── deal.py              # Bảng deals
│   │   │   └── activity.py          # Bảng activities, notes
│   │   └── schemas/                 # Pydantic Schemas / DTOs (Request Validation & Response Serialization)
│   ├── .env                         # Cấu hình môi trường (DB password, JWT key)
│   ├── init_db.sql                  # Script tạo bảng chạy trong MySQL Workbench
│   ├── requirements.txt             # Thư viện Python cần thiết
│   ├── run.py                       # Chạy server với Uvicorn
│   ├── seed.py                      # Nạp tài khoản Admin & dữ liệu mẫu vào CSDL
│   └── start-server.bat             # Chạy nhanh Backend bằng 1 cú nhấp chuột
│
├── src/                             # [FRONTEND REACT 19 + VITE]
│   ├── components/                  # auth, common, customer, dashboard, layout
│   ├── context/                     # AuthContext, CRMDataContext
│   ├── hooks/                       # useAuth, useCountdown...
│   ├── interfaces/                  # TypeScript interfaces
│   ├── pages/                       # Màn hình chức năng
│   ├── routes/                      # AppRoutes (Protected routes)
│   ├── styles/                      # CSS Design System
│   └── utils/                       # axiosInstance (gọi Backend hoặc Mock)
│
├── start-all.bat                    # Script khởi chạy đồng thời cả Backend và Frontend
├── package.json
└── tsconfig.json
```
