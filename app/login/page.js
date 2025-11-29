'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if profile exists
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (!profileData) {
      setError('Profile not found. Please sign up.');
      setLoading(false);
      return;
    }

    // Optional: check activation status here
    // if (!profileData.activated) router.push('/payment');

    router.push('/dashboard'); // redirect to dashboard
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F3] dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg bg-white/90 dark:bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700"
      >
        <h1 className="text-4xl font-extrabold text-center mb-6 text-[#FF7A00]">Log In</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none"
          />

          {error && (
            <p className="text-red-600 text-sm bg-red-100 dark:bg-red-900 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF7A00] text-white rounded-xl text-lg hover:bg-[#E56700] transition shadow-lg"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Don’t have an account?{' '}
          <a href="/signup" className="text-[#FF7A00] hover:underline">
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
