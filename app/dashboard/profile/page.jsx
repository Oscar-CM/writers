"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { setProfile(d.profile); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-600 mt-20">Loading profile...</p>;
  if (!profile) return <p className="text-center text-gray-500 mt-20">No profile information found.</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-md"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>

      <div className="space-y-4">
        <ProfileItem label="Full Name" value={profile.fullName} />
        <ProfileItem label="Email" value={profile.email} />
        <ProfileItem label="Phone Number" value={profile.phone} />
        <ProfileItem label="Country" value={profile.country} />
        <ProfileItem label="Writing Level" value={profile.writingLevel} />
        <ProfileItem
          label="Account Status"
          value={profile.activated ? "Active" : "Inactive — please activate"}
          highlight={!profile.activated}
        />
        <ProfileItem label="Joined" value={new Date(profile.createdAt).toDateString()} />
      </div>
    </motion.div>
  );
}

function ProfileItem({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? 'text-red-600' : 'text-gray-800'}`}>{value || "—"}</p>
    </div>
  );
}
