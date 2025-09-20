import React from 'react';
import styles from './NotificationList.module.css';
import { Notification } from '../../models/Notification';
import { markAsRead } from '../../service/notificationsService';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  onNotificationRemove: (id: string) => void;
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationRead,
  onNotificationRemove,
  onClose,
}) => {
  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
        onNotificationRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // Eliminamos la notificación de la lista tras hacer clic
    onNotificationRemove(notification.id);
  };

  return (
    <div className={styles.notificationListContainer}>
      <div className={styles.notificationHeader}>
        <h3>Notificaciones</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      {notifications.length > 0 ? (
        <ul className={styles.notificationList}>
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(notification)}>
              <div className={styles.notificationIcon}>
                {notification.type === 'new_order' ? '🛒' : '📢'}
              </div>
              <div className={styles.notificationContent}>
                <p className={styles.notificationMessage}>
                  {notification.message}
                </p>
                <span className={styles.notificationTime}>
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyNotifications}>No tienes notificaciones.</p>
      )}
    </div>
  );
};

export default NotificationList;
