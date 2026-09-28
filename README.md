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
