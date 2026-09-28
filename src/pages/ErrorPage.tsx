import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  code: 401 | 403 | 404;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ code }) => {
  const navigate = useNavigate();

  const errorInfo = {
    401: {
      title: 'Bạn chưa đăng nhập',
      message: 'Vui lòng đăng nhập để tiếp tục sử dụng hệ thống.',
      button: 'Đăng nhập',
      action: () => navigate('/login'),
    },
    403: {
      title: 'Không có quyền truy cập',
      message: 'Bạn không có quyền truy cập chức năng hoặc trang này.',
      button: 'Quay lại',
      action: () => navigate(-1),
    },
    404: {
      title: 'Không tìm thấy trang',
      message: 'Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.',
      button: 'Về trang chủ',
      action: () => navigate('/dashboard'),
    },
  };

  const current = errorInfo[code];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '40px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#2563eb',
          }}
        >
          {code}
        </div>

        <h1>{current.title}</h1>

        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
          {current.message}
        </p>

        <button
          type="button"
          onClick={current.action}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: '#2563eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {current.button}
        </button>
      </div>
    </div>
  );
};