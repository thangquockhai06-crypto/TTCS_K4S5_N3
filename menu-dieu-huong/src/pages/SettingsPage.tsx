import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  KeyRound,
  Laptop,
  LogOut,
  Palette,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { Avatar, Badge, Button, Card, Input } from '../components/common';
import { UserManagementPanel } from '../components/users/UserManagementPanel';
import { useCRMData } from '../context/CRMDataContext';
import { useAuth } from '../hooks/useAuth';
import { INotificationPreference, ISecuritySession } from '../interfaces';
import styles from './SettingsPage.module.css';

type SettingsSectionType = 'profile' | 'appearance' | 'notification' | 'security' | 'users';

const INITIAL_NOTIF_PREFS: ReadonlyArray<INotificationPreference> = [
  {
    id: 'pref-1',
    title: 'Thay đổi giai đoạn cơ hội lớn',
    description: 'Thông báo khi cơ hội >$100K ARR chuyển sang Đang đàm phán hoặc Chốt thành công.',
    emailEnabled: true,
    inAppEnabled: true,
    slackEnabled: true,
  },
  {
    id: 'pref-2',
    title: 'Nhắc tên trực tiếp (@mention)',
    description: 'Cảnh báo tức thì khi đồng nghiệp gắn thẻ bạn trong ghi chú khách hàng hoặc biên bản QBR.',
    emailEnabled: true,
    inAppEnabled: true,
    slackEnabled: true,
  },
  {
    id: 'pref-3',
    title: 'Cảnh báo sụt giảm điểm sức khỏe khách hàng',
    description: 'Cảnh báo khi một khách hàng doanh nghiệp đang hợp tác bị giảm điểm sức khỏe xuống dưới 65%.',
    emailEnabled: true,
    inAppEnabled: true,
    slackEnabled: false,
  },
  {
    id: 'pref-4',
    title: 'Bảo mật & Luân chuyển phiên JWT',
    description: 'Ghi nhật ký kiểm toán khi có thiết bị mới đăng nhập hoặc làm mới Refresh Token.',
    emailEnabled: false,
    inAppEnabled: true,
    slackEnabled: false,
  },
];

const INITIAL_SESSIONS: ReadonlyArray<ISecuritySession> = [
  {
    id: 'sess-1',
    device: 'Máy trạm Windows 11 Enterprise',
    browser: 'Chrome 134.0 · 64-bit',
    ipAddress: '14.161.42.108',
    location: 'Hà Nội, Việt Nam',
    lastActive: 'Đang hoạt động',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    device: 'MacBook Pro M4 Max · 16"',
    browser: 'Trình duyệt Arc · macOS',
    ipAddress: '113.190.232.18',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    lastActive: '2 giờ trước',
    isCurrent: false,
  },
];

