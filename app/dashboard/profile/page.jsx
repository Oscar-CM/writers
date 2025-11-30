"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return router.push("/login");

      // Fetch profile details
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!error) setProfile(data);

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  if (loading)
    return <p className="text-center text-gray-600 mt-20">Loading profile...</p>;

  if (!profile)
    return (
      <p className="text-center text-gray-500 mt-20">
        No profile information found.
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-md"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>

      <div className="space-y-4">
        <ProfileItem label="Full Name" value={profile.full_name} />
        <ProfileItem label="Email" value={profile.email} />
        <ProfileItem label="Phone Number" value={profile.phone} />
        <ProfileItem label="Country" value={profile.country} />
        <ProfileItem label="Account Status" value={profile.status} />
        <ProfileItem label="Joined" value={new Date(profile.created_at).toDateString()} />
      </div>
    </motion.div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}
