"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Calendar,
  User,
  Code,
  Briefcase,
  Star,
  Mail,
  Wallet,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer state (24 hours = 86400 seconds)
  const [timeLeft, setTimeLeft] = useState(0);

  // Task counts
  const [basicTasks, setBasicTasks] = useState(0);
  const [premiumTasks, setPremiumTasks] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, activated, country, writing_level, referral_code")
        .eq("user_id", session.user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  // ------------------------------
  // 24-Hour Midnight Reset Timer
  // ------------------------------
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();

      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // next midnight

      const diff = Math.floor((midnight - now) / 1000);
      setTimeLeft(diff >= 0 ? diff : 86400); // reset if passed

      // Task reduction logic
      const totalBasic = 439;
      const totalPremium = 246;
      const totalSeconds = 86400;

      const percent = diff / totalSeconds;

      setBasicTasks(Math.max(0, Math.floor(totalBasic * percent)));
      setPremiumTasks(Math.max(0, Math.floor(totalPremium * percent)));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time left
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) return <p>Loading dashboard...</p>;

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const totalTasks = basicTasks + premiumTasks;
  const now = new Date().toLocaleString();
  const accountStatus = profile?.activated ? "ACTIVE" : "INACTIVE";

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold">
        Welcome back, <span className="text-[#FF7A00]">{firstName}</span> 👋
      </h1>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {/* Countdown */}
        <DashboardCard
          icon={<Clock size={28} className="text-[#FF7A00]" />}
          title="Time remaining to new task(s)"
          value={formatTime(timeLeft)}
        />

        {/* Training */}
        <DashboardCard
          icon={<BookOpen size={28} className="text-blue-600" />}
          title="TRAINING TAKING PLACE!"
          highlight
        />

        {/* Date Time */}
        <DashboardCard
          icon={<Calendar size={28} className="text-green-600" />}
          title="Today's Date & Time"
          value={now}
        />
      </div>

      {/* Tasks Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardCard
          icon={<Star size={28} className="text-yellow-500" />}
          title="Basic Level Tasks"
          value={`${basicTasks} task(s)`}
        />
        <DashboardCard
          icon={<Star size={28} className="text-purple-600" />}
          title="Premium Level Tasks"
          value={`${premiumTasks} task(s)`}
        />
        <DashboardCard
          icon={<Star size={28} className="text-[#FF7A00]" />}
          title="TOTAL"
          value={`${totalTasks} task(s)`}
        />
      </div>

     <Link href="dashboard/training">
  <div className="bg-[#FF7A00] text-white p-4 rounded-xl shadow text-center cursor-pointer hover:bg-[#e96d00] transition">
    <p className="font-bold text-lg">ENROLL TRAINING?</p>
    <p className="underline mt-1">CLICK TO ENROLL NOW</p>
  </div>
</Link>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardCard icon={<Briefcase size={24} />} title="SAMPLE TASK(S)" value="CLICK TO ACCESS" highlight />
        <DashboardCard icon={<Wallet size={24} />} title="TOTAL MONEY IN" value="KES 0.00" />
        <DashboardCard icon={<Wallet size={24} />} title="ACCOUNT BALANCE" value="KES 0.00" />
        <DashboardCard icon={<Wallet size={24} />} title="TOTAL CASH OUT" value="KES 0.00" />
      </div>

      {/* Warning Message */}
      <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <AlertTriangle className="text-red-600" />
          <p className="font-bold text-lg">TAKE CAUTION ⚠️⚠️</p>
        </div>
        <p className="mt-2 text-sm">
          HOW TO ACTIVATE YOUR ACCOUNT (USE PROVIDED METHOD ONLY)  
          <br /> 🔸 Click on the red button written “ACTIVATE NOW” above.
        </p>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardCard icon={<Mail size={24} />} title="OUR SUPPORT EMAIL" value="support@writemaster.com" />
        <DashboardCard icon={<User size={24} />} title="FULL NAME" value={profile.full_name} />
        <DashboardCard icon={<Code size={24} />} title="ACCOUNT STATUS" value={accountStatus} highlightRed={!profile?.activated} />
        <DashboardCard icon={<Code size={24} />} title="ACCOUNT LEVEL" value={accountStatus} highlightRed={!profile?.activated} />
      </div>

    </div>
  );
}

// ---------------------------------------
// Dashboard Card Component
// ---------------------------------------
function DashboardCard({ icon, title, value, highlight, highlightRed }) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border shadow-sm bg-white 
        ${highlight ? "border-[#FF7A00] bg-[#FFF4E8]" : ""}
        ${highlightRed ? "border-red-400 bg-red-50 text-red-700" : ""}
      `}
    >
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm sm:text-base font-semibold text-gray-600">{title}</p>
          {value && <p className="text-base sm:text-lg font-bold">{value}</p>}
        </div>
      </div>
    </div>
  );
}
