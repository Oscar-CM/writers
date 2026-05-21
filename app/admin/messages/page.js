'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send, Mail, MailOpen, X, PenSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);
  if (days > 0) return `${days}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

export default function AdminMessages() {
  const { data: session } = useSession();
  const [data, setData] = useState({ threads: [], writers: [] });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [composing, setComposing] = useState(false);
  const [compose, setCompose] = useState({ toUserId: '', subject: '', body: '' });
  const [composeSending, setComposeSending] = useState(false);

  const load = () => {
    fetch('/api/admin/messages')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openThread = async (id) => {
    setSelectedId(id);
    setLoadingThread(true);
    const res = await fetch(`/api/messages/${id}`);
    const d = await res.json();
    setThread(d);
    setLoadingThread(false);
    load();
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await fetch(`/api/messages/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyText }),
    });
    setReplyText('');
    const res = await fetch(`/api/messages/${selectedId}`);
    const d = await res.json();
    setThread(d);
    setSending(false);
  };

  const sendNew = async () => {
    if (!compose.toUserId || !compose.body.trim()) return;
    setComposeSending(true);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(compose),
    });
    setComposeSending(false);
    setComposing(false);
    setCompose({ toUserId: '', subject: '', body: '' });
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={26} className="animate-spin text-gray-400" /></div>;

  const { threads, writers } = data;

  return (
    <div className="space-y-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-sm text-gray-500">{threads.length} conversations</p>
        </div>
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
        >
          <PenSquare size={15} /> New Message
        </button>
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">New Message</h2>
              <button onClick={() => setComposing(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Send to</label>
              <select
                value={compose.toUserId}
                onChange={e => setCompose(c => ({ ...c, toUserId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select a writer...</option>
                {writers.map(w => (
                  <option key={w.id} value={w.id}>{w.fullName || w.email} ({w.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Subject (optional)</label>
              <input
                type="text"
                value={compose.subject}
                onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))}
                placeholder="e.g. Task Assignment Update"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Message</label>
              <textarea
                rows={5}
                value={compose.body}
                onChange={e => setCompose(c => ({ ...c, body: e.target.value }))}
                placeholder="Write your message here..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setComposing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button
                onClick={sendNew}
                disabled={!compose.toUserId || !compose.body.trim() || composeSending}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
              >
                {composeSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[60vh]">

        {/* Thread list */}
        <div className="md:col-span-1 space-y-2 overflow-y-auto max-h-[70vh]">
          {threads.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No conversations yet.</div>
          )}
          {threads.map(t => {
            const isSelected = t.id === selectedId;
            const fromAdmin = t.fromUserId === session?.user?.id;
            return (
              <button key={t.id} onClick={() => openThread(t.id)}
                className={`w-full text-left p-3 rounded-xl border transition
                  ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {t.isRead ? <MailOpen size={15} className="text-gray-400" /> : <Mail size={15} className="text-indigo-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {fromAdmin ? `To: ${t.toUserName || 'Writer'}` : (t.fromName || 'Writer')}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 ml-1">{timeAgo(t.createdAt)}</span>
                    </div>
                    {t.subject && <p className="text-xs text-gray-600 truncate">{t.subject}</p>}
                    <p className="text-xs text-gray-400 truncate">{t.body}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Thread detail */}
        <div className="md:col-span-2 border border-gray-200 rounded-xl flex flex-col bg-white">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation or click &quot;New Message&quot; to compose
            </div>
          ) : loadingThread ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
          ) : thread ? (
            <>
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-800">{thread.root?.subject || '(No subject)'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(thread.root?.createdAt)}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[45vh]">
                <Bubble body={thread.root?.body} isSelf={thread.root?.fromUserId === session?.user?.id}
                  name={thread.root?.fromUserId === session?.user?.id ? 'You (Admin)' : (thread.root?.fromName || 'Writer')}
                  time={thread.root?.createdAt} />
                {thread.replies?.map(r => (
                  <Bubble key={r.id} body={r.body} isSelf={r.fromUserId === session?.user?.id}
                    name={r.fromUserId === session?.user?.id ? 'You (Admin)' : (r.fromName || 'Writer')}
                    time={r.createdAt} />
                ))}
              </div>

              <div className="border-t border-gray-100 p-3 flex gap-2">
                <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                <button onClick={sendReply} disabled={!replyText.trim() || sending}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Bubble({ body, isSelf, name, time }) {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 space-y-1
        ${isSelf ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
        <p className={`text-xs font-semibold ${isSelf ? 'text-indigo-200' : 'text-gray-500'}`}>{name}</p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
        <p className={`text-xs text-right ${isSelf ? 'text-indigo-300' : 'text-gray-400'}`}>{timeAgo(time)}</p>
      </div>
    </div>
  );
}
