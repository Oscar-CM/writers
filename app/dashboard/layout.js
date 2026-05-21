'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Award,
  BookOpen,
  Wrench,
  BookMarked,
  Globe,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  KeySquare,
  MessageSquare,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return <p className="text-center text-gray-600 mt-20">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const firstName = session?.user?.name?.split(' ')[0] || 'User';
  const isAdmin = session?.user?.role === 'admin';

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Activate Account', icon: KeySquare, path: '/dashboard/manual-activation', activationItem: true },
    { label: 'Writing Tasks', icon: FileText, path: '/dashboard/writing-tasks' },
    { label: 'My Tasks', icon: Award, path: '/dashboard/my-tasks' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    { label: 'Resources', icon: BookOpen, path: '/dashboard/writing-resources' },
    { label: 'Writing Tools', icon: Wrench, path: '/dashboard/writing-tools' },
    { label: 'Ebooks', icon: BookMarked, path: '/dashboard/books' },
    { label: 'Extras', icon: Globe, path: '/dashboard/extras' },
    { label: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[#0D0D0F] rounded-lg shadow-lg border border-gray-700 text-gray-200"
      >
        <Menu size={22} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-60 bg-[#0D0D0F] border-r border-gray-800
        p-5 transform transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-400">
            <X size={22} />
          </button>

          <h2 className="text-xl font-bold text-[#FF7A00] mb-8 mt-2">WriteMaster</h2>

          <nav className="space-y-0.5 flex-1">
            {navItems.map(({ label, icon: Icon, path, activationItem }) => {
              const active = isActive(path);
              return (
                <button
                  key={label}
                  onClick={() => { setSidebarOpen(false); router.push(path); }}
                  className={`flex items-center w-full px-3 py-2.5 text-left rounded-lg transition text-sm
                    ${active
                      ? 'bg-[#1F1F22] text-[#FF7A00] font-semibold'
                      : activationItem
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-gray-400 hover:bg-[#1A1A1D] hover:text-gray-200'
                    }`}
                >
                  <Icon className="mr-3 shrink-0" size={18} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-gray-800 space-y-0.5 mt-4">
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center w-full px-3 py-2.5 text-left rounded-lg text-yellow-400 hover:bg-yellow-900/20 text-sm transition"
              >
                <ShieldCheck className="mr-3 shrink-0" size={18} />
                Admin Panel
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center w-full px-3 py-2.5 text-left rounded-lg text-red-400 hover:bg-red-900/20 text-sm transition"
            >
              <LogOut className="mr-3 shrink-0" size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-60 min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="md:hidden" /> {/* spacer for hamburger */}
          <div className="hidden md:block" />
          <div className="text-gray-700 font-semibold text-sm">
            Hello, <span className="text-[#FF7A00]">{firstName}</span>
          </div>
        </header>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5"
        >
          <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[80vh] shadow-sm">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
