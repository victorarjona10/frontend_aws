import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import styles from './NotificationBell.module.css';
import { Notification } from '../../models/Notification';
import NotificationList from '../NotificationList/NotificationList';
import {
  getNotifications,
  onNotification,
  initializeSocket,
  authenticateSocket,
  markAllAsRead,
} from '../../service/notificationsService';

interface NotificationBellProps {
  count?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  // Función para recalcular el contador basándose en el estado actual
  const recalculateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter((n) => !n.read).length;
    setUnreadCount(count);
    return count;
  };

  // Inicializar socket y cargar notificaciones al montar el componente
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      initializeSocket();
      authenticateSocket(userId);

      // Cargar notificaciones iniciales
      loadNotifications();

      // Suscribirse a nuevas notificaciones y guardar la función de cancelación
      const unsubscribe = onNotification((notification: Notification) => {
        // Verificar si la notificación ya existe en la lista para evitar duplicados
        setNotifications((prev) => {
          // Comprobar si ya existe una notificación con el mismo ID
          if (prev.some((n) => n._id === notification._id)) {
            return prev; // No añadir duplicados
          }
          // Añadir la nueva notificación
          const newNotifications = [notification, ...prev];
          // Recalcular contador
          recalculateUnreadCount(newNotifications);
          return newNotifications;
        });
      });
      // Limpiar al desmontar
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, []);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const notifs = await getNotifications(20, 0, false);
      setNotifications(notifs);
      // Usar recalculateUnreadCount para asegurar consistencia
      recalculateUnreadCount(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n._id === id ? { ...n, read: true } : n,
      );
      // Recalcular inmediatamente después de actualizar
      recalculateUnreadCount(updated);
      return updated;
    });
  };

  // Eliminar una notificación de la lista al hacer clic en ella
  const handleRemoveNotification = (id: string) => {
    setNotifications((prev) => {
      const filtered = prev.filter((n) => n._id !== id);
      // Recalcular el contador después de eliminar
      recalculateUnreadCount(filtered);
      return filtered;
    });
  };

  // Marcar todas las notificaciones como leídas al cerrar
  const handleCloseNotifications = async () => {
    try {
      await markAllAsRead();
      // Actualizar el estado local
      setNotifications((prev) => {
        const updatedNotifs = prev.map((n) => ({ ...n, read: true }));
        // Al marcar todas como leídas, sabemos que el contador debe ser 0
        setUnreadCount(0);
        return updatedNotifs;
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className={styles.bellContainer} ref={bellRef}>
      <button
        className={styles.bellButton}
        onClick={toggleNotifications}
        aria-label="Notifications">
        {/* Corregir el renderizado del icono */}
        {FaBell({ className: styles.bellIcon })}
        {unreadCount > 0 && <span className={styles.notificationCount}></span>}
      </button>

      {isOpen && (
        <NotificationList
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
          onNotificationRemove={handleRemoveNotification}
          onClose={handleCloseNotifications}
        />
      )}
    </div>
  );
};

export default NotificationBell;
