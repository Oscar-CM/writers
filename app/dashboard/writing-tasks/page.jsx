"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WritingTasksPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const tasksPerPage = 6;
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setLoading(true);

      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      // Load profile only once
      if (!profile) {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name, activated")
          .eq("user_id", session.user.id)
          .single();
        if (isMounted) setProfile(userProfile);
      }

      // Count tasks
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });
      if (isMounted) setTotalTasks(count);

      // Clear previous tasks to prevent duplication
      setTasks([]);

      // Fetch tasks for current page with deterministic ordering & unique IDs
      const from = (page - 1) * tasksPerPage;
      const to = from + tasksPerPage - 1;

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*", { count: "exact" })
        .range(from, to)
        .order("deadline", { ascending: true })
        .order("id", { ascending: true });

      if (isMounted) setTasks(tasksData || []);
      if (isMounted) setLoading(false);
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [page]);

  if (loading) return <p className="text-center mt-10">Loading tasks...</p>;

  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const isActivated = profile?.activated === true;

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    const datePart = date.toLocaleDateString(undefined, options);
    const hour = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${datePart} at ${hour}:00 ${ampm}`;
  };

  return (
    <div className="p-6 space-y-6 relative">

      {/* TOP SECTION */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Writing Tasks
      </h1>

      {/* Activation Banner */}
      {!isActivated && (
        <div className="bg-gradient-to-r from-pink-400 to-orange-400 text-white p-4 rounded-xl shadow-lg text-center space-y-1">
          <p className="font-bold text-lg">✨ Unlock Premium Writing Tasks</p>
          <p className="text-sm opacity-90">
            Activate your account to access full task details, bid on work, and start earning right away.
          </p>
          <Link
            href="/dashboard/manual-activation"
            className="inline-block mt-2 px-5 py-2 rounded-full bg-white text-pink-600 font-semibold shadow-md hover:bg-pink-50 transition"
          >
            Activate My Account ✨
          </Link>
        </div>
      )}

      {/* TASK GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl shadow border bg-white dark:bg-gray-800 transition ${!isActivated ? "blur-sm" : ""}`}
          >
            <h2 className="font-bold text-lg mb-2 dark:text-white">{task.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Level: {task.level}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Word Count: {task.word_count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Earning: ksh {task.base_payout * 25}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Deadline: {formatDeadline(task.deadline)}</p>

            {isActivated && (
              <Link
                href={`/dashboard/writing-tasks/${task.id}`}
                className="mt-3 block bg-orange-600 hover:bg-orange-700 text-white text-center py-2 rounded-lg"
              >
                View Details
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg disabled:opacity-40"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="font-bold text-gray-700 dark:text-white">
          Page {page} / {totalPages}
        </span>

        <button
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg disabled:opacity-40"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
