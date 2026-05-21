"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  Clock, FileText, DollarSign, AlignLeft, Send,
  CheckCircle, AlertCircle, Loader2, ArrowLeft, Star
} from "lucide-react";
import Link from "next/link";

const BID_MESSAGES = [
  "🎉 Your bid is in! All the best!",
  "🔥 Bid submitted — go get it!",
  "💪 Fingers crossed! Bid submitted!",
  "✨ Success! Your bid is now live!",
  "🚀 Officially submitted. Best of luck!",
];

export default function TaskDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [task, setTask] = useState(null);
  const [existingBid, setExistingBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bidText, setBidText] = useState("");
  const [bidStage, setBidStage] = useState("idle"); // idle | submitting | success | error
  const [bidMessage, setBidMessage] = useState("");

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then(async r => {
        if (r.status === 410) { setError("This task is no longer available — the deadline has passed."); setLoading(false); return; }
        if (r.status === 404) { setError("Task not found."); setLoading(false); return; }
        const d = await r.json();
        if (d.error) { setError(d.error); setLoading(false); return; }
        setTask(d.task);
        setExistingBid(d.existingBid);
        setLoading(false);
      })
      .catch(() => { setError("Could not load task."); setLoading(false); });
  }, [id]);

  const submitBid = async () => {
    if (bidText.trim().length < 10) {
      setBidMessage("Please write at least 10 characters explaining why you should be chosen.");
      setBidStage("error");
      return;
    }

    setBidStage("submitting");

    const res = await fetch(`/api/tasks/${id}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidDescription: bidText }),
    });

    const data = await res.json();

    if (!res.ok) {
      setBidMessage(data.error || "Failed to submit bid.");
      setBidStage("error");
      return;
    }

    setBidStage("success");
    setBidMessage(BID_MESSAGES[Math.floor(Math.random() * BID_MESSAGES.length)]);
    setExistingBid({ status: "pending" });
    setBidText("");
  };

  const formatDate = (d) => {
    if (!d) return "No deadline";
    const date = new Date(d);
    const h = date.getHours() % 12 || 12;
    return `${date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })} at ${h}:00 ${date.getHours() >= 12 ? "PM" : "AM"}`;
  };

  const timeUntil = (d) => {
    if (!d) return null;
    const diff = new Date(d) - new Date();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-gray-400" />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto text-center py-20 space-y-4">
      <AlertCircle size={48} className="text-red-400 mx-auto" />
      <h2 className="text-xl font-bold text-gray-700">{error}</h2>
      <Link href="/dashboard/writing-tasks" className="inline-flex items-center gap-2 text-[#FF7A00] hover:underline text-sm font-medium">
        <ArrowLeft size={15} /> Back to Tasks
      </Link>
    </div>
  );

  const payout = task.basePayout ? (parseFloat(task.basePayout) * 25).toFixed(0) : null;
  const remaining = timeUntil(task.deadline);
  const isUrgent = remaining && remaining.includes("h remaining") && !remaining.includes("d");

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Back */}
      <Link href="/dashboard/writing-tasks" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
        <ArrowLeft size={15} /> All Tasks
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize
            ${task.level === "premium" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {task.level}
          </span>
          {isUrgent && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600 animate-pulse">
              ⚡ Urgent
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{task.title}</h1>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoCard icon={<Clock size={18} className={isUrgent ? "text-red-500" : "text-gray-400"} />}
          label="Deadline" value={formatDate(task.deadline)} sub={remaining} urgency={isUrgent} />
        {task.wordCount && (
          <InfoCard icon={<FileText size={18} className="text-gray-400" />}
            label="Word Count" value={`${task.wordCount.toLocaleString()} words`} />
        )}
        {payout && (
          <InfoCard icon={<DollarSign size={18} className="text-green-500" />}
            label="Payout" value={`KES ${payout}`} sub="On completion" />
        )}
      </div>

      {/* Description / Instructions */}
      {task.description && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <AlignLeft size={16} /> Task Instructions
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Bid section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Star size={18} className="text-[#FF7A00]" /> Submit Your Bid
        </h2>

        {/* Already bid */}
        {existingBid && (
          <div className={`rounded-xl p-4 space-y-1 border
            ${existingBid.status === "accepted"
              ? "bg-green-50 border-green-200"
              : existingBid.status === "rejected"
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-2">
              {existingBid.status === "accepted" && <CheckCircle size={18} className="text-green-600" />}
              {existingBid.status === "rejected" && <AlertCircle size={18} className="text-red-500" />}
              {existingBid.status === "pending" && <Clock size={18} className="text-amber-500" />}
              <p className="font-semibold text-sm capitalize">
                Bid {existingBid.status === "pending" ? "submitted — awaiting review" : existingBid.status}
              </p>
            </div>
            {existingBid.status === "accepted" && (
              <p className="text-sm text-green-700">Congratulations! Your bid was accepted. Check <Link href="/dashboard/my-tasks" className="underline font-semibold">My Tasks</Link> to begin.</p>
            )}
            {existingBid.status === "rejected" && (
              <p className="text-sm text-red-600">Your bid was not selected for this task. Keep bidding on others!</p>
            )}
            {existingBid.adminNote && (
              <p className="text-xs text-gray-600 mt-1 bg-white/60 rounded px-2 py-1">Admin note: {existingBid.adminNote}</p>
            )}
          </div>
        )}

        {/* Bid form (only if no existing bid) */}
        {!existingBid && (
          <>
            <p className="text-sm text-gray-500">Tell the admin why you're the best fit for this task. Be specific about your experience and approach.</p>

            <textarea
              value={bidText}
              onChange={e => setBidText(e.target.value)}
              placeholder="e.g. I have 3 years of academic writing experience, specialising in literature reviews and research methodology. I can deliver a well-structured piece before the deadline..."
              rows={5}
              disabled={bidStage === "submitting" || bidStage === "success"}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm resize-none disabled:opacity-60"
            />

            <div className="flex items-center justify-between">
              <span className={`text-xs ${bidText.length < 10 ? "text-gray-300" : "text-gray-400"}`}>
                {bidText.length} chars {bidText.length < 10 ? `(min 10)` : "✓"}
              </span>
            </div>

            {bidStage === "error" && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{bidMessage}</p>
            )}

            {bidStage === "success" && (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 font-semibold">{bidMessage}</p>
            )}

            <button
              onClick={submitBid}
              disabled={bidStage === "submitting" || bidStage === "success"}
              className="w-full py-3 bg-[#FF7A00] hover:bg-[#e56d00] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {bidStage === "submitting"
                ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                : <><Send size={16} /> Submit Bid</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, sub, urgency }) {
  return (
    <div className={`rounded-xl border p-3 space-y-0.5 ${urgency ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className={`text-sm font-bold leading-snug ${urgency ? "text-red-600" : "text-gray-800"}`}>{value}</p>
      {sub && <p className={`text-xs ${urgency ? "text-red-500 font-semibold" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}
