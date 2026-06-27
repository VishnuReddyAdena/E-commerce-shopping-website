import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, User } from 'lucide-react';

export const LiveChat = () => {
  const { user, socket } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'agent', text: 'Hello! Welcome to NexaCart support. How can I help you today?', createdAt: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for incoming chat messages
    const channel = `chat_${user._id}`;
    socket.on(channel, (data) => {
      if (data.sender !== 'user') {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off(channel);
    };
  }, [socket, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputText,
      createdAt: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // If socket is connected, emit event
    if (socket && user) {
      socket.emit('supportMessage', {
        userId: user._id,
        ticketId: 'live-chat',
        ...userMsg
      });
    }

    // Simulate Agent Auto-reply after 1.5 seconds
    setTimeout(() => {
      const replies = [
        "That sounds like a great question! Let me check the details for you.",
        "Could you please share your order number if it is related to an order?",
        "We are currently offering free delivery on all cart transactions above $50. You can also use code GLASS3D for a 15% discount!",
        "Yes, our product variants are fully customizable on the product details page.",
        "If you want to raise a formal ticket, you can visit our Help Center in the dashboard."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const agentMsg = {
        sender: 'agent',
        text: randomReply,
        createdAt: new Date()
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Emit back on socket if available
      if (socket && user) {
        socket.emit('supportMessage', {
          userId: user._id,
          ticketId: 'live-chat',
          ...agentMsg
        });
      }
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[450px] glass-card flex flex-col border border-slate-200 shadow-2xl relative overflow-hidden animate-fade-in bg-white/90">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-650 to-indigo-650 text-white flex justify-between items-center rounded-t-[24px]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide">Live Support</h4>
                <p className="text-[10px] text-blue-105 font-medium">Offline helper active</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  <p className="font-semibold leading-relaxed">{msg.text}</p>
                  <span className="text-[8px] opacity-70 block text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-150 bg-slate-50 flex gap-2 rounded-b-[24px]">
            <input
              type="text"
              placeholder={user ? "Type a message..." : "Please login to chat"}
              disabled={!user}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={!user || !inputText.trim()}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default LiveChat;
