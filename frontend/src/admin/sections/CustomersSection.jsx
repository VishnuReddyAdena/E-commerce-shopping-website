import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Shield, Ban, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/SkeletonLoader';

const MOCK_CUSTOMERS = [
  { _id: 'cust_1', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'user', isEmailVerified: true, isBanned: false },
  { _id: 'cust_2', name: 'Alex Rivera', email: 'alex@example.com', role: 'user', isEmailVerified: true, isBanned: false },
  { _id: 'cust_3', name: 'Emily Chen', email: 'emily@example.com', role: 'user', isEmailVerified: false, isBanned: false },
  { _id: 'cust_4', name: 'James Carter', email: 'james@glass-shop.com', role: 'admin', isEmailVerified: true, isBanned: false },
  { _id: 'cust_5', name: 'Yuki Tanaka', email: 'yuki@example.com', role: 'user', isEmailVerified: true, isBanned: true }
];

export default function CustomersSection() {
  const { token, backendUrl, addNotification } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBan = async (userId) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/users/${userId}/ban`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { addNotification('User status toggled.', 'success'); fetchUsers(); }
    } catch (err) { console.error(err); }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`${backendUrl}/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) { addNotification(`Role set to ${newRole}`, 'success'); fetchUsers(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/auth/users/${userId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { addNotification('User deleted.', 'info'); fetchUsers(); }
    } catch (err) { console.error(err); }
  };

  const displayUsers = users.length > 0 ? users : MOCK_CUSTOMERS;

  const filtered = displayUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div className="text-xs text-slate-500">
          <span className="font-bold text-slate-900">{filtered.length}</span> customers
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={6} rows={7} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={Users} title="No customers found" description="No matching customers" />
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(248,250,252,0.8)' }}
                    className={`border-b border-slate-50 transition-colors ${u.isBanned ? 'bg-rose-50/30' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{u.name}</p>
                          {u.isBanned && (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 rounded px-1">BANNED</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-600">{u.email}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.role} size="xs" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.isEmailVerified ? 'verified' : 'unverified'} size="xs" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.isBanned ? 'banned' : 'active'} size="xs" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleRole(u._id, u.role)}
                          title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleBan(u._id)}
                          title={u.isBanned ? 'Unban' : 'Ban'}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${u.isBanned ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'}`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
