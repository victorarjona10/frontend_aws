import React, { useEffect, useRef, useState } from "react";
import {
  initializeChatSocket,
  joinRoom,
  sendMessage,
  onMessage,
  onMessageHistory,
  onError,
  loadMessagesFromRest,
  disconnectChatSocket
} from "../../service/chatService";

interface ChatMessage {
  sender: string;
  text: string;
  timestamp?: string;
  receiver: string;
}

interface ChatWindowProps {
  companyId: string;
  companyName: string;
  userId: string;
  senderId: string;
  receiverId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ companyId, companyName, userId, senderId, receiverId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("companyname", companyName, "userId", userId, "companyId", companyId, "senderId", senderId, "receiverId", receiverId);

    if (token && userId) {
      initializeChatSocket(token, userId);
    }

    const roomId = `${companyId}-${userId}`;

    // Listen for message history from server (this is received when joining a room)
    const unsubscribeHistory = onMessageHistory((historyMessages) => {
      console.log(`Recibido historial: ${historyMessages.length} mensajes`);
      // Replace current messages with the history
      setMessages(historyMessages);
      setLoading(false);
    });

    // Listen for new messages
    const unsubscribeMessages = onMessage((msg: ChatMessage) => {
      console.log('Nuevo mensaje recibido:', msg);
      setMessages(prev => [...prev, msg]);
    });

    // Listen for errors
    const unsubscribeErrors = onError((err) => {
      console.error('Error en chat:', err);
      setError('Error en el chat: ' + (err.error || 'desconocido'));
      setLoading(false);
    });

    // Join the room (this triggers message_history event from server)
    const joined = joinRoom(roomId);

    // If joining failed, try to load messages from REST API
    if (!joined) {
      loadMessagesFromRest(roomId)
        .then(messagesFromRest => {
          setMessages(messagesFromRest);
          setLoading(false);
        })
        .catch(err => {
          setError('Error cargando mensajes: ' + err.message);
          setLoading(false);
        });
    }

    return () => {
      unsubscribeHistory();
      unsubscribeMessages();
      unsubscribeErrors();
      disconnectChatSocket();
    };
  }, [companyId, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const msg: ChatMessage = {
        sender: senderId,
        text: input,
        timestamp: new Date().toISOString(),
        receiver: receiverId || "",
      };
      const roomId = `${companyId}-${userId}`;
      sendMessage(roomId, msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
  };

  const tryLoadFromRest = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomId = `${companyId}-${userId}`;
      const messagesFromRest = await loadMessagesFromRest(roomId);
      setMessages(messagesFromRest);
    } catch (err) {
      setError(`Error cargando mensajes: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, maxWidth: 400, margin: "0 auto" }}>
      <h3>Chat con {companyName}</h3>

      {loading ? (
        <div style={{ textAlign: "center", padding: 20 }}>Cargando mensajes...</div>
      ) : (
        <>
          <div style={{ height: 300, overflowY: "auto", background: "#f9f9f9", padding: 8, borderRadius: 6 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#666", padding: 20 }}>
                No hay mensajes aún. ¡Inicia la conversación!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwnMessage = msg.sender === senderId;
                return (
                  <div
                    key={idx}
                    style={{
                      margin: "8px 0",
                      textAlign: isOwnMessage ? "right" : "left",
                      display: "flex",
                      justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        background: isOwnMessage ? "#2563eb" : "#e5e7eb",
                        color: isOwnMessage ? "#fff" : "#333",
                        borderRadius: 12,
                        padding: "6px 12px",
                        maxWidth: "70%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div style={{ padding: 10, backgroundColor: "#ffeeee", margin: "10px 0", borderRadius: 6 }}>
              <p style={{ color: "red", margin: 0 }}>{error}</p>
              <button
                onClick={tryLoadFromRest}
                style={{
                  color: "blue",
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "5px 0"
                }}
              >
                Intentar cargar con REST API
              </button>
            </div>
          )}

          <div style={{ display: "flex", marginTop: 12 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              style={{ flex: 1, borderRadius: 8, border: "1px solid #ccc", padding: 8, marginRight: 8 }}
              placeholder="Escribe un mensaje..."
            />
            <button
              onClick={handleSend}
              style={{
                borderRadius: 8,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "8px 16px"
              }}
            >
              Enviar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;