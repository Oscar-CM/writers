'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import {
    LayoutDashboard,
    GraduationCap,
    FileText,
    KeySquare,
    Award,
    Upload,
    Wallet,
    History,
    User,
    LogOut,
    Menu,
    X
} from "lucide-react";

export default function DashboardLayout({ children }) {

    // ---------------------------------------
    // 1. STATE (put this at the top)
    // ---------------------------------------
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [active, setActive] = useState("Dashboard");
    const [loading, setLoading] = useState(true);

    // 👉 ADD THIS
    const [firstName, setFirstName] = useState("");

    const items = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "Apply training", icon: GraduationCap, path: "/dashboard/training" },
        { label: "Writing task(s)", icon: FileText, path: "/dashboard/writing-tasks" },
        { label: "Activation", icon: KeySquare, path: "/dashboard/manual-activation" },
        { label: "My Task(s)", icon: Award, path: "/dashboard/my-tasks" },
        { label: "Accounts", icon: Upload, path: "/dashboard/accounts" },
        { label: "Writing Tools", icon: Wallet, path: "/dashboard/writing-tools" },
        { label: "Extras", icon: History, path: "/dashboard/extras" },
        { label: "Profile", icon: User, path: "/dashboard/profile" },
    ];

    // ---------------------------------------
    // 2. LOAD SESSION + FETCH FIRST NAME
    // ---------------------------------------
  useEffect(() => {
    const load = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return router.push("/login");

        // Fetch profile using full_name
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", session.user.id)
            .single();

        if (profile?.full_name) {
            const first = profile.full_name.split(" ")[0];
            setFirstName(first);
        }

        setLoading(false);
    };

    load();
}, [router]);


    const logout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading)
        return <p className="text-center text-gray-600 mt-20">Loading dashboard...</p>;

    // ---------------------------------------
    // 3. RETURN (UI)
    // ---------------------------------------
    return (
        <div className="flex min-h-screen bg-gray-100 text-gray-900">

            {/* Mobile hamburger */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[#3c3c3f] rounded-lg shadow-lg border border-gray-700 text-gray-200"
            >
                <Menu size={22} />
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed z-40 inset-y-0 left-0 w-64 bg-[#0D0D0F] border-r border-gray-800 
                p-6 transform transition-all duration-300 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0`}
            >

                {/* Close button (mobile) */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-gray-300"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-[#FF7A00] mb-10">WriteMaster</h2>

                <nav className="space-y-1">
                    {items.map(({ label, icon: Icon, path }) => (
                        <button
                            key={label}
                            onClick={() => {
                                setActive(label);
                                setSidebarOpen(false);
                                router.push(path);
                            }}
                            className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition
                            hover:bg-[#1A1A1D] 
                            ${active === label ? "bg-[#1F1F22] text-[#FF7A00]" : "text-gray-300"}`}
                        >
                            <Icon className="mr-3" size={20} />
                            {label}
                        </button>
                    ))}

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-left rounded-lg text-red-400 hover:bg-red-900/20 mt-4"
                    >
                        <LogOut className="mr-3" size={20} />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* ---------------------------------------
               MAIN CONTENT (THIS IS WHERE THE HEADER GOES)
            ----------------------------------------- */}
            <div
                className={`flex-1 transition-all duration-300 p-6
                    ${sidebarOpen ? "ml-64 md:ml-64" : "ml-0 md:ml-64"}`}
            >

                {/* HEADER — PLACE THIS EXACT BLOCK */}
                <header className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-6 py-4 mb-6 flex justify-end">
                    <div className="text-gray-700 font-semibold">
                        Hello, <span className="text-[#FF7A00]">{firstName || "User"}</span>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[70vh] shadow-md">
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
