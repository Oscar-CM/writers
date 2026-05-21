"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MailOpen, Send, ArrowLeft, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);
  if (days > 0) return `${days}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { root, replies }
  const [selectedId, setSelectedId] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const loadThreads = () => {
    fetch("/api/messages")
      .then(r => r.json())
      .then(d => { setThreads(d.threads || []); setLoading(false); });
  };

  useEffect(() => { loadThreads(); }, []);

  const openThread = async (id) => {
    setSelectedId(id);
    setLoadingThread(true);
    const res = await fetch(`/api/messages/${id}`);
    const d = await res.json();
    setSelected(d);
    setLoadingThread(false);
    // Refresh thread list to update unread count
    loadThreads();
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await fetch(`/api/messages/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyText }),
    });
    setReplyText("");
    // Reload thread
    const res = await fetch(`/api/messages/${selectedId}`);
    const d = await res.json();
    setSelected(d);
    setSending(false);
  };

  const unreadCount = threads.filter(t => !t.isRead && t.toUserId === session?.user?.id).length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[60vh]">

        {/* Thread list */}
        <div className="md:col-span-1 space-y-2 overflow-y-auto max-h-[70vh]">
          {threads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-gray-100 mb-3">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Messages from the admin will appear here.</p>
            </div>
          )}

          {threads.map(thread => {
            const isUnread = !thread.isRead && thread.toUserId === session?.user?.id;
            const isSelected = thread.id === selectedId;
            return (
              <button
                key={thread.id}
                onClick={() => openThread(thread.id)}
                className={`w-full text-left p-3 rounded-xl border transition
                  ${isSelected ? "border-orange-300 bg-orange-50" : isUnread ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {isUnread
                      ? <Mail size={16} className="text-blue-500" />
                      : <MailOpen size={16} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                        {thread.fromName || "Admin"}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 ml-1">{timeAgo(thread.createdAt)}</span>
                    </div>
                    {thread.subject && (
                      <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-gray-700 font-semibold" : "text-gray-500"}`}>
                        {thread.subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">{thread.body}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Thread detail */}
        <div className="md:col-span-2 border border-gray-200 rounded-xl flex flex-col">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a message to read it
            </div>
          ) : loadingThread ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={22} className="animate-spin text-gray-300" />
            </div>
          ) : selected ? (
            <>
              {/* Thread header */}
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-800">{selected.root?.subject || "(No subject)"}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  From {selected.root?.fromUserId === session?.user?.id ? "You" : "Admin"} · {timeAgo(selected.root?.createdAt)}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[45vh]">
                {/* Original */}
                <MessageBubble
                  body={selected.root?.body}
                  fromName={selected.root?.fromUserId === session?.user?.id ? "You" : "Admin"}
                  time={selected.root?.createdAt}
                  isSelf={selected.root?.fromUserId === session?.user?.id}
                />

                {/* Replies */}
                {selected.replies?.map(r => (
                  <MessageBubble
                    key={r.id}
                    body={r.body}
                    fromName={r.fromUserId === session?.user?.id ? "You" : (r.fromName || "Admin")}
                    time={r.createdAt}
                    isSelf={r.fromUserId === session?.user?.id}
                  />
                ))}
              </div>

              {/* Reply box */}
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending}
                  className="px-4 bg-[#FF7A00] hover:bg-[#e56d00] text-white rounded-lg disabled:opacity-50 transition flex items-center gap-1 text-sm font-semibold"
                >
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

function MessageBubble({ body, fromName, time, isSelf }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 space-y-1
        ${isSelf ? "bg-[#FF7A00] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
        <p className={`text-xs font-semibold ${isSelf ? "text-orange-100" : "text-gray-500"}`}>{fromName}</p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
        <p className={`text-xs text-right ${isSelf ? "text-orange-200" : "text-gray-400"}`}>{timeAgo(time)}</p>
      </div>
    </div>
  );
}
