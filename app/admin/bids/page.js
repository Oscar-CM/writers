'use client';

import { useEffect, useState } from 'react';
import { Check, X, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const statusStyle = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function AdminBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [busy, setBusy] = useState({});
  const [expanded, setExpanded] = useState({});
  const [notes, setNotes] = useState({});

  const load = () => {
    fetch('/api/admin/bids')
      .then(r => r.json())
      .then(d => { setBids(d.bids || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const act = async (id, status) => {
    setBusy(b => ({ ...b, [id]: status }));
    await fetch(`/api/admin/bids/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote: notes[id] || null }),
    });
    setBusy(b => { const n = { ...b }; delete n[id]; return n; });
    load();
  };

  const counts = {
    all: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? bids : bids.filter(b => b.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={26} className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Task Bids</h1>
        <p className="text-sm text-gray-500 mt-0.5">{bids.length} total bids submitted</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {['pending', 'accepted', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition
              ${filter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {s} <span className="ml-1 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Bid list */}
      <div className="space-y-3">
        {filtered.map(bid => {
          const isExpanded = expanded[bid.bidId];
          const isBusy = !!busy[bid.bidId];
          return (
            <div key={bid.bidId} className={`bg-white border rounded-xl shadow-sm transition ${isBusy ? 'opacity-60' : ''}`}>
              {/* Header */}
              <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => setExpanded(e => ({ ...e, [bid.bidId]: !e[bid.bidId] }))}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{bid.writerName || 'Unknown'}</p>
                    <span className="text-xs text-gray-400">{bid.writerEmail}</span>
                    {bid.writingLevel && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{bid.writingLevel}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Task: <span className="font-medium text-gray-700">{bid.taskTitle}</span>
                    {bid.taskLevel && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full capitalize ${bid.taskLevel === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{bid.taskLevel}</span>}
                  </p>
                  {bid.taskDeadline && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> Due {new Date(bid.taskDeadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusStyle[bid.status]}`}>
                    {bid.status}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Bid Description</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                      {bid.bidDescription || '(No description provided)'}
                    </p>
                  </div>

                  {bid.adminNote && (
                    <div className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-3 py-2">
                      <span className="font-semibold">Note:</span> {bid.adminNote}
                    </div>
                  )}

                  {bid.status === 'pending' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Note to writer (optional)</label>
                        <input
                          type="text"
                          value={notes[bid.bidId] || ''}
                          onChange={e => setNotes(n => ({ ...n, [bid.bidId]: e.target.value }))}
                          placeholder="e.g. Your writing experience looks great..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => act(bid.bidId, 'accepted')}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
                        >
                          {busy[bid.bidId] === 'accepted' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Accept Bid
                        </button>
                        <button
                          onClick={() => act(bid.bidId, 'rejected')}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
                        >
                          {busy[bid.bidId] === 'rejected' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                          Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No {filter === 'all' ? '' : filter} bids yet.
          </div>
        )}
      </div>
    </div>
  );
}
