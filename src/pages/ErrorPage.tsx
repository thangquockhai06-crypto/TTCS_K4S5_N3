import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  Home,
  Lightbulb,
  LogIn,
  Mail,
  ShieldAlert,
  Users,
} from 'lucide-react';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
  code: 401 | 403 | 404 | 500;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ code }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accessRequested, setAccessRequested] = useState(false);

  const handleRequestAccess = (): void => {
    setAccessRequested(true);
    window.alert(
      'Yêu cầu cấp quyền đã được gửi thành công đến Quản trị viên hệ thống (admin@nexuscrm.vn). Bạn sẽ nhận được email phản hồi khi được phê duyệt!'
    );
  };

  const config = {
    401: {
      badge: 'Mã lỗi 401 · Chưa xác thực',
      badgeClass: styles.badge401,
      iconClass: styles.iconWrapper401,
      icon: <LogIn size={36} />,
      title: 'Bạn chưa đăng nhập vào NexusCRM',
      description:
        'Phiên làm việc của bạn đã hết hạn hoặc bạn chưa thực hiện đăng nhập vào hệ thống. Vui lòng đăng nhập để tiếp tục truy cập.',
      suggestions: [
        'Nhấn nút "Đăng nhập ngay" bên dưới để chuyển đến màn hình xác thực.',
        'Sử dụng tài khoản Email, Google, hoặc Số điện thoại đã được đăng ký.',
        'Nếu bạn quên mật khẩu, hãy liên hệ Quản trị viên để nhận lại mã truy cập.',
      ],
      primaryBtnText: 'Đăng nhập ngay',
      primaryAction: () => navigate('/login'),
    },
    403: {
      badge: 'Mã lỗi 403 · Không đủ quyền hạn',
      badgeClass: styles.badge403,
      iconClass: styles.iconWrapper403,
      icon: <ShieldAlert size={36} />,
      title: 'Tài khoản không đủ quyền hạn truy cập',
      description:
        'Bạn đang cố gắng truy cập vào khu vực hoặc chức năng được bảo vệ nghiêm ngặt (dành riêng cho Quản trị viên hoặc Trưởng nhóm phụ trách). Thay vì gặp một trang trắng, hệ thống hiển thị thông báo này để hướng dẫn bạn.',
      suggestions: [
        'Liên hệ Quản trị viên hệ thống (admin@nexuscrm.vn) để đăng ký bổ sung quyền hạn.',
        'Nếu bạn sở hữu tài khoản quản trị khác, hãy đăng xuất và đăng nhập lại bằng tài khoản đó.',
        'Quay trở lại Bảng điều khiển tổng quan hoặc các trang bạn đã được phân quyền.',
      ],
      primaryBtnText: 'Về Bảng điều khiển',
      primaryAction: () => navigate('/dashboard'),
    },
    404: {
      badge: 'Mã lỗi 404 · Truy cập nhầm chỗ',
      badgeClass: styles.badge404,
      iconClass: styles.iconWrapper404,
      icon: <Compass size={36} />,
      title: 'Đường dẫn không tồn tại hoặc đã di chuyển',
      description: `Đường dẫn "${location.pathname}" bạn vừa truy cập không tồn tại trên hệ thống. Thay vì để người dùng gặp trang trắng hoang mang, NexusCRM cung cấp các giải pháp điều hướng ngay bên dưới.`,
      suggestions: [
        'Kiểm tra lại tính chính xác của thanh địa chỉ URL trên trình duyệt.',
        'Truy cập phân hệ "Quản lý Người dùng" nếu bạn đang tìm kiếm nhân sự hoặc phân quyền địa bàn.',
        'Quay về Bảng điều khiển trung tâm hoặc sử dụng thanh điều hướng bên trái.',
      ],
      primaryBtnText: 'Về Bảng điều khiển',
      primaryAction: () => navigate('/dashboard'),
    },
    500: {
      badge: 'Mã lỗi 500 · Sự cố máy chủ',
      badgeClass: styles.badge403,
      iconClass: styles.iconWrapper403,
      icon: <ShieldAlert size={36} />,
      title: 'Đã xảy ra sự cố từ máy chủ hệ thống',
      description:
        'Máy chủ Backend đang gặp sự cố tạm thời hoặc cơ sở dữ liệu đang bận xử lý. Yêu cầu của bạn chưa thể hoàn thành lúc này.',
      suggestions: [
        'Nhấn nút "Tải lại trang" để thử gửi lại yêu cầu.',
        'Kiểm tra dịch vụ Backend (Python FastAPI tại cổng 8000).',
        'Nếu sự cố tiếp tục xảy ra, vui lòng thông báo cho bộ phận Kỹ thuật hệ thống.',
      ],
      primaryBtnText: 'Tải lại trang',
      primaryAction: () => window.location.reload(),
    },
  };

  const current = config[code];

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className={`${styles.iconWrapper} ${current.iconClass}`}>
          {current.icon}
        </div>

        <span className={`${styles.errorCodeBadge} ${current.badgeClass}`}>
          {current.badge}
        </span>

        <h1 className={styles.title}>{current.title}</h1>
        <p className={styles.description}>{current.description}</p>

        {/* Hướng dẫn việc nên làm tiếp theo thay vì gặp trang trắng */}
        <div className={styles.suggestionCard}>
          <div className={styles.suggestionHeader}>
            <Lightbulb size={16} style={{ color: '#d97706' }} />
            <span>Bạn nên làm gì tiếp theo?</span>
          </div>
          <ul className={styles.suggestionList}>
            {current.suggestions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Các nút hành động rõ ràng */}
        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={current.primaryAction}
          >
            <Home size={16} />
            <span>{current.primaryBtnText}</span>
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigate('/users')}
          >
            <Users size={16} />
            <span>Quản lý Người dùng</span>
          </button>

          {code === 403 && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleRequestAccess}
              disabled={accessRequested}
            >
              <Mail size={16} />
              <span>{accessRequested ? 'Đã gửi yêu cầu' : 'Yêu cầu cấp quyền'}</span>
            </button>
          )}

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  );
};