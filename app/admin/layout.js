'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  BookOpen,
  CreditCard,
  GraduationCap,
  Settings,
  MessageSquare,
  Gavel,
  Newspaper,
  Megaphone,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

const adminItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Task Bids', icon: Gavel, path: '/admin/bids' },
  { label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
  { label: 'Articles', icon: Newspaper, path: '/admin/articles' },
  { label: 'Ads', icon: Megaphone, path: '/admin/ads' },
  { label: 'Job Applications', icon: ClipboardList, path: '/admin/applications' },
  { label: 'Training Requests', icon: GraduationCap, path: '/admin/training' },
  { label: 'Tasks', icon: FileText, path: '/admin/tasks' },
  { label: 'Books', icon: BookOpen, path: '/admin/books' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState('Overview');

  if (status === 'loading') return <p className="text-center mt-20">Loading...</p>;

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">

      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[#1e1b4b] rounded-lg shadow-lg border border-indigo-800 text-white"
      >
        <Menu size={22} />
      </button>

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-[#1e1b4b] border-r border-indigo-900
        p-6 transform transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        <div className="overflow-y-auto h-full">
          <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-300">
            <X size={24} />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={22} className="text-indigo-300" />
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
          <p className="text-xs text-indigo-300 mb-8">WriteMaster</p>

          <nav className="space-y-1">
            {adminItems.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => { setActive(label); setSidebarOpen(false); router.push(path); }}
                className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition
                hover:bg-indigo-800
                ${active === label ? 'bg-indigo-700 text-white' : 'text-indigo-200'}`}
              >
                <Icon className="mr-3" size={18} />
                {label}
              </button>
            ))}

            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center w-full px-4 py-3 text-left rounded-lg text-indigo-300 hover:bg-indigo-800/50 mt-4"
            >
              <LayoutDashboard className="mr-3" size={18} />
              Writer Dashboard
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center w-full px-4 py-3 text-left rounded-lg text-red-400 hover:bg-red-900/20 mt-2"
            >
              <LogOut className="mr-3" size={18} />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 p-6 ${sidebarOpen ? 'ml-64' : 'ml-0 md:ml-64'}`}>
        <header className="w-full bg-white shadow-sm border border-gray-200 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Admin</span>
          <div className="text-gray-700 font-semibold text-sm">
            {session?.user?.email}
          </div>
        </header>

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
