'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ApplyPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    writingLevel: '',
    experience: '',
    motivation: '',
    portfolio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F3] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for applying to WriteMaster. We review all applications carefully and will get back to you within 3–5 business days.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-[#FF7A00] text-white rounded-xl hover:bg-[#e56d00] transition font-semibold">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-[#FF7A00] text-sm font-bold uppercase tracking-widest">Join the Team</span>
            <h1 className="text-4xl font-extrabold mt-2 text-gray-900 dark:text-white">Apply to WriteMaster</h1>
            <p className="mt-3 text-gray-500 text-base">
              We&apos;re looking for talented writers to join our growing platform. Tell us about yourself and we&apos;ll be in touch.
            </p>
          </div>

          {/* What we look for */}
          <div className="bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-8">
            <h2 className="font-bold text-gray-800 dark:text-white mb-3">What we look for</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {[
                'Strong written English and attention to detail',
                'Ability to meet deadlines consistently',
                'Experience with academic, blog, or content writing',
                'Willingness to learn and take feedback',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#FF7A00] font-bold mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={set('fullName')} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                  <input type="email" value={form.email} onChange={set('email')} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <input type="text" value={form.country} onChange={set('country')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Writing Level</label>
                  <select value={form.writingLevel} onChange={set('writingLevel')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm">
                    <option value="">Select your level</option>
                    <option value="beginner">Beginner (less than 1 year)</option>
                    <option value="intermediate">Intermediate (1–3 years)</option>
                    <option value="advanced">Advanced (3+ years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Writing Experience</label>
                <textarea
                  value={form.experience}
                  onChange={set('experience')}
                  rows={3}
                  placeholder="Describe your writing background — past jobs, niches you've worked in, platforms you've used..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why do you want to join WriteMaster? *</label>
                <textarea
                  value={form.motivation}
                  onChange={set('motivation')}
                  rows={4}
                  required
                  placeholder="Tell us what draws you to this opportunity and what you hope to achieve..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio URL (optional)</label>
                <input type="url" value={form.portfolio} onChange={set('portfolio')} placeholder="https://yourportfolio.com" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm" />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-100 dark:bg-red-900 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#FF7A00] text-white rounded-xl text-base font-bold hover:bg-[#E56700] transition shadow-lg disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-[#FF7A00] hover:underline">Log in</a>
            {' · '}
            <a href="/signup" className="text-[#FF7A00] hover:underline">Sign up as a writer</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
