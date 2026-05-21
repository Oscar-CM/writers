'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const emptyForm = { title: '', description: '', level: 'basic', wordCount: '', basePayout: '', deadline: '' };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/admin/tasks')
      .then(r => r.json())
      .then(d => { setTasks(d.tasks || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    const url = editId ? `/api/admin/tasks/${editId}` : '/api/admin/tasks';
    const method = editId ? 'PATCH' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const startEdit = (task) => {
    setForm({
      title: task.title || '',
      description: task.description || '',
      level: task.level || 'basic',
      wordCount: task.wordCount || '',
      basePayout: task.basePayout || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    });
    setEditId(task.id);
    setShowForm(true);
  };

  const deleteTask = async (id, title) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <p className="text-gray-500">Loading tasks...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <p className="text-sm text-gray-500">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF7A00] text-white rounded-lg hover:bg-[#e56d00] transition text-sm font-medium"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">{editId ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-500" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Title *" value={form.title} onChange={set('title')} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <textarea placeholder="Description" value={form.description} onChange={set('description')} rows={3} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <select value={form.level} onChange={set('level')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
            <input type="number" placeholder="Word Count" value={form.wordCount} onChange={set('wordCount')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="number" step="0.01" placeholder="Base Payout (USD)" value={form.basePayout} onChange={set('basePayout')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="datetime-local" value={form.deadline} onChange={set('deadline')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button
            onClick={save}
            disabled={saving || !form.title}
            className="flex items-center gap-2 px-5 py-2 bg-[#FF7A00] text-white rounded-lg hover:bg-[#e56d00] disabled:opacity-50 transition text-sm font-medium"
          >
            <Check size={16} /> {saving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Words</th>
              <th className="px-4 py-3 text-left">Payout (USD)</th>
              <th className="px-4 py-3 text-left">Deadline</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{task.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.level === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {task.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{task.wordCount || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{task.basePayout || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {task.deadline ? new Date(task.deadline).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(task)} className="text-indigo-500 hover:text-indigo-700"><Pencil size={15} /></button>
                    <button onClick={() => deleteTask(task.id, task.title)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No tasks yet. Click &quot;Add Task&quot; to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
