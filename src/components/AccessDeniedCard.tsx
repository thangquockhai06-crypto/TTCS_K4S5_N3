import React from 'react';
import { IAccessDeniedProps, INavigationSuggestion } from '../types/IUser';
import { Lock, ArrowLeft, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import './AccessDeniedCard.css';

export const AccessDeniedCard: React.FC<IAccessDeniedProps> = ({
  currentRole,
  requiredRole,
  attemptedResource,
  onNavigate,
  onRequestAccess
}) => {
  const formattedRequired = Array.isArray(requiredRole) ? requiredRole.join(' HOẶC ') : requiredRole;

  const suggestions: INavigationSuggestion[] = [
    {
      id: 'home',
      label: 'Quay lại Trang chủ làm việc',
      targetPath: '/dashboard',
      description: 'Trang tổng quan trung tâm dành cho tài khoản của bạn'
    },
    {
      id: 'profile',
      label: 'Xem Trang cá nhân',
      targetPath: '/profile',
      description: 'Kiểm tra lại thông tin phân quyền tài khoản'
    }
  ];

  return (
    <article className="access-denied">
      <header className="access-denied__banner">
        <div className="access-denied__icon-wrapper">
          <Lock size={32} />
        </div>
        <h1 className="access-denied__title">Truy cập bị từ chối / Không đủ quyền hạn</h1>
        <p className="access-denied__subtitle">
          Tài khoản của bạn hiện tại không thể truy cập vào chức năng này.
        </p>
      </header>

      <section className="access-denied__content">
        <div className="access-denied__info-box">
          <div className="access-denied__info-item">
            <span className="access-denied__info-label">Chức năng yêu cầu:</span>
            <code>{attemptedResource}</code>
          </div>
          <div className="access-denied__info-item">
            <span className="access-denied__info-label">Vai trò hiện tại:</span>
            <span className="access-denied__tag access-denied__tag--current">{currentRole}</span>
          </div>
          <div className="access-denied__info-item">
            <span className="access-denied__info-label">Chức vụ cần có:</span>
            <span className="access-denied__tag access-denied__tag--required">{formattedRequired}</span>
          </div>
        </div>

        <div>
          <h3 className="access-denied__suggestions-title">
            <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Gợi ý hành động tiếp theo:
          </h3>
          <div className="access-denied__suggestions-list">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="access-denied__suggestion-item"
                onClick={() => onNavigate(item.targetPath)}
              >
                <CheckCircle2 size={20} className="access-denied__suggestion-icon" />
                <div>
                  <div className="access-denied__suggestion-label">{item.label}</div>
                  <div className="access-denied__suggestion-desc">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="access-denied__actions">
          {onRequestAccess && (
            <button
              type="button"
              className="access-denied__btn access-denied__btn--secondary"
              onClick={() => onRequestAccess(attemptedResource)}
            >
              <Send size={16} /> Gửi yêu cầu cấp quyền
            </button>
          )}
          <button
            type="button"
            className="access-denied__btn access-denied__btn--primary"
            onClick={() => onNavigate('/dashboard')}
          >
            <ArrowLeft size={16} /> Quay lại Trang chủ
          </button>
        </footer>
      </section>
    </article>
  );
};