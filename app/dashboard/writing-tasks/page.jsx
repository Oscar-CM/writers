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

  // Load user activation + tasks
  useEffect(() => {
    const loadPage = async () => {
      // auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      // profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, activated")
        .eq("user_id", session.user.id)
        .single();

      setProfile(userProfile);

      // count total tasks
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });

      setTotalTasks(count);

      // fetch tasks with pagination
      const from = (page - 1) * tasksPerPage;
      const to = from + tasksPerPage - 1;

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .range(from, to)
        .order("deadline", { ascending: true });

      setTasks(tasksData || []);
      setLoading(false);
    };

    loadPage();
  }, [page]);

  if (loading) return <p className="text-center mt-10">Loading tasks...</p>;

  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const isActivated = profile?.activated === true;

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Writing Tasks
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">

        {!isActivated && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white rounded-xl">
            <p className="text-lg font-bold">Your account is not activated</p>
            <p className="text-sm">Activate your account to view tasks</p>
            <Link
              href="/dashboard/activation"
              className="mt-3 px-4 py-2 bg-orange-500 rounded-lg"
            >
              Activate Now
            </Link>
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl shadow border bg-white dark:bg-gray-800 
              ${!isActivated ? "blur-sm pointer-events-none" : ""}`}
          >
            <h2 className="font-bold text-lg mb-2 dark:text-white">{task.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Level: {task.level}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Word count: {task.word_count}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Deadline: {new Date(task.deadline).toLocaleString()}
            </p>

            <Link
              href={`/dashboard/writing-tasks/${task.id}`}
              className="mt-3 block bg-orange-600 hover:bg-orange-700 text-white text-center py-2 rounded-lg"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg disabled:opacity-40"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="text-gray-700 dark:text-white font-bold">
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
