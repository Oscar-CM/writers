'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

export default function AdminTraining() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    fetch('/api/admin/training')
      .then(r => r.json())
      .then(d => { setApplications(d.applications || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/training/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  if (loading) return <p className="text-gray-500">Loading training requests...</p>;

  const statusColor = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Training Requests</h1>
        <p className="text-sm text-gray-500">{applications.length} total requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 overflow-y-auto max-h-[65vh]">
          {applications.map(app => (
            <div
              key={app.id}
              onClick={() => setSelected(app)}
              className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition
                ${selected?.id === app.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{app.fullName}</p>
                  <p className="text-sm text-gray-500">{app.email}</p>
                  <p className="text-xs text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColor[app.status]}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
          {applications.length === 0 && <p className="text-gray-400 text-center py-10">No training requests yet.</p>}
        </div>

        {selected ? (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 sticky top-0">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-lg">{selected.fullName}</h2>
              <button onClick={() => setSelected(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Email:</span> {selected.email}</p>
              <p><span className="font-medium">Phone:</span> {selected.phoneNumber || '—'}</p>
              <p><span className="font-medium">Experience Level:</span> {selected.experienceLevel || '—'}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-600 mb-1">Goals</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.goals || '—'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(selected.id, 'approved')} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                <Check size={15} /> Approve
              </button>
              <button onClick={() => updateStatus(selected.id, 'rejected')} className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Select a request to view details
          </div>
        )}
      </div>
    </div>
  );
}
