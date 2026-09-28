import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileSignature,
  Mail,
  MessageSquare,
  PhoneCall,
  TrendingUp,
} from 'lucide-react';
import { ActivityType, ICustomerActivity } from '../../interfaces';
import { Avatar, Badge } from '../common';
import styles from './ActivityFeed.module.css';

export interface IActivityFeedProps {
  activities: ReadonlyArray<ICustomerActivity>;
  showCompanyLink?: boolean;
}

export const ActivityFeed: React.FC<IActivityFeedProps> = ({
  activities,
  showCompanyLink = true,
}) => {
  const navigate = useNavigate();

  const getActivityIcon = (type: ActivityType): React.ReactNode => {
    switch (type) {
      case 'call':
        return <PhoneCall size={14} />;
      case 'email':
        return <Mail size={14} />;
      case 'meeting':
        return <Calendar size={14} />;
      case 'contract':
        return <FileSignature size={14} />;
      case 'deal_update':
        return <TrendingUp size={14} />;
      case 'note':
        return <MessageSquare size={14} />;
    }
  };

  return (
    <div className={styles.timeline} role="feed" aria-label="Dòng thời gian hoạt động khách hàng">
      {activities.map((activity, idx) => (
        <motion.article
          key={activity.id}
          className={styles.timeline__item}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
        >
          <div className={styles.timeline__rail}>
            <span
              className={`${styles.timeline__node} ${
                styles[`timeline__node--${activity.type}`]
              }`}
              aria-hidden="true"
            >
              {getActivityIcon(activity.type)}
            </span>
            {idx < activities.length - 1 && (
              <span className={styles.timeline__connector} aria-hidden="true" />
            )}
          </div>

          <div className={styles.timeline__card}>
            <div className={styles.timeline__header}>
              <h4 className={styles.timeline__title}>{activity.title}</h4>
              <span className={styles.timeline__time}>{activity.relativeTime}</span>
            </div>

            <p className={styles.timeline__desc}>{activity.description}</p>

            <div className={styles.timeline__metaRow}>
              <div className={styles.timeline__actor}>
                <Avatar
                  src={activity.performedBy.avatarUrl}
                  name={activity.performedBy.name}
                  size="xs"
                />
                <span>{activity.performedBy.name}</span>
              </div>

              {showCompanyLink && activity.companyName && (
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${activity.customerId}`)}
                  className={styles.timeline__companyBtn}
                >
                  {activity.companyName}
                </button>
              )}

              {activity.metadata?.dealDelta && (
                <Badge tone="success" size="sm">
                  {activity.metadata.dealDelta}
                </Badge>
              )}
              {activity.metadata?.duration && (
                <Badge tone="info" size="sm">
                  {activity.metadata.duration}
                </Badge>
              )}
              {activity.metadata?.attachmentName && (
                <Badge tone="accent" size="sm">
                  {activity.metadata.attachmentName}
                </Badge>
              )}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};
