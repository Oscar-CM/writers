"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function SingleTaskPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [task, setTask] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bidDescription, setBidDescription] = useState("");
  const [bidSuccess, setBidSuccess] = useState(""); // Success message state

  useEffect(() => {
    const loadTask = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      // Load profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("activated")
        .eq("user_id", session.user.id)
        .single();
      setProfile(userProfile);

      // Load task
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
      setTask(data);
    };

    loadTask();
  }, [id, router]);

  if (!task) return <p className="text-center mt-10">Loading…</p>;

  if (!profile?.activated)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold mb-2">Account Not Activated</h2>
        <p>You must activate your account to view this task.</p>
      </div>
    );

  // Format deadline as "MM/DD/YYYY at HH:00 AM/PM"
  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    const datePart = date.toLocaleDateString(undefined, options);
    const hour = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${datePart} at ${hour}:00 ${ampm}`;
  };

  // Handle bidding
  const handleBid = async () => {
    if (bidDescription.length < 10) {
      alert("Bid description must be at least 10 characters.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    await supabase.from("task_bids").insert([
      {
        task_id: id,
        user_id: session.user.id,
        bid_description: bidDescription,
        created_at: new Date(),
      },
    ]);

    // Show fun success message
    const messages = [
      "🎉 All the best! Your bid has been submitted successfully! 🚀",
      "🔥 Go get it! Your bid is in!",
      "💪 Fingers crossed! Bid submitted!",
      "✨ Success! Your bid is now live!",
      "🚀 All the best! Your bid is officially submitted!"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setBidSuccess(randomMessage);

    setBidDescription("");

    // Hide message after 5 seconds
    setTimeout(() => setBidSuccess(""), 5000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {task.title}
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border space-y-2">
        <p><strong>Level:</strong> {task.level}</p>
        <p><strong>Word Count:</strong> {task.word_count}</p>
        <p><strong>Deadline:</strong> {formatDeadline(task.deadline)}</p>
        <p><strong>Amount to be Paid:</strong> ksh {task.base_payout * 25}</p>

        <div className="mt-4">
          <p><strong>Instructions:</strong></p>
          <p className="text-gray-700 dark:text-gray-300">{task.instructions}</p>
        </div>

        {/* Bid section */}
        <div className="mt-6">
          {/* Success message */}
          {bidSuccess && (
            <div className="mb-3 p-3 bg-green-100 text-green-800 rounded-lg font-semibold animate-pulse">
              {bidSuccess}
            </div>
          )}

          <textarea
            value={bidDescription}
            onChange={(e) => setBidDescription(e.target.value)}
            placeholder="Explain why you should be chosen..."
            className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-900"
            rows={4}
          ></textarea>

          <button
            onClick={handleBid}
            className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold"
          >
            Submit Bid
          </button>
        </div>
      </div>
    </div>
  );
}
