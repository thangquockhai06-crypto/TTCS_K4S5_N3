<<<<<<< HEAD
# Menu Điều Hướng Phân Quyền Người Dùng (RBAC Frontend)

Dự án Frontend xây dựng bằng **React + TypeScript + HTML5 + CSS3** phục vụ cho **Hệ thống Quản lý Người dùng**, đáp ứng chính xác các yêu cầu quy chuẩn kỹ thuật và bài toán phân quyền.

---

## 📌 1. Đáp ứng Quy Chuẩn Kỹ Thuật (Coding Conventions)

1. **Naming Conventions**:
   - **Component & File**: Sử dụng `PascalCase` (`UserProfileCard.tsx`, `NavigationMenu.tsx`, `SidebarNavigation.tsx`, `UserRoleSelector.tsx`, `PermissionVisualizer.tsx`).
   - **Custom Hooks**: Tiền tố `use` + `camelCase` (`useAuth.ts`, `useNavigationMenu.ts`).
   - **Interfaces / Types**: Tiền tố `I` cho interface (`IUser`, `INavigationItem`, `IUserPermission`, `IUserProfileCardProps`, `IUseAuthReturn`).
   - **CSS**: Viết theo chuẩn **BEM (Block Element Modifier)** kết hợp CSS Grid & Flexbox (`sidebar__header`, `nav-menu__item--active`, `user-profile-card__avatar`).
2. **TypeScript Rules**:
   - **Tuyệt đối 0% `any`**: Mọi props, state, event handlers, DTOs, API responses đều khai báo type/interface tường minh 100%.
3. **HTML5/CSS Responsive**:
   - Dùng các thẻ ngữ nghĩa: `<header>`, `<aside>`, `<nav>`, `<main>`, `<footer>`.
   - Layout bằng Flexbox & CSS Grid. Responsive mượt mà trên Mobile từ **360px** trở lên.

---

## 🚀 2. Hướng dẫn Mở và Chạy Dự Án trên VSCode

### Bước 1: Mở thư mục dự án trong VSCode
1. Giải nén file `menu-dieu-huong-phan-quyen-nguoi-dung.zip`.
2. Mở ứng dụng **VSCode**.
3. Chọn `File` -> `Open Folder...` và chọn thư mục `menu-dieu-huong-phan-quyen-nguoi-dung`.

### Bước 2: Cài đặt Dependencies
Mở Terminal trong VSCode (`Ctrl + ~` hoặc `Cmd + ~`) và chạy lệnh:
```bash
npm install
```

### Bước 3: Khởi chạy dự án
Chạy lệnh bên dưới để bắt đầu Server môi trường phát triển:
```bash
npm run dev
```
Sau đó truy cập đường dẫn local hiển thị trên màn hình (thường là `http://localhost:3000`).

---

## ✨ 3. Cấu trúc Thư mục Dự án

```
menu-dieu-huong-phan-quyen-nguoi-dung/
├── src/
│   ├── components/            # Các UI Components (PascalCase)
│   │   ├── Header.tsx
│   │   ├── IconMapper.tsx
│   │   ├── NavigationMenu.tsx
│   │   ├── PermissionVisualizer.tsx
│   │   ├── SidebarNavigation.tsx
│   │   ├── UserProfileCard.tsx
│   │   └── UserRoleSelector.tsx
│   ├── data/                  # Mock data mẫu người dùng & menu
│   │   └── mockData.ts
│   ├── hooks/                 # Custom hooks (camelCase)
│   │   ├── useAuth.ts
│   │   └── useNavigationMenu.ts
│   ├── styles/                # CSS BEM
│   │   └── index.css
│   ├── types/                 # TypeScript Interfaces (Prefix I)
│   │   ├── INavigationItem.ts
│   │   └── IUser.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎯 4. Các tính năng chính
- **Bộ lọc Menu theo Phân quyền (RBAC)**: Mục menu không có quyền truy cập sẽ tự động ẩn completely khỏi giao diện.
- **Hiển thị Hồ sơ Người dùng**: Tên, Vai trò (Role) và Nhóm kinh doanh (Business Group) hiển thị trực quan ở Sidebar.
- **Tương thích Mobile 360px**: Thiết kế chuẩn responsive, hỗ trợ nút toggle Drawer Mobile và bộ mô phỏng Viewport 360px ngay trên giao diện.
=======
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

### 3. Tài khoản Quản trị viên (Admin) mặc định để đăng nhập
- **Tên hiển thị:** `Quản Trị Viên Hệ Thống`
- **Email:** `admin@nexuscrm.vn`
- **Mật khẩu:** `Admin@2026`
- Ngoài ra, có thể tạo tài khoản mới trực tiếp tại trang **Đăng ký (`/register`)**.

---

## II. Tiến Độ Triển Khai & Phân Chia Công Việc

| Hạng mục / Mã Task | Mô tả chức năng | File triển khai chính | Trạng thái |
| :--- | :--- | :--- | :--- |
| **S1-01** | **Đăng nhập & Đăng ký hệ thống** (Live Validation, khóa 15 phút khi sai 5 lần) | - `src/components/auth/LoginForm.tsx`<br>- `src/components/auth/RegisterForm.tsx`<br>- `src/hooks/useCountdown.ts`<br>- `src/pages/LoginPage.tsx`<br>- `src/pages/RegisterPage.tsx` | Đã hoàn thành |
| **S1-02** | **Duy trì phiên JWT & Tự động Refresh Token / Đăng xuất** | - `src/utils/axiosInstance.ts`<br>- `src/context/AuthContext.tsx`<br>- `src/hooks/useAuth.ts` | Đã hoàn thành |
| **UI-CORE** | **Hệ thống giao diện CRM 100% Tiếng Việt** (Dashboard, 50 Khách hàng, Chi tiết 360°, Thêm khách hàng, Kanban Deal Pipeline, Nhật ký, Báo cáo, Cài đặt) | - `src/components/layout/*`<br>- `src/components/customer/*`<br>- `src/components/dashboard/*`<br>- `src/pages/*` | Đã hoàn thành |

---

## III. Cấu Trúc Thư Mục Chuẩn

```text
src/
├── components/
│   ├── auth/          # LoginForm, RegisterForm
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
>>>>>>> d2f841410afb71effb9703b50bd6f7d70a67fe62
