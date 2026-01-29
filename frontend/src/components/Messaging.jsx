import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../context/authStore';

const Messaging = ({ conversationId, recipientId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);
    socketRef.current = socket;
    socket.on('connect', () => {
      if (user) socket.emit('join', `user_${user.id}`);
    });
    socket.on('message', (msg) => {
      setMessages((m) => [...m, msg]);
    });
    return () => socket.disconnect();
  }, [user]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg = { from: user.id, to: recipientId, text, createdAt: new Date() };
    socketRef.current.emit('message', msg);
    setMessages((m) => [...m, msg]);
    setText('');
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="h-64 overflow-y-auto mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === user.id ? 'text-right' : 'text-left'}`}>
            <div className="inline-block p-2 rounded bg-gray-100">{m.text}</div>
            <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded px-3 py-2" />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  );
};

export default Messaging;
