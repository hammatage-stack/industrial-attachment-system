import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import useAuthStore from '../context/authStore';
import { io } from 'socket.io-client';

const sampleConversations = [
  { id: 'c1', name: 'Acme Corp', last: 'Thanks for applying', unread: 1 },
  { id: 'c2', name: 'Tech Solutions', last: 'Can you share your CV?', unread: 0 },
  { id: 'c3', name: 'Admin Office', last: 'Please verify your email', unread: 0 }
];

const Messages = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingStateRef = useRef(false);

  // Read receipt indicator component
  const ReadReceipt = ({ message, userId }) => {
    if (message.from === userId && message.read) {
      return <span className="text-xs text-gray-400 ml-1">✓✓</span>;
    }
    if (message.from === userId && !message.read) {
      return <span className="text-xs text-gray-400 ml-1">✓</span>;
    }
    return null;
  };

  // Typing indicator component
  const TypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    const typingList = Array.from(typingUsers).join(', ');
    return (
      <div className="text-xs text-gray-500 italic">
        {typingList} {typingUsers.size === 1 ? 'is' : 'are'} typing...
      </div>
    );
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data.conversations || sampleConversations);
      } catch (e) {
        setConversations(sampleConversations);
      }
    };
    fetchConversations();
  }, []);

  // Socket setup with typing indicators and read receipts
  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      auth: {
        token: localStorage.getItem('token') || ''
      }
    });

    // Join user room
    newSocket.on('connect', () => {
      newSocket.emit('join:room', {
        roomId: user._id || user.id || user.email,
        type: 'user'
      });
      console.log('Connected to socket server');
    });

    // Handle incoming messages
    newSocket.on('message', (payload) => {
      if (!payload) return;
      if (payload.conversationId === selected) {
        setMessages((m) => [...m, { ...payload.message, read: true }]);
        // Send read receipt
        newSocket.emit('message:read', {
          conversationId: payload.conversationId,
          messageId: payload.message._id
        });
      }
    });

    // Handle typing indicator
    newSocket.on('user:typing', (data) => {
      if (data.conversationId === selected && data.userId !== user._id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(data.userId);
          return newSet;
        });
      }
    });

    // Handle stop typing
    newSocket.on('user:stop-typing', (data) => {
      if (data.conversationId === selected) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Handle read receipt
    newSocket.on('message:read', (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, read: true } : m
        )
      );
    });

    // Handle connection errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, selected]);

  // Handle typing with debounce
  const handleInputChange = (e) => {
    setText(e.target.value);

    // Send typing indicator
    if (socket && selected && !typingStateRef.current) {
      typingStateRef.current = true;
      socket.emit('typing', { conversationId: selected });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selected) {
        socket.emit('stop:typing', { conversationId: selected });
        typingStateRef.current = false;
      }
    }, 3000);
  };

  useEffect(() => {
    if (!selected) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selected}`);
        setMessages(res.data.messages || []);
        setTypingUsers(new Set());

        // Join conversation room
        if (socket) {
          socket.emit('join:room', {
            roomId: selected,
            type: 'conversation'
          });
        }
      } catch (e) {
        // fallback sample
        setMessages([
          { id: 1, from: selected === 'c1' ? 'company' : 'user', text: 'Hello', createdAt: new Date(), read: true }
        ]);
      }
    };
    fetchMessages();
  }, [selected, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selected]);

  const sendMessage = async () => {
    if (!text.trim() || !selected) return;

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket) {
      socket.emit('stop:typing', { conversationId: selected });
      typingStateRef.current = false;
    }

    const msg = { 
      id: Date.now(), 
      from: user._id, 
      text: text.trim(), 
      createdAt: new Date(),
      read: true 
    };
    setMessages((m) => [...m, msg]);
    setText('');

    try {
      await api.post(`/messages/${selected}/send`, { text: msg.text });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white border rounded shadow-sm p-2">
          <div className="px-2 py-2 font-medium">Conversations</div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelected(conv.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{conv.name}</div>
                  {conv.unread > 0 && <div className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-medium">{conv.unread}</div>}
                </div>
                <div className="text-xs text-gray-500 truncate mt-1">{conv.last}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-white border rounded shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b bg-gray-50">
            <div className="text-lg font-medium">{conversations.find(c => c.id === selected)?.name || 'Select a conversation'}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {selected ? (
              <>
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 mt-8">No messages yet. Start a conversation!</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id || m._id}
                      className={`flex gap-2 ${m.from === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                          m.from === user._id
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <div className="text-sm break-words">{m.text}</div>
                        <div className={`text-xs mt-1 flex items-center justify-between ${
                          m.from === user._id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {m.from === user._id && (
                            <span className="ml-2">
                              {m.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {typingUsers.size > 0 && (
                  <div className="flex gap-2 items-center">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            ) : (
              <p className="text-gray-500 text-center mt-8">Choose a conversation to view messages.</p>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={handleInputChange}
                placeholder="Write a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={!selected}
              />
              <button
                onClick={sendMessage}
                disabled={!selected || !text.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
