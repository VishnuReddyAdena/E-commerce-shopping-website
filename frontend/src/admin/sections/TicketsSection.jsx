import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ArrowLeft, CheckCircle, Clock, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function TicketsSection() {
  const { token, backendUrl, addNotification } = useApp();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/tickets`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const handleToggleStatus = async (ticketId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
    try {
      const res = await fetch(`${backendUrl}/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(`Ticket marked as ${nextStatus}`, 'success');
        if (selectedTicket?._id === ticketId) setSelectedTicket(data);
        fetchTickets();
      }
    } catch (err) { console.error(err); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const res = await fetch(`${backendUrl}/api/tickets/${selectedTicket._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTicket(data);
        setReplyText('');
        fetchTickets();
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {!selectedTicket ? (
          // Ticket List
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{tickets.filter(t => t.status === 'open').length}</span> open tickets
                &nbsp;·&nbsp;
                <span className="font-bold text-emerald-600">{tickets.filter(t => t.status === 'resolved').length}</span> resolved
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                      <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
                    </div>
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No support tickets"
                description="When customers create support tickets, they'll appear here"
              />
            ) : (
              tickets.map((ticket, i) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedTicket(ticket)}
                  whileHover={{ y: -1, boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1)' }}
                  className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 cursor-pointer transition-all ${
                    ticket.status === 'open' ? 'border-amber-100' : 'border-slate-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ticket.status === 'open' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    {ticket.status === 'open'
                      ? <Clock className="w-4.5 h-4.5 text-amber-500" style={{ width: 18, height: 18 }} />
                      : <CheckCircle className="w-4.5 h-4.5 text-emerald-500" style={{ width: 18, height: 18 }} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{ticket.subject}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {ticket.userId?.name} · {new Date(ticket.createdAt).toLocaleDateString()}
                      &nbsp;·&nbsp; {ticket.messages?.length || 0} messages
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={ticket.status} size="xs" />
                    <button
                      onClick={e => { e.stopPropagation(); handleToggleStatus(ticket._id, ticket.status); }}
                      className="text-[10px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      {ticket.status === 'open' ? 'Resolve' : 'Reopen'}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          // Ticket Detail
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mt-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{selectedTicket.subject}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    From: {selectedTicket.userId?.name} ({selectedTicket.userId?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={selectedTicket.status} />
                  <button
                    onClick={() => handleToggleStatus(selectedTicket._id, selectedTicket.status)}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                      selectedTicket.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Mark {selectedTicket.status === 'open' ? 'Resolved' : 'Open'}
                  </button>
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-72 overflow-y-auto p-4 space-y-3">
                {selectedTicket.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'agent' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mr-2 mt-auto">
                        {selectedTicket.userId?.name?.[0] || '?'}
                      </div>
                    )}
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'agent'
                        ? 'bg-[#2563EB] text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200'
                    }`}>
                      <p className="font-medium opacity-70 text-[10px] mb-0.5">
                        {msg.sender === 'agent' ? 'Support Agent' : selectedTicket.userId?.name}
                      </p>
                      <p>{msg.text}</p>
                    </div>
                    {msg.sender === 'agent' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ml-2 mt-auto">
                        A
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Reply input */}
              <div className="border-t border-slate-100 p-3">
                <form onSubmit={handleReply} className="flex items-center gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type a support reply..."
                    className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="w-10 h-10 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
