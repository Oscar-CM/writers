'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PenLine, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const QUOTES = [
  { text: "A writer only begins a book. A reader finishes it.", author: "Samuel Johnson" },
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
  { text: "The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
];

export default function LoginPage() {
  const [quote, setQuote] = useState(QUOTES[0]);
  // Run random selection only on client to avoid hydration mismatch
  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) { setError('Invalid email or password.'); setLoading(false); return; }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel — writing theme */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#1A0A00] text-white p-12 relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="border-b border-white/30" style={{ height: '40px', marginTop: `${i * 40}px` }} />
          ))}
        </div>

        {/* Ink splatter decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00]/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF7A00]/5 rounded-full translate-y-24 -translate-x-16 blur-2xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-[#FF7A00] font-bold text-xl">
            <PenLine size={22} /> WriteMaster
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="text-5xl font-black leading-tight text-white/90">
            Words have<br />
            <span className="text-[#FF7A00]">power.</span>
          </div>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Join thousands of writers earning from their craft. Log in to access your tasks, resources, and community.
          </p>
        </div>

        <div className="relative z-10 border-l-2 border-[#FF7A00]/40 pl-5">
          <p className="text-white/80 text-base italic leading-relaxed"
            dangerouslySetInnerHTML={{ __html: `"${quote.text}"` }} />
          <p className="text-[#FF7A00] text-sm font-semibold mt-2">— {quote.author}</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#FAFAF8] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 text-[#FF7A00] font-bold text-xl">
            <PenLine size={20} /> WriteMaster
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your writer account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none text-sm transition" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none text-sm transition pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white font-bold rounded-xl transition shadow-lg shadow-orange-200 disabled:opacity-60 text-sm">
              {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#FF7A00] font-semibold hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
