"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Clock, FileText, ChevronRight, Search, Loader2 } from "lucide-react";

function timeUntil(d) {
  if (!d) return null;
  const diff = new Date(d) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return { label: `${days}d ${hours}h`, urgent: days < 1 };
  return { label: `${hours}h`, urgent: true };
}

function formatDeadline(d) {
  if (!d) return "No deadline";
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

const levelStyle = {
  premium: "bg-purple-100 text-purple-700 border-purple-200",
  basic: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function WritingTasksPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const tasksPerPage = 6;

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.profile));
  }, []);

  useEffect(() => {
    if (profile === null) return;
    if (profile && !profile.activated) { router.replace("/dashboard/manual-activation"); return; }

    setLoading(true);
    fetch(`/api/tasks?page=${page}`)
      .then(r => r.json())
      .then(d => { setTasks(d.tasks || []); setTotal(d.total || 0); setLoading(false); });
  }, [page, profile, router]);

  if (!profile || (profile && !profile.activated)) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-gray-400" /></div>;
  }

  const displayed = tasks
    .filter(t => levelFilter === "all" || t.level === levelFilter)
    .filter(t => !search || t.title?.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(total / tasksPerPage);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Writing Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} active {total === 1 ? "task" : "tasks"} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 w-44"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {["all", "basic", "premium"].map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition
                  ${levelFilter === l ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(task => {
              const payout = task.basePayout ? (parseFloat(task.basePayout) * 120).toFixed(0) : null;
              const timer = timeUntil(task.deadline);
              return (
                <Link key={task.id} href={`/dashboard/writing-tasks/${task.id}`}>
                  <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer h-full flex flex-col">

                    {/* Top: level + urgency badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${levelStyle[task.level] || levelStyle.basic}`}>
                        {task.level}
                      </span>
                      {timer?.urgent && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 animate-pulse">
                          ⚡ {timer.label}
                        </span>
                      )}
                      {timer && !timer.urgent && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {timer.label}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-bold text-gray-900 text-sm leading-snug mb-3 flex-1 group-hover:text-[#FF7A00] transition-colors line-clamp-2">
                      {task.title}
                    </h2>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      {task.wordCount && (
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {task.wordCount.toLocaleString()} words
                        </span>
                      )}
                      {payout && (
                        <span className="text-green-600 font-semibold">
                          KES {payout}
                        </span>
                      )}
                    </div>

                    {/* Deadline bar */}
                    <div className={`flex items-center justify-between text-xs rounded-lg px-3 py-2
                      ${timer?.urgent ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> Due {formatDeadline(task.deadline)}
                      </span>
                      <span className="flex items-center gap-0.5 font-semibold text-[#FF7A00] group-hover:gap-1 transition-all">
                        Bid <ChevronRight size={12} />
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>

          {displayed.length === 0 && (
            <div className="text-center py-16 space-y-2">
              <p className="text-2xl">📋</p>
              <p className="text-gray-500 font-medium">
                {search ? `No tasks matching "${search}"` : "No tasks available right now."}
              </p>
              <p className="text-gray-400 text-sm">New tasks are posted daily — check back soon.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40">
                ← Prev
              </button>
              <span className="text-sm text-gray-600 font-medium">Page {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
