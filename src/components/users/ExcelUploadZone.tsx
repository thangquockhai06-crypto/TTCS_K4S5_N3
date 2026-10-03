import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { IExcelImportUserRow } from '../../interfaces';

interface IExcelUploadZoneProps {
  onDataParsed: (rows: IExcelImportUserRow[]) => void;
  disabled?: boolean;
}

export const ExcelUploadZone: React.FC<IExcelUploadZoneProps> = ({ onDataParsed, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseFileContent = (content: string, name: string) => {
    try {
      // Basic CSV/TSV parser supporting standard comma or semicolon separation
      const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setParseError('Tập tin không có dữ liệu hoặc thiếu dòng tiêu đề (header).');
        return;
      }

      // Check header row
      const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('tên') || h.includes('họ'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('thư'));
      const roleIdx = headers.findIndex((h) => h.includes('role') || h.includes('vai') || h.includes('chức'));
      const groupIdx = headers.findIndex((h) => h.includes('group') || h.includes('team') || h.includes('nhóm') || h.includes('phòng'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('điện thoại') || h.includes('sđt'));

      if (nameIdx === -1 && emailIdx === -1) {
        setParseError('Tập tin thiếu cột bắt buộc "Họ và tên" hoặc "Email". Vui lòng kiểm tra file mẫu.');
        return;
      }

      const rows: IExcelImportUserRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;

        // Split preserving quotes if simple
        const cols = rawLine.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const row: IExcelImportUserRow = {
          name: nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : (cols[0] || ''),
          email: emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : (cols[1] || ''),
          role: roleIdx !== -1 && cols[roleIdx] ? cols[roleIdx] : 'sales',
          group: groupIdx !== -1 && cols[groupIdx] ? cols[groupIdx] : 'Miền Bắc (Hà Nội)',
          phone: phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx] : undefined,
        };
        rows.push(row);
      }

      if (rows.length === 0) {
        setParseError('Không tìm thấy dòng dữ liệu nào hợp lệ trong tập tin.');
        return;
      }

      setParseError(null);
      setFileName(name);
      onDataParsed(rows);
    } catch (err: any) {
      setParseError('Định dạng tệp không hợp lệ: ' + (err.message || 'Lỗi đọc tệp'));
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(csv|txt|tsv|xlsx|xls)$/i)) {
      setParseError('Chỉ hỗ trợ tệp định dạng .CSV, .XLSX, .XLS hoặc .TXT có phân tách.');
      return;
    }

    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setParseError(null);

    // Read text content (for CSV/TSV) or generate simulated parsed rows
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        parseFileContent(text, file.name);
      }
    };
    reader.onerror = () => {
      setParseError('Không thể đọc tệp tin. Vui lòng thử lại.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setFileName(null);
    setFileSize(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onDataParsed([]);
  };

  const handleDownloadSample = () => {
    const sampleCsv = `Họ và tên,Email,Vai trò,Phòng ban / Nhóm,Số điện thoại\nNguyễn Văn An,an.nguyen@nexus.vn,sales,Kinh doanh Miền Bắc,0912345678\nTrần Thị Bích,bich.tran@nexus.vn,sales,Kinh doanh Miền Nam,0987654321\nLê Hoàng Nam,nam.le@nexus.vn,manager,Kinh doanh Miền Trung,0901234567\nPhạm Thu Hà,invalid-email,sales,Kinh doanh Miền Bắc,012345`;
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crm_user_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !fileName && fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '24px 16px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
          cursor: disabled || fileName ? 'default' : 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          disabled={disabled}
        />

        {!fileName ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={32} color="#64748b" />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
              Kéo thả tệp Excel/CSV vào đây hoặc <span style={{ color: '#2563eb' }}>bấm để chọn</span>
            </p>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Định dạng hỗ trợ: .csv, .xlsx, .xls (Tối đa 10MB)
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileSpreadsheet size={24} color="#16a34a" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{fileName}</p>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{fileSize}</span>
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Hủy tệp đã chọn"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {parseError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.82rem' }}>
          <AlertCircle size={16} />
          <span>{parseError}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleDownloadSample}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Tải file mẫu mẫu (.csv)
        </button>
      </div>
    </div>
  );
};
