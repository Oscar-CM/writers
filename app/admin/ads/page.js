'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, X, Check, Upload, Loader2, ToggleLeft, ToggleRight, ExternalLink, ImageIcon, Pencil } from 'lucide-react';

const emptyForm = { title: '', linkUrl: '', description: '', imageKey: '' };

export default function AdminAds() {
  const [adList, setAdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const imgRef = useRef();

  const load = () => {
    fetch('/api/admin/ads').then(r => r.json()).then(d => { setAdList(d.ads || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const openNew = () => { setForm(emptyForm); setEditId(null); setPreviewUrl(''); setShowForm(true); };
  const openEdit = (ad) => {
    setForm({ title: ad.title, linkUrl: ad.linkUrl || '', description: ad.description || '', imageKey: ad.imageKey || '' });
    setPreviewUrl(ad.imageUrl || '');
    setEditId(ad.id);
    setShowForm(true);
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/admin/ads/image', { method: 'POST', body: fd });
    const d = await res.json();
    setUploadingImg(false);
    if (d.key) {
      setForm(f => ({ ...f, imageKey: d.key }));
      setPreviewUrl(d.url);
    }
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    if (editId) {
      await fetch(`/api/admin/ads/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/admin/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setShowForm(false);
    setForm(emptyForm);
    setPreviewUrl('');
    setEditId(null);
    load();
  };

  const toggleActive = async (ad) => {
    await fetch(`/api/admin/ads/${ad.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !ad.active }) });
    load();
  };

  const deleteAd = async (id, title) => {
    if (!confirm(`Delete ad "${title}"?`)) return;
    await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={26} className="animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Advertisements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {adList.filter(a => a.active).length} active · {adList.length} total — these are shown inside articles
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-semibold rounded-lg transition">
          <Plus size={15} /> New Ad
        </button>
      </div>

      {/* How ads work info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">How article ads work:</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>Each article has 3 ad slots (top, mid, bottom)</li>
          <li>By default, active ads are picked <strong>at random</strong> for each slot</li>
          <li>In the article editor you can <strong>assign specific ads</strong> to specific slots</li>
          <li>Toggle an ad off to remove it from rotation without deleting it</li>
        </ul>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">{editId ? 'Edit Ad' : 'Create New Ad'}</h2>
            <button onClick={() => { setShowForm(false); setPreviewUrl(''); }}><X size={18} className="text-gray-400" /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Ad Name / Title *</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. WriteMaster Pro Plan"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Click URL (optional)</label>
              <input value={form.linkUrl} onChange={set('linkUrl')} placeholder="https://example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Short Description (optional)</label>
              <input value={form.description} onChange={set('description')} placeholder="Used as alt text and tooltip"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Image upload */}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-2">Ad Image</label>
              <div className="flex gap-4 items-start">
                {/* Preview */}
                {previewUrl ? (
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <img src={previewUrl} alt="Ad preview" className="w-full h-full object-cover" />
                    <button onClick={() => { setPreviewUrl(''); setForm(f => ({ ...f, imageKey: '' })); }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0">
                    <ImageIcon size={24} className="text-gray-300" />
                  </div>
                )}
                <div className="space-y-2">
                  <input type="file" ref={imgRef} accept="image/*" className="hidden" onChange={e => uploadImage(e.target.files[0])} />
                  <button onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition disabled:opacity-50">
                    {uploadingImg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingImg ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <p className="text-xs text-gray-400">Recommended: 728×90 (leaderboard) or 300×250 (square). JPG/PNG/WebP.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => { setShowForm(false); setPreviewUrl(''); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={save} disabled={saving || !form.title}
              className="flex items-center gap-2 px-5 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving...' : editId ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </div>
      )}

      {/* Ad grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adList.map(ad => (
          <div key={ad.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition ${ad.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            {/* Ad image */}
            <div className="h-28 bg-gray-50 overflow-hidden">
              {ad.imageUrl ? (
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={28} className="text-gray-200" />
                </div>
              )}
            </div>

            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <p className="font-semibold text-gray-800 text-sm leading-snug">{ad.title}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {ad.active ? 'Active' : 'Off'}
                </span>
              </div>

              {ad.description && <p className="text-xs text-gray-500 line-clamp-1">{ad.description}</p>}

              {ad.linkUrl && (
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 truncate">
                  <ExternalLink size={10} /> {ad.linkUrl}
                </a>
              )}

              <div className="flex items-center gap-1.5 pt-1">
                <button onClick={() => toggleActive(ad)} title={ad.active ? 'Deactivate' : 'Activate'}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${ad.active ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                  {ad.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {ad.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => openEdit(ad)} className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteAd(ad.id, ad.title)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {adList.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p>No ads yet. Click &quot;New Ad&quot; to create your first advertisement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
