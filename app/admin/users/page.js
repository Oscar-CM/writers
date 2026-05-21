'use client';

import { useEffect, useState } from 'react';
import { UserCheck, UserX, Trash2, ShieldCheck, ShieldOff, Loader2, Search } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive
  const [busy, setBusy] = useState({}); // { [userId]: true } while action in flight

  const load = () => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const act = async (id, payload, label) => {
    setBusy(b => ({ ...b, [id]: label }));
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(b => { const n = { ...b }; delete n[id]; return n; });
    load();
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Permanently delete "${name}"?\n\nThis will remove their account and all associated data. This cannot be undone.`)) return;
    setBusy(b => ({ ...b, [id]: 'delete' }));
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setBusy(b => { const n = { ...b }; delete n[id]; return n; });
    load();
  };

  const counts = {
    all: users.length,
    active: users.filter(u => u.activated).length,
    inactive: users.filter(u => !u.activated).length,
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.country?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && u.activated) ||
      (filter === 'inactive' && !u.activated);
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered writers</p>
      </div>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition
                ${filter === key
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${filter === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Country / Level</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Activation</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(user => {
              const isBusy = !!busy[user.id];
              const busyAction = busy[user.id];
              return (
                <tr key={user.id} className={`transition ${isBusy ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-50'}`}>

                  {/* User info */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 leading-tight">{user.fullName || '—'}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                    {user.phone && <p className="text-gray-400 text-xs">{user.phone}</p>}
                    <p className="text-gray-300 text-xs mt-0.5 font-mono">
                      Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </td>

                  {/* Country / Level */}
                  <td className="px-4 py-3">
                    <p className="text-gray-600 text-sm">{user.country || '—'}</p>
                    {user.writingLevel && (
                      <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {user.writingLevel}
                      </span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Activation toggle — prominent */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit
                        ${user.activated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.activated ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.activated ? 'Active' : 'Inactive'}
                      </span>

                      {user.activated ? (
                        <button
                          onClick={() => act(user.id, { activated: false }, 'deactivate')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition w-fit"
                        >
                          {busyAction === 'deactivate'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <UserX size={12} />}
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => act(user.id, { activated: true }, 'activate')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition w-fit"
                        >
                          {busyAction === 'activate'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <UserCheck size={12} />}
                          Activate
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Other actions */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => act(user.id, { role: 'admin' }, 'make-admin')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition w-fit"
                        >
                          {busyAction === 'make-admin'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <ShieldCheck size={12} />}
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => act(user.id, { role: 'writer' }, 'remove-admin')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition w-fit"
                        >
                          {busyAction === 'remove-admin'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <ShieldOff size={12} />}
                          Remove Admin
                        </button>
                      )}

                      <button
                        onClick={() => deleteUser(user.id, user.fullName || user.email)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition w-fit"
                      >
                        {busyAction === 'delete'
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Trash2 size={12} />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  {search ? `No users matching "${search}"` : 'No users in this category.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {users.length} users
        </p>
      )}
    </div>
  );
}
