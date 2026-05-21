'use client';

import { useEffect, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    fetch('/api/admin/applications')
      .then(r => r.json())
      .then(d => { setApplications(d.applications || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  if (loading) return <p className="text-gray-500">Loading applications...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Job Applications</h1>
        <p className="text-sm text-gray-500">{applications.length} total applications</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'reviewed', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize
              ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s} {s === 'all' ? `(${applications.length})` : `(${applications.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3 overflow-y-auto max-h-[65vh] pr-1">
          {filtered.map(app => (
            <div
              key={app.id}
              onClick={() => setSelected(app)}
              className={`p-4 rounded-xl border cursor-pointer transition hover:shadow-md
                ${selected?.id === app.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{app.fullName}</p>
                  <p className="text-sm text-gray-500">{app.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[app.status]}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-center py-10">No applications in this category.</p>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 sticky top-0">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-lg">{selected.fullName}</h2>
              <button onClick={() => setSelected(null)}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Email:</span> {selected.email}</p>
              <p><span className="font-medium">Phone:</span> {selected.phone || '—'}</p>
              <p><span className="font-medium">Country:</span> {selected.country || '—'}</p>
              <p><span className="font-medium">Writing Level:</span> {selected.writingLevel || '—'}</p>
            </div>

            <div>
              <p className="font-medium text-sm text-gray-600 mb-1">Experience</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.experience || '—'}</p>
            </div>

            <div>
              <p className="font-medium text-sm text-gray-600 mb-1">Motivation</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.motivation}</p>
            </div>

            {selected.portfolio && (
              <div>
                <p className="font-medium text-sm text-gray-600 mb-1">Portfolio</p>
                <a href={selected.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{selected.portfolio}</a>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => updateStatus(selected.id, 'approved')}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <Check size={15} /> Approve
              </button>
              <button
                onClick={() => updateStatus(selected.id, 'reviewed')}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Eye size={15} /> Mark Reviewed
              </button>
              <button
                onClick={() => updateStatus(selected.id, 'rejected')}
                className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
              >
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Select an application to view details
          </div>
        )}
      </div>
    </div>
  );
}
