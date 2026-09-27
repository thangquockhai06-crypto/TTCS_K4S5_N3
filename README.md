# NexusCRM — Hệ thống Quản trị Quan hệ Khách hàng & Doanh thu Doanh nghiệp (Phiên bản 2026)

> **Công nghệ sử dụng:** React 19 · TypeScript (Strict Mode, `0% any`) · Vite 6 · React Router DOM v7 · CSS Modules (BEM) · Framer Motion · Lucide React · Axios Interceptor (Mock-driven)

---

## I. Hướng Dẫn Dành Cho Thành Viên Trong Nhóm (Clone & Chạy Dự Án)

### 1. Cài đặt và chạy môi trường phát triển (Local Dev)
Sau khi `git clone` dự án về máy, mở Terminal tại thư mục gốc của dự án và chạy:

```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển (http://localhost:5173)
npm run dev
```

*(Trên Windows, bạn cũng có thể nhấp đúp vào file `start-crm.bat` hoặc nhấn phím `F5` trong VS Code).*

### 2. Kiểm tra kiểu dữ liệu & đóng gói Production
```bash
# Kiểm tra TypeScript Strict Mode (đảm bảo 0 lỗi, không sử dụng any)
npm run typecheck

# Đóng gói bản Production
npm run build
```

### 3. Tài khoản Quản trị viên (Admin) mặc định & Đăng nhập Đa phương thức
- **Tên hiển thị:** `Quản Trị Viên Hệ Thống`
- **Email:** `admin@nexuscrm.vn`
- **Mật khẩu:** `Admin@2026`
- **Đăng ký tài khoản mới:** Tạo tài khoản trực tiếp tại trang **Đăng ký (`/register`)**.
- **Đăng nhập / Đăng ký bằng Mạng xã hội & Số điện thoại (OAuth 2.0 / OIDC):**
  - Hỗ trợ 4 phương thức: **Google cá nhân**, **Apple ID**, **LinkedIn**, và **Số điện thoại (SMS OTP)**.
  - Thiết kế chuẩn **Google Identity Services (GSI) Account Chooser** (`#g_id_onload`, giải mã JWT ID Token chuẩn OpenID Connect).
  - Người dùng có thể chọn mục **"Sử dụng một tài khoản ... khác"** để tự thêm/liên kết tài khoản thực tế của mình vào dữ liệu hệ thống (`localStorage`) và đăng nhập nhanh cho các lần tiếp theo (mã OTP thử nghiệm cho Số điện thoại: `123456`).

---

## II. Tiến Độ Triển Khai & Phân Chia Công Việc

| Hạng mục / Mã Task | Mô tả chức năng | File triển khai chính | Trạng thái |
| :--- | :--- | :--- | :--- |
| **S1-01** | **Đăng nhập & Đăng ký hệ thống** (Live Validation, khóa 15 phút khi sai 5 lần) | - `src/components/auth/LoginForm.tsx`<br>- `src/components/auth/RegisterForm.tsx`<br>- `src/hooks/useCountdown.ts`<br>- `src/pages/LoginPage.tsx`<br>- `src/pages/RegisterPage.tsx` | Đã hoàn thành |
| **S1-02** | **Duy trì phiên JWT & Tự động Refresh Token / Đăng xuất** | - `src/utils/axiosInstance.ts`<br>- `src/context/AuthContext.tsx`<br>- `src/hooks/useAuth.ts` | Đã hoàn thành |
| **S1-03** | **Xác thực OAuth 2.0 / OIDC & Số điện thoại** (Google, Apple, LinkedIn, SMS OTP — Cho phép người dùng tự kết nối & lưu tài khoản vào dữ liệu hệ thống) | - `src/components/auth/SocialPhoneAuthSection.tsx`<br>- `src/components/auth/SocialPhoneAuthSection.module.css`<br>- `src/components/auth/LoginForm.tsx`<br>- `src/components/auth/RegisterForm.tsx` | Đã hoàn thành |
| **UI-CORE** | **Hệ thống giao diện CRM 100% Tiếng Việt** (Dashboard, 50 Khách hàng, Chi tiết 360°, Thêm khách hàng, Kanban Deal Pipeline, Nhật ký, Báo cáo, Cài đặt) | - `src/components/layout/*`<br>- `src/components/customer/*`<br>- `src/components/dashboard/*`<br>- `src/pages/*` | Đã hoàn thành |

---

## III. Cấu Trúc Thư Mục Chuẩn

```text
src/
├── components/
│   ├── auth/          # LoginForm, RegisterForm, SocialPhoneAuthSection (OAuth 2.0 / OIDC & SĐT)
│   ├── common/        # Button, Input, Badge, Avatar, Card, Modal, Drawer, SearchBar, EmptyState
│   ├── customer/      # CustomerCard, CustomerDetailPanel, DealPipeline
│   ├── dashboard/     # StatCard, MiniCharts, ActivityFeed
│   └── layout/        # AppLayout, Sidebar (đóng/mở 100%), TopBar, BottomNav
├── context/           # AuthContext, CRMDataContext
├── hooks/             # useAuth, useCountdown, useCustomerSearch, useDebounce, useSidebar
├── interfaces/        # Định nghĩa TypeScript interfaces (auth, customer, deal, dashboard)
├── mock/              # Dữ liệu mẫu Tiếng Việt (auth.mock, customers, deals, dashboard.mock)
├── pages/             # 9 màn hình chính của ứng dụng
├── routes/            # Cấu hình React Router DOM & ProtectedRoute
├── styles/            # Design System CSS Variables (variables.css, global.css, animations.css)
└── utils/             # axiosInstance (Interceptor S1-02), formatters, validators
```
