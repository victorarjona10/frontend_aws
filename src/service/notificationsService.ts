import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Notification } from '../models/Notification';
import api from './axiosInstance';

// Singleton para la conexión del socket
let socket: Socket | null = null;
let isInitialized = false;
let currentUserId: string | null = null;
const apiUrl = 'http://miapi:40000/api';
// Callbacks para eventos de notificaciones
const notificationCallbacks: ((notification: Notification) => void)[] = [];

// Inicializar la conexión del socket
export const initializeSocket = () => {
  if (isInitialized) return;

  socket = io('http://miapi:40000/', {
    withCredentials: true,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Conectado al servidor de notificaciones');
    if (currentUserId) {
      authenticateSocket(currentUserId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Desconectado del servidor de notificaciones');
  });

  socket.on('connect_error', (error: Error) => {
    console.error('Error de conexión:', error);
  });

  socket.on('notification', (notification: Notification) => {
    console.log('Nueva notificación recibida:', notification);
    // Ejecutar todos los callbacks registrados con la nueva notificación
    notificationCallbacks.forEach((callback) => callback(notification));
  });

  isInitialized = true;
};

// Autenticar el socket con el ID del usuario
export const authenticateSocket = (userId: string) => {
  if (!socket) {
    initializeSocket();
  }

  currentUserId = userId;

  if (socket && socket.connected) {
    socket.emit('authenticate', userId);

    socket.on('authenticated', (response: any) => {
      console.log('Socket autenticado:', response);
    });
  }
};

// Registrar un callback para recibir notificaciones
export const onNotification = (
  callback: (notification: Notification) => void,
) => {
  notificationCallbacks.push(callback);
  return () => {
    const index = notificationCallbacks.indexOf(callback);
    if (index !== -1) {
      notificationCallbacks.splice(index, 1);
    }
  };
};

// Desconectar el socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitialized = false;
    currentUserId = null;
  }
};

// Obtener todas las notificaciones del usuario
export const getNotifications = async (
  limit = 20,
  offset = 0,
  onlyUnread = false,
): Promise<Notification[]> => {
  try {
    const response = await api.get(
      `${apiUrl}/notifications?limit=${limit}&offset=${offset}&unread=${onlyUnread}`,
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch notifications');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Marcar una notificación como leída
export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const response = await api.put(
      `${apiUrl}/notifications/${notificationId}/read`,
    );

    if (response.status !== 200) {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (): Promise<void> => {
  try {
    const response = await api.put(`${apiUrl}/notifications/read-all`);

    if (response.status !== 200) {
      throw new Error('Failed to mark all notifications as read');
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
