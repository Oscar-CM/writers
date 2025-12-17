"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Calendar,
  User,
  Wallet,
  Briefcase,
  Star,
  Mail,
  MessageCircle,
  Send,
  AlertTriangle
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer (24 hours)
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

  // Midnight refresh timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = Math.floor((midnight - now) / 1000);
      setTimeLeft(diff >= 0 ? diff : 86400);

      // Dynamic tasks reduction
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

  // Timer formatting
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) return <p>Loading dashboard...</p>;

  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const accountStatus = profile?.activated ? "ACTIVE" : "INACTIVE";
  const now = new Date().toLocaleString();
  const totalTasks = basicTasks + premiumTasks;

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold">
        Welcome back, <span className="text-[#FF7A00]">{firstName}</span> 👋
      </h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
        <DashboardCard
          icon={<Clock size={28} className="text-[#FF7A00]" />}
          title="Time remaining to new tasks"
          value={formatTime(timeLeft)}
        />

        <DashboardCard
          icon={<BookOpen size={28} className="text-blue-600" />}
          title="TRAINING ONGOING"
          highlight
        />

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
          title="Total Tasks"
          value={`${totalTasks} task(s)`}
        />
      </div>

      {/* ENROLL TRAINING */}
      <Link href="/dashboard/training">
        <div className="bg-[#FF7A00] text-white p-4 rounded-xl shadow text-center cursor-pointer hover:bg-[#e96d00] transition">
          <p className="font-bold text-lg">ENROLL TRAINING?</p>
          <p className="underline mt-1">CLICK TO ENROLL NOW</p>
        </div>
      </Link>

      {/* PRIORITY ACTION PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {/* Activate Account */}
        <Link href="/dashboard/manual-activation">
          <div className={`p-4 rounded-xl shadow border cursor-pointer transition 
            ${profile?.activated 
              ? "bg-white hover:bg-gray-50" 
              : "bg-red-50 border-red-400 text-red-700 hover:bg-red-100"}
          `}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`${profile?.activated ? "text-gray-600" : "text-red-600"}`} />
              <div>
                <p className="font-bold">
                  {profile?.activated ? "ACCOUNT VERIFIED" : "ACTIVATE ACCOUNT"}
                </p>
                {!profile?.activated && <p className="text-sm">Click to activate</p>}
              </div>
            </div>
          </div>
        </Link>

        {/* WhatsApp */}
        <Link href="https://chat.whatsapp.com/IgciTwEQhMn35pzARrrAo1" target="_blank">
          <div className="p-4 rounded-xl shadow border bg-green-50 hover:bg-green-100 cursor-pointer transition">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-green-600" />
              <div>
                <p className="font-bold">WHATSAPP GROUP</p>
                <p className="text-sm">Click to join</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Telegram */}
        <Link href="https://t.me/yourchannel" target="_blank">
          <div className="p-4 rounded-xl shadow border bg-blue-50 hover:bg-blue-100 cursor-pointer transition">
            <div className="flex items-center gap-3">
              <Send className="text-blue-600" />
              <div>
                <p className="font-bold">TELEGRAM CHANNEL</p>
                <p className="text-sm">Click to join</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* User Info & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardCard icon={<Wallet size={24} />} title="TOTAL IN" value="KES 0.00" />
        <DashboardCard icon={<Wallet size={24} />} title="BALANCE" value="KES 0.00" />
        <DashboardCard icon={<Wallet size={24} />} title="CASH OUT" value="KES 0.00" />
        <DashboardCard icon={<Mail size={24} />} title="SUPPORT EMAIL" value="info@masterwriters.org" />
        <DashboardCard icon={<User size={24} />} title="FULL NAME" value={profile.full_name} />
        <DashboardCard 
          icon={<User size={24} />} 
          title="ACCOUNT STATUS" 
          value={accountStatus} 
          highlightRed={!profile?.activated}
        />
        <DashboardCard 
          icon={<Star size={24} />} 
          title="ACCOUNT LEVEL" 
          value={profile?.writing_level || "N/A"} 
        />
      </div>

    </div>
  );
}

/* ---------------------------------------
   Dashboard Card Component
----------------------------------------*/
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
