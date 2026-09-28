import React from 'react';
import { IUser } from '../types/IUser';
import { Building2, Shield, Mail } from 'lucide-react';

export interface IUserProfileCardProps {
  user: IUser;
  isCollapsed?: boolean;
}

export const UserProfileCard: React.FC<IUserProfileCardProps> = ({ user, isCollapsed = false }) => {
  if (isCollapsed) {
    return (
      <div className="user-profile-card user-profile-card--collapsed" title={`${user.fullName} - ${user.roleDisplayName}`}>
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="user-profile-card__avatar"
        />
        <span className="user-profile-card__status-dot"></span>
      </div>
    );
  }

  return (
    <div className="user-profile-card">
      <div className="user-profile-card__avatar-wrapper">
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="user-profile-card__avatar"
        />
        <span className="user-profile-card__status-dot"></span>
      </div>
      
      <div className="user-profile-card__info">
        <h4 className="user-profile-card__name" title={user.fullName}>
          {user.fullName}
        </h4>
        
        <div className="user-profile-card__badge-role">
          <Shield className="user-profile-card__icon" size={13} />
          <span>{user.roleDisplayName}</span>
        </div>

        <div className="user-profile-card__detail">
          <Building2 className="user-profile-card__icon" size={13} />
          <span className="user-profile-card__text" title={user.businessGroup}>
            {user.businessGroup}
          </span>
        </div>

        <div className="user-profile-card__detail">
          <Mail className="user-profile-card__icon" size={13} />
          <span className="user-profile-card__text" title={user.email}>
            {user.email}
          </span>
        </div>
      </div>
    </div>
  );
};
