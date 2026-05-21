'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+254', country: 'Kenya' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+234', country: 'Nigeria' },
  { code: '+255', country: 'Tanzania' },
  { code: '+250', country: 'Rwanda' },
  { code: '+256', country: 'Uganda' },
  { code: '+263', country: 'Zimbabwe' },
  { code: '+27', country: 'South Africa' },
];

export default function ApplyTrainingPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ countryCode: '+254', phoneNumber: '', email: '', experienceLevel: '', goals: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!/^\d{6,15}$/.test(form.phoneNumber)) {
      setMessage('Please enter a valid phone number.');
      setMessageType('error');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: `${form.countryCode}${form.phoneNumber}`,
        email: form.email,
        experienceLevel: form.experienceLevel,
        goals: form.goals,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || 'Submission failed. Please try again.');
      setMessageType('error');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <CheckCircle size={52} className="text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Application Submitted!</h2>
        <p className="text-gray-500 max-w-sm">
          Your training application has been received. Our team will review it and get in touch with you.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply for Training</h1>
        <p className="text-sm text-gray-500 mt-1">Trainings are conducted based on need with one-on-one sessions.</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> You will be contacted by our training team after your application is reviewed.
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm ${messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-300' : 'bg-green-50 text-green-700 border border-green-300'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
          <div className="flex gap-2">
            <select value={form.countryCode} onChange={set('countryCode')}
              className="px-2 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400">
              {COUNTRY_CODES.map(({ code, country }) => (
                <option key={code} value={code}>{country} ({code})</option>
              ))}
            </select>
            <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')}
              placeholder="7XXXXXXXX" required
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        {/* Experience level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Experience Level</label>
          <select value={form.experienceLevel} onChange={set('experienceLevel')} required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="">Select your level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Your Goals & Expectations</label>
          <textarea value={form.goals} onChange={set('goals')} rows={4} required
            placeholder="What do you hope to gain from this training? What specific skills are you looking to develop?"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#FF7A00] hover:bg-[#e56d00] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
