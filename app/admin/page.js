'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, GraduationCap, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading stats...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">WriteMaster admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard icon={<Users size={26} className="text-indigo-600" />} label="Total Users" value={stats?.totalUsers ?? '—'} href="/admin/users" />
        <StatCard icon={<UserCheck size={26} className="text-green-600" />} label="Active (Paid)" value={stats?.activeUsers ?? '—'} href="/admin/users" />
        <StatCard icon={<FileText size={26} className="text-orange-500" />} label="Total Tasks" value={stats?.totalTasks ?? '—'} href="/admin/tasks" />
        <StatCard icon={<ClipboardList size={26} className="text-pink-500" />} label="Pending Job Applications" value={stats?.pendingApplications ?? '—'} href="/admin/applications" badge />
        <StatCard icon={<GraduationCap size={26} className="text-blue-500" />} label="Pending Training Requests" value={stats?.pendingTraining ?? '—'} href="/admin/training" badge />
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/tasks" className="px-5 py-2.5 bg-[#FF7A00] text-white rounded-lg hover:bg-[#e56d00] transition text-sm font-medium">
            + Add Task
          </Link>
          <Link href="/admin/applications" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            Review Applications
          </Link>
          <Link href="/admin/users" className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href, badge }) {
  return (
    <Link href={href}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 relative">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        {badge && value > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {value} new
          </span>
        )}
      </div>
    </Link>
  );
}