export const SettingsPage: React.FC = () => {
  const {
    user,
    accessToken,
    refreshToken,
    lastTokenRefresh,
    updateUserProfile,
    triggerMockTokenRefresh,
    logout,
  } = useAuth();
  const { appearance, updateAppearance } = useCRMData();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SettingsSectionType>('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? 'Quản Trị Viên Hệ Thống',
    title: user?.title ?? 'Giám đốc Điều hành Hệ thống CRM',
    department: user?.department ?? 'Ban Quản trị & Vận hành Doanh thu',
    workspaceName: user?.workspaceName ?? 'Nexus Cloud Enterprise',
  });
  const [savedBanner, setSavedBanner] = useState<boolean>(false);

  const [notifPrefs, setNotifPrefs] = useState<INotificationPreference[]>(
    () => [...INITIAL_NOTIF_PREFS]
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  const [sessions, setSessions] = useState<ISecuritySession[]>(() => [...INITIAL_SESSIONS]);
  const [isRefreshingJwt, setIsRefreshingJwt] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    updateUserProfile(profileForm);
    setSavedBanner(true);
    window.setTimeout(() => setSavedBanner(false), 2500);
  };

  const toggleNotifChannel = (
    id: string,
    channel: 'emailEnabled' | 'inAppEnabled' | 'slackEnabled'
  ): void => {
    setNotifPrefs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [channel]: !item[channel] } : item
      )
    );
  };

  const handleRotateJwt = async (): Promise<void> => {
    setIsRefreshingJwt(true);
    try {
      await triggerMockTokenRefresh();
    } finally {
      setIsRefreshingJwt(false);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <header className={styles.header}>
        <h1 className={styles.header__title}>Cài đặt hệ thống & Tài khoản</h1>
        <p className={styles.header__subtitle}>
          Quản lý hồ sơ quản trị viên, giao diện hiển thị, kênh thông báo và chính sách bảo mật phiên
          JWT (S1-02).
        </p>
      </header>

      <div className={styles.settingsGrid}>
        {/* Left Side Navigation */}
        <nav className={styles.sideNav} aria-label="Danh mục cài đặt">
          <button
            type="button"
            className={`${styles.sideNav__btn} ${
              activeSection === 'profile' ? styles['sideNav__btn--active'] : ''
            }`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={17} />
            <div>
              <strong>Hồ sơ cá nhân</strong>
              <span>Thông tin & chức danh</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.sideNav__btn} ${
              activeSection === 'appearance' ? styles['sideNav__btn--active'] : ''
            }`}
            onClick={() => setActiveSection('appearance')}
          >
            <Palette size={17} />
            <div>
              <strong>Giao diện hiển thị</strong>
              <span>Chế độ sáng/tối & màu chủ đạo</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.sideNav__btn} ${
              activeSection === 'notification' ? styles['sideNav__btn--active'] : ''
            }`}
            onClick={() => setActiveSection('notification')}
          >
            <Bell size={17} />
            <div>
              <strong>Cấu hình thông báo</strong>
              <span>Email, Slack & Trong ứng dụng</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.sideNav__btn} ${
              activeSection === 'security' ? styles['sideNav__btn--active'] : ''
            }`}
            onClick={() => setActiveSection('security')}
          >
            <ShieldCheck size={17} />
            <div>
              <strong>Bảo mật & Phiên JWT</strong>
              <span>Xác thực 2 lớp & Token S1-02</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.sideNav__btn} ${
              activeSection === 'users' ? styles['sideNav__btn--active'] : ''
            }`}
            onClick={() => setActiveSection('users')}
          >
            <Users size={17} />
            <div>
              <strong>Quản trị Người dùng & Bàn giao</strong>
              <span>Vai trò, Nhóm KD & Khóa tài khoản</span>
            </div>
          </button>
        </nav>

        {/* Right Side Content Area */}
        <div className={styles.contentColumn}>
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.panelStack}
            >
              <Card padding="lg">
                <div className={styles.profileTop}>
                  <Avatar
                    src={user?.avatarUrl}
                    name={profileForm.fullName}
                    size="xl"
                    status="online"
                  />
                  <div>
                    <h2 className={styles.cardHeading}>{profileForm.fullName}</h2>
                    <p className={styles.cardSub}>
                      {user?.email} · <Badge tone="primary">{user?.role}</Badge>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className={styles.profileForm}>
                  <div className={styles.formGrid2}>
                    <Input
                      label="Họ và tên hiển thị"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                    />
                    <Input
                      label="Chức danh công việc"
                      value={profileForm.title}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                    <Input
                      label="Phòng ban / Bộ phận"
                      value={profileForm.department}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                    />
                    <Input
                      label="Tên không gian làm việc (Workspace)"
                      value={profileForm.workspaceName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          workspaceName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.formFooter}>
                    {savedBanner && (
                      <span className={styles.savedFeedback}>
                        <Check size={15} /> Đã lưu cập nhật hồ sơ thành công
                      </span>
                    )}
                    <Button type="submit" variant="primary">
                      Lưu thay đổi hồ sơ
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.panelStack}
            >
              <Card padding="lg" className={styles.panelStack}>
                <div>
                  <h2 className={styles.cardHeading}>Chủ đề giao diện & Mật độ hiển thị</h2>
                  <p className={styles.cardSub}>
                    Tùy chỉnh bề mặt không gian làm việc NexusCRM và độ tương phản màu sắc.
                  </p>
                </div>

                <div className={styles.themeCardsGrid}>
                  <button
                    type="button"
                    className={`${styles.themeChoice} ${
                      appearance.theme === 'light' ? styles['themeChoice--active'] : ''
                    }`}
                    onClick={() => updateAppearance({ theme: 'light' })}
                  >
                    <div className={styles.themePreviewLight} />
                    <strong>Giao diện Sáng (#F6F8FB)</strong>
                    <span>Độ tương phản cao, tối ưu ban ngày</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.themeChoice} ${
                      appearance.theme === 'dark' ? styles['themeChoice--active'] : ''
                    }`}
                    onClick={() => updateAppearance({ theme: 'dark' })}
                  >
                    <div className={styles.themePreviewDark} />
                    <strong>Giao diện Tối (#0B0F19)</strong>
                    <span>Chống mỏi mắt trên màn hình OLED</span>
                  </button>
                </div>

                <div className={styles.settingRow}>
                  <div>
                    <strong>Màu nhấn thương hiệu (Accent Color)</strong>
                    <p>Màu chủ đạo trên các nút bấm, biểu đồ và trạng thái đang chọn</p>
                  </div>
                  <div className={styles.colorSwatches}>
                    {(
                      [
                        { hex: '#2563EB', name: 'Xanh Hoàng Gia' },
                        { hex: '#8B5CF6', name: 'Tím Violet' },
                        { hex: '#10B981', name: 'Xanh Ngọc Lục Bảo' },
                        { hex: '#0EA5E9', name: 'Xanh Đại Dương' },
                      ] as const
                    ).map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        style={{ backgroundColor: swatch.hex }}
                        className={`${styles.colorSwatch} ${
                          appearance.accentColor === swatch.hex
                            ? styles['colorSwatch--selected']
                            : ''
                        }`}
                        onClick={() => updateAppearance({ accentColor: swatch.hex })}
                        aria-label={`Chọn màu ${swatch.name}`}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div>
                    <strong>Mật độ bảng thu gọn (Compact Density)</strong>
                    <p>Thu hẹp khoảng cách dòng để hiển thị nhiều dữ liệu hơn trên màn hình lớn</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={appearance.density === 'compact'}
                    className={`${styles.modernToggle} ${
                      appearance.density === 'compact' ? styles['modernToggle--on'] : ''
                    }`}
                    onClick={() =>
                      updateAppearance({
                        density:
                          appearance.density === 'compact' ? 'comfortable' : 'compact',
                      })
                    }
                  >
                    <span className={styles.modernToggle__thumb} />
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'notification' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.panelStack}
            >
              <Card padding="lg" className={styles.panelStack}>
                <div>
                  <h2 className={styles.cardHeading}>Ma trận phân phối thông báo</h2>
                  <p className={styles.cardSub}>
                    Tùy chọn kênh nhận tín hiệu cơ hội bán hàng và nhắc tên theo thời gian thực.
                  </p>
                </div>

                <div className={styles.notifTable}>
                  {notifPrefs.map((pref) => (
                    <div key={pref.id} className={styles.notifRow}>
                      <div className={styles.notifRow__info}>
                        <strong>{pref.title}</strong>
                        <p>{pref.description}</p>
                      </div>

                      <div className={styles.notifRow__toggles}>
                        {(
                          [
                            { key: 'emailEnabled', label: 'Email' },
                            { key: 'inAppEnabled', label: 'Ứng dụng' },
                            { key: 'slackEnabled', label: 'Slack' },
                          ] as const
                        ).map((ch) => (
                          <div key={ch.key} className={styles.channelToggle}>
                            <span>{ch.label}</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={pref[ch.key]}
                              aria-label={`${pref.title} ${ch.label}`}
                              className={`${styles.modernToggle} ${
                                pref[ch.key] ? styles['modernToggle--on'] : ''
                              }`}
                              onClick={() => toggleNotifChannel(pref.id, ch.key)}
                            >
                              <span className={styles.modernToggle__thumb} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.panelStack}
            >
              {/* S1-02 Token Management & Axios Interceptor Card */}
              <Card padding="lg" className={styles.panelStack}>
                <div className={styles.securityHeader}>
                  <div>
                    <Badge tone="success" dot>
                      S1-02 · AXIOS INTERCEPTOR ĐANG HOẠT ĐỘNG
                    </Badge>
                    <h2 className={styles.cardHeading}>
                      Trình kiểm tra Phiên JWT & Tự động làm mới Token
                    </h2>
                    <p className={styles.cardSub}>
                      Kiểm tra trực tiếp token lưu trong `localStorage` qua `AuthContext.tsx` và thử
                      nghiệm cơ chế tự động xoay vòng token khi gặp mã lỗi 401 trong `axiosInstance.ts`.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={
                      <RefreshCw
                        size={14}
                        className={isRefreshingJwt ? styles.spin : ''}
                      />
                    }
                    onClick={() => void handleRotateJwt()}
                  >
                    Mô phỏng lỗi 401 & Làm mới Token
                  </Button>
                </div>

                <div className={styles.tokenBox}>
                  <div className={styles.tokenRow}>
                    <span>
                      <KeyRound size={13} /> Access Token (`nexus_crm_access_token`)
                    </span>
                    <Badge tone="primary" size="sm">
                      {lastTokenRefresh ?? 'Đang hiệu lực'}
                    </Badge>
                  </div>
                  <code className={styles.tokenCode}>{accessToken ?? 'Chưa có'}</code>

                  <div className={styles.tokenRow}>
                    <span>Refresh Token (`nexus_crm_refresh_token`)</span>
                    <Badge tone="accent" size="sm">
                      Lưu trữ LocalStorage Mock
                    </Badge>
                  </div>
                  <code className={styles.tokenCode}>{refreshToken ?? 'Chưa có'}</code>
                </div>

                <div className={styles.settingRow}>
                  <div>
                    <strong>Bắt buộc Khóa bảo mật & Xác thực 2 lớp (2FA)</strong>
                    <p>Yêu cầu xác minh WebAuthn / Authenticator khi đăng nhập trên thiết bị lạ</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={twoFactorEnabled}
                    className={`${styles.modernToggle} ${
                      twoFactorEnabled ? styles['modernToggle--on'] : ''
                    }`}
                    onClick={() => setTwoFactorEnabled((prev) => !prev)}
                  >
                    <span className={styles.modernToggle__thumb} />
                  </button>
                </div>
              </Card>

              {/* Active Sessions */}
              <Card padding="lg" className={styles.panelStack}>
                <div className={styles.securityHeader}>
                  <div>
                    <h3 className={styles.cardHeading}>Thiết bị đang đăng nhập</h3>
                    <p className={styles.cardSub}>
                      Danh sách các phiên thiết bị đang kết nối vào tài khoản quản trị của bạn.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<LogOut size={14} />}
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    Đăng xuất & Xóa Token (S1-02)
                  </Button>
                </div>

                <div className={styles.sessionList}>
                  {sessions.map((s) => (
                    <div key={s.id} className={styles.sessionItem}>
                      <Laptop size={20} className={styles.sessionItem__icon} />
                      <div className={styles.sessionItem__info}>
                        <strong>
                          {s.device}{' '}
                          {s.isCurrent && (
                            <Badge tone="success" size="sm">
                              Phiên hiện tại
                            </Badge>
                          )}
                        </strong>
                        <span>
                          {s.browser} · {s.ipAddress} ({s.location}) · {s.lastActive}
                        </span>
                      </div>
                      {!s.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSessions((prev) => prev.filter((item) => item.id !== s.id))
                          }
                        >
                          Thu hồi quyền
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.panelStack}
            >
              <UserManagementPanel />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
