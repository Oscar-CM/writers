"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, DollarSign, CheckCircle, Loader2, Inbox, Send, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function formatDate(d) {
  if (!d) return "No deadline";
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeLeft(d) {
  if (!d) return null;
  const diff = new Date(d) - new Date();
  if (diff <= 0) return { label: "Deadline passed", expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return { label: `${days}d ${hours}h left`, urgent: days < 2 };
  return { label: `${hours}h left`, urgent: true };
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(null); // taskId being delivered
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliverSaving, setDeliverSaving] = useState(false);
  const [deliveredIds, setDeliveredIds] = useState(new Set());

  const load = () => {
    fetch("/api/my-tasks")
      .then(r => r.json())
      .then(d => {
        const rows = d.tasks || [];
        setTasks(rows);
        setDeliveredIds(new Set(rows.filter(t => t.delivered).map(t => t.taskId)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submitDelivery = async () => {
    if (!delivering) return;
    setDeliverSaving(true);
    const res = await fetch(`/api/tasks/${delivering}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryNote }),
    });
    setDeliverSaving(false);
    if (res.ok) {
      setDeliveredIds(prev => new Set([...prev, delivering]));
      setDelivering(null);
      setDeliveryNote('');
      load();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tasks where your bid was accepted</p>
      </div>

      {tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-5 rounded-full bg-gray-100 border border-gray-200 shadow-sm mb-5">
            <Inbox size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">No accepted tasks yet</h2>
          <p className="text-gray-400 mt-2 max-w-sm text-sm">Bid on writing tasks and your accepted ones will appear here.</p>
          <Link href="/dashboard/writing-tasks"
            className="mt-5 px-5 py-2.5 bg-[#FF7A00] text-white rounded-xl font-semibold text-sm hover:bg-[#e56d00] transition">
            Browse Tasks →
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task, i) => {
            const payout = task.basePayout ? (parseFloat(task.basePayout) * 25).toFixed(0) : null;
            const timer = timeLeft(task.deadline);
            const isDelivered = deliveredIds.has(task.taskId) || task.delivered;

            return (
              <motion.div key={task.bidId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition space-y-3">

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize inline-block mb-1.5
                      ${task.level === "premium" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {task.level}
                    </span>
                    <h2 className="font-bold text-gray-900 leading-snug">{task.title}</h2>
                  </div>
                  {isDelivered
                    ? <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full shrink-0">
                        <CheckCircle size={13} /> Delivered
                      </span>
                    : <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />}
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  {task.wordCount && <span className="flex items-center gap-1 text-gray-500"><FileText size={14} /> {task.wordCount.toLocaleString()} words</span>}
                  {payout && <span className="flex items-center gap-1 text-green-600 font-semibold"><DollarSign size={14} /> KES {payout}</span>}
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">{task.description}</p>
                )}

                {task.adminNote && (
                  <div className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-3 py-2">
                    <span className="font-semibold">Admin note:</span> {task.adminNote}
                  </div>
                )}

                {task.deliveryNote && (
                  <div className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-lg px-3 py-2">
                    <span className="font-semibold">Your delivery note:</span> {task.deliveryNote}
                  </div>
                )}

                <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 font-medium
                  ${timer?.expired ? "bg-red-50 text-red-600" : timer?.urgent ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-500"}`}>
                  <Clock size={13} />
                  <span>Deadline: {formatDate(task.deadline)}</span>
                  {timer && <span className="ml-auto font-bold">{timer.label}</span>}
                </div>

                {!isDelivered && (
                  <button onClick={() => { setDelivering(task.taskId); setDeliveryNote(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-bold rounded-xl transition">
                    <Send size={15} /> Submit Delivery
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delivery modal */}
      {delivering && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">Submit Delivery</h2>
              <button onClick={() => setDelivering(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500">
              Add a note about your delivery — what you completed, any relevant details for the admin.
            </p>
            <textarea rows={4} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)}
              placeholder="e.g. Completed the 1000-word essay on climate change. Added APA references as requested..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelivering(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={submitDelivery} disabled={deliverSaving}
                className="flex items-center gap-2 px-5 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition">
                {deliverSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {deliverSaving ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
