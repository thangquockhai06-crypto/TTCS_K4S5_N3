import React from 'react';
import { IUser } from '../types/IUser';
import { Key, CheckCircle2 } from 'lucide-react';

export interface IPermissionVisualizerProps {
  user: IUser;
  visibleMenuCount: number;
}

export const PermissionVisualizer: React.FC<IPermissionVisualizerProps> = ({ user, visibleMenuCount }) => {
  return (
    <div className="permission-visualizer">
      <div className="permission-visualizer__summary">
        <div className="permission-visualizer__stat">
          <span className="permission-visualizer__stat-value">{user.permissions.length}</span>
          <span className="permission-visualizer__stat-label">Quyền hạn kích hoạt</span>
        </div>
        <div className="permission-visualizer__stat">
          <span className="permission-visualizer__stat-value">{visibleMenuCount}</span>
          <span className="permission-visualizer__stat-label">Mục Menu hiển thị</span>
        </div>
      </div>

      <div className="permission-visualizer__list-title">
        <Key size={14} /> Danh sách Permissions khả dụng của vai trò {user.roleDisplayName}:
      </div>

      <div className="permission-visualizer__tags">
        {user.permissions.map(perm => (
          <span key={perm} className="permission-visualizer__tag">
            <CheckCircle2 size={12} />
            {perm}
          </span>
        ))}
      </div>
    </div>
  );
};
