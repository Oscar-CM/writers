'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PenLine, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const PERKS = [
  'Access writing tasks and earn in KES',
  'Premium writing resources & guides',
  'Tools: ChatGPT, Grammarly, Turnitin',
  'Join a thriving writers community',
];

export default function SignUpPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', country: '', writingLevel: '', referralCode: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Something went wrong.'); setLoading(false); return; }
    router.push('/login?registered=1');
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-[#1A0A00] text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="border-b border-white/30" style={{ height: '40px', marginTop: `${i * 40}px` }} />
          ))}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00]/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF7A00]/5 rounded-full translate-y-24 -translate-x-16 blur-2xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-[#FF7A00] font-bold text-xl">
            <PenLine size={22} /> WriteMaster
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="text-4xl font-black leading-tight">
            Turn your writing<br />
            into <span className="text-[#FF7A00]">income.</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Join WriteMaster and get access to writing tasks, training, tools, and a community that helps you grow.
          </p>
          <ul className="space-y-3">
            {PERKS.map(p => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-white/80">
                <span className="w-5 h-5 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-[#FF7A00]" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} WriteMaster
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-start justify-center bg-[#FAFAF8] px-6 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6 py-4"
        >
          <div className="lg:hidden flex items-center gap-2 text-[#FF7A00] font-bold text-xl">
            <PenLine size={20} /> WriteMaster
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1 text-sm">Start your writing journey today</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
              <input type="text" value={form.fullName} onChange={set('fullName')} required placeholder="Jane Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                <input type="text" value={form.country} onChange={set('country')} placeholder="Kenya"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Writing Level</label>
              <select value={form.writingLevel} onChange={set('writingLevel')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition">
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Referral Code (optional)</label>
              <input type="text" value={form.referralCode} onChange={set('referralCode')} placeholder="e.g. WRITER2024"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm transition" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white font-bold rounded-xl transition shadow-lg shadow-orange-200 disabled:opacity-60 text-sm mt-2">
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF7A00] font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
