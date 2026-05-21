'use client';

import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';

export default function AdminSettings() {
  const [form, setForm] = useState({
    activation_fee: '',
    resources_fee: '',
    activation_description: '',
    ad_slot_1: '',
    ad_slot_2: '',
    ad_slot_3: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        const map = Object.fromEntries(d.settings.map(s => [s.key, s.value]));
        setForm({
          activation_fee: map.activation_fee || '700',
          resources_fee: map.resources_fee || '500',
          activation_description: map.activation_description || '',
          ad_slot_1: map.ad_slot_1 || '',
          ad_slot_2: map.ad_slot_2 || '',
          ad_slot_3: map.ad_slot_3 || '',
        });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure fees and content shown to users</p>
      </div>

      {/* Activation fee */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Account Activation</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activation Fee (KES)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium">KES</span>
            <input
              type="number"
              min="1"
              value={form.activation_fee}
              onChange={e => setForm(f => ({ ...f, activation_fee: e.target.value }))}
              className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            This is the one-time M-Pesa amount users pay to activate their account and access writing tasks.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activation Description
          </label>
          <textarea
            rows={2}
            value={form.activation_description}
            onChange={e => setForm(f => ({ ...f, activation_description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="Describe what users get when they activate..."
          />
        </div>
      </section>

      {/* Resources fee */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Writing Resources</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resources Unlock Fee (KES)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium">KES</span>
            <input
              type="number"
              min="1"
              value={form.resources_fee}
              onChange={e => setForm(f => ({ ...f, resources_fee: e.target.value }))}
              className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            One-time fee users pay to permanently unlock the Writing Resources section.
          </p>
        </div>
      </section>

      {/* Ad slots */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-700 border-b pb-2">Article Ad Slots (HTML)</h2>
        <p className="text-xs text-gray-400">Each slot appears inside articles. Use HTML — e.g. an image link, a banner, or a call-to-action. Leave blank to hide.</p>
        {[1, 2, 3].map(n => (
          <div key={n}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Slot {n} {n === 1 ? '(top of article)' : n === 2 ? '(mid article)' : '(bottom of article)'}</label>
            <textarea rows={3} value={form[`ad_slot_${n}`]}
              onChange={e => setForm(f => ({ ...f, [`ad_slot_${n}`]: e.target.value }))}
              placeholder={`<a href="https://..."><img src="..." /></a>`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none font-mono" />
          </div>
        ))}
      </section>

      <button
        onClick={save}
        disabled={saving}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition
          ${saved
            ? 'bg-green-600 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
          }`}
      >
        {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving...' : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  );
}
