import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

let socket: Socket | null = null;
let isInitialized = false;
let currentRoomId: string | null = null;

const messageCallbacks: ((message: any) => void)[] = [];
const historyCallbacks: ((messages: any[]) => void)[] = [];
const errorCallbacks: ((error: any) => void)[] = [];

export const initializeChatSocket = (token?: string, userId?: string) => {
  if (isInitialized) return;

  try {
    socket = io('http://localhost:40000/chat', {
      withCredentials: true,
      auth: { token, userId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Conectado al chat');
      if (currentRoomId) {
        joinRoom(currentRoomId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del chat');
    });

    socket.on('chatMessage', (message: any) => {
      messageCallbacks.forEach((cb) => cb(message));
    });

    // Handle received messages
    socket.on('receive_message', (message: any) => {
      console.log('Nuevo mensaje recibido:', message);
      messageCallbacks.forEach((cb) => cb(message));
    });

    // IMPORTANT: Handle message history from the server
    socket.on('message_history', (messages: any[]) => {
      console.log(`Recibidos ${messages.length} mensajes del historial`);

      // CHANGE: Reverse the order of messages before passing to callbacks
      const reversedMessages = [...messages].reverse();
      console.log('Orden de mensajes invertido para mostrar en la UI');

      // Notify any history listeners about the complete message array (now reversed)
      historyCallbacks.forEach((cb) => cb(reversedMessages));
    });

    // Handle errors
    socket.on('message_error', (error: any) => {
      console.error('Error en chat:', error);
      errorCallbacks.forEach((cb) => cb(error));
    });

    isInitialized = true;
  } catch (error) {
    console.error('Error al inicializar el chat:', error);
    errorCallbacks.forEach((cb) =>
      cb({
        error: 'No se pudo inicializar el chat',
      }),
    );
  }
};

// Rest of the code remains unchanged
export const joinRoom = (roomId: string) => {
  const tokenFromStorage = localStorage.getItem('token') || '';
  const userId = localStorage.getItem('userId') || '';
  if (!socket) initializeChatSocket(tokenFromStorage, userId);

  currentRoomId = roomId;

  if (socket && socket.connected) {
    console.log('Uniéndose a la sala:', roomId);
    socket.emit('join_room', roomId);
    return true;
  }
  return false;
};

export const sendMessage = (roomId: string, message: any) => {
  console.log('Enviando mensaje:', message);
  if (socket && socket.connected) {
    console.log(`Enviando mensaje al chat en la sala ${roomId}:`, message);
    socket.emit('send_message', { room: roomId, message });
    return true;
  }
  return false;
};

export const onMessage = (callback: (message: any) => void) => {
  messageCallbacks.push(callback);

  return () => {
    const index = messageCallbacks.indexOf(callback);
    if (index !== -1) {
      messageCallbacks.splice(index, 1);
    }
  };
};

export const onMessageHistory = (callback: (messages: any[]) => void) => {
  historyCallbacks.push(callback);

  return () => {
    const index = historyCallbacks.indexOf(callback);
    if (index !== -1) {
      historyCallbacks.splice(index, 1);
    }
  };
};

export const onError = (callback: (error: any) => void) => {
  errorCallbacks.push(callback);

  return () => {
    const index = errorCallbacks.indexOf(callback);
    if (index !== -1) {
      errorCallbacks.splice(index, 1);
    }
  };
};

export const loadMessagesFromRest = async (roomId: string) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://localhost:40000/api/chat/messages/${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error(`Error ${response.status}`);

    const data = await response.json();

    // CHANGE: Also reverse messages loaded from REST API
    return (data.messages || []).reverse();
  } catch (error) {
    console.error('Error loading messages from REST API:', error);
    throw error;
  }
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitialized = false;
    currentRoomId = null;
  }
};
