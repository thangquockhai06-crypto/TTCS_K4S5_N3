import React, { useRef, useState } from 'react';
import { Camera, Trash2, AlertCircle, Check } from 'lucide-react';

interface IAvatarUploaderProps {
  currentAvatarUrl?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const AvatarUploader: React.FC<IAvatarUploaderProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // S2-03: Max 2MB check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `Kích thước ảnh (${(file.size / 1024 / 1024).toFixed(2)}MB) vượt quá dung lượng tối đa 2MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Chỉ hỗ trợ tệp định dạng hình ảnh (PNG, JPG, WEBP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setErrorMessage(null);

    // Read and preview 1:1
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        onAvatarChange(result);
        setSuccessNotice(true);
        window.setTimeout(() => setSuccessNotice(false), 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    const defaultAvatar =
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces';
    setPreviewUrl(defaultAvatar);
    onAvatarChange(defaultAvatar);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* 1:1 Aspect Ratio Preview Frame */}
        <div
          style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            flexShrink: 0,
            backgroundColor: '#f1f5f9',
          }}
        >
          <img
            src={previewUrl}
            alt="Ảnh đại diện"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              aspectRatio: '1 / 1',
              display: 'block',
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={disabled}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <Camera size={14} />
              Tải ảnh mới
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                fontSize: '0.8rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <Trash2 size={13} />
              Gỡ ảnh
            </button>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Định dạng PNG, JPG hoặc WEBP. Tối đa 2MB. Tỉ lệ khung hình vuông 1:1.
          </span>
        </div>
      </div>

      {/* Validation error */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#dc2626',
            fontSize: '0.8rem',
            backgroundColor: '#fef2f2',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success feedback */}
      {successNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#15803d',
            fontSize: '0.8rem',
          }}
        >
          <Check size={14} />
          <span>Đã nạp ảnh mới thành công (xem trước). Hãy lưu thay đổi để cập nhật.</span>
        </div>
      )}
    </div>
  );
};
