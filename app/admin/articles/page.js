'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, MessageCircle, Globe, BookOpen, X, Check, Upload, Loader2, ImageIcon, ChevronDown, ChevronUp, Monitor, Code } from 'lucide-react';
import { publicCoverUrl } from '@/lib/r2';

const emptyForm = { title: '', excerpt: '', content: '', coverImage: '', status: 'draft' };

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | article
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [insertUrl, setInsertUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [viewComments, setViewComments] = useState(null);
  const [comments, setComments] = useState([]);

  // Ads for slot assignment
  const [allAds, setAllAds] = useState([]);
  const [adSlots, setAdSlots] = useState({ 1: null, 2: null, 3: null }); // slotNum → adId | null
  const [showAdSlots, setShowAdSlots] = useState(false);

  const imgRef = useRef();
  const coverRef = useRef();
  const textareaRef = useRef();

  // Insert/wrap HTML in the content textarea at cursor position
  const format = (type) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = form.content.substring(start, end);
    const before = form.content.substring(0, start);
    const after  = form.content.substring(end);

    const wrapLines = (tag) => sel
      ? sel.split('\n').filter(Boolean).map(l => `  <li>${l.trim()}</li>`).join('\n')
      : `  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>`;

    const insertions = {
      bold:       `<strong>${sel || 'bold text'}</strong>`,
      italic:     `<em>${sel || 'italic text'}</em>`,
      h2:         `\n<h2>${sel || 'Section heading'}</h2>\n`,
      h3:         `\n<h3>${sel || 'Sub-heading'}</h3>\n`,
      ul:         `\n<ul>\n${wrapLines()}\n</ul>\n`,
      ol:         `\n<ol>\n${wrapLines()}\n</ol>\n`,
      blockquote: `\n<blockquote>${sel || 'Quote text here'}</blockquote>\n`,
      hr:         `\n<hr>\n`,
      p:          `\n<p>${sel || 'New paragraph'}</p>\n`,
    };

    const insert = insertions[type];
    if (!insert) return;

    const newContent = before + insert + after;
    setForm(f => ({ ...f, content: newContent }));

    setTimeout(() => {
      ta.focus();
      const pos = start + insert.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const load = () => {
    fetch('/api/admin/articles').then(r => r.json()).then(d => { setArticles(d.articles || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  // Load available ads when entering editor
  useEffect(() => {
    if (editing !== null) {
      fetch('/api/admin/ads').then(r => r.json()).then(d => setAllAds(d.ads || []));
    }
  }, [editing]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
    setCoverPreview('');
    setInsertUrl('');
    setAdSlots({ 1: null, 2: null, 3: null });
    setShowPreview(false);
    setShowAdSlots(false);
  };

  const openEdit = async (a) => {
    setForm({ title: a.title, excerpt: a.excerpt || '', content: a.content, coverImage: a.coverImage || '', status: a.status });
    const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    setCoverPreview(a.coverImage ? `${r2Base}/${a.coverImage}` : '');
    setEditing(a);
    setInsertUrl('');
    setShowPreview(false);
    setShowAdSlots(false);

    // Load existing ad slot assignments
    const res = await fetch(`/api/admin/articles/${a.id}/ad-slots`);
    const d = await res.json();
    const map = { 1: null, 2: null, 3: null };
    (d.slots || []).forEach(s => { map[s.slot] = s.adId || null; });
    setAdSlots(map);
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const save = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    let savedId = editing?.id;

    if (editing === 'new') {
      const res = await fetch('/api/admin/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json();
      savedId = d.article?.id;
    } else {
      await fetch(`/api/admin/articles/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }

    // Save ad slot assignments
    if (savedId) {
      const slots = [1, 2, 3].map(n => ({ slot: n, adId: adSlots[n] || null }));
      await fetch(`/api/admin/articles/${savedId}/ad-slots`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slots }) });
    }

    setSaving(false);
    setEditing(null);
    load();
  };

  const deleteArticle = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    load();
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/admin/articles/image', { method: 'POST', body: fd });
    const d = await res.json();
    setUploadingImg(false);
    if (d.url) setInsertUrl(d.url);
  };

  const insertImageTag = () => {
    if (!insertUrl) return;
    const tag = `\n<img src="${insertUrl}" alt="image" style="max-width:100%;border-radius:8px;margin:12px 0;" />\n`;
    setForm(f => ({ ...f, content: f.content + tag }));
    setInsertUrl('');
  };

  const uploadCover = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    const fd = new FormData();
    fd.append('cover', file);
    const res = await fetch('/api/admin/articles/cover', { method: 'POST', body: fd });
    const d = await res.json();
    setUploadingCover(false);
    if (d.key) {
      setForm(f => ({ ...f, coverImage: d.key }));
      setCoverPreview(d.url || '');
    }
  };

  const openComments = async (article) => {
    setViewComments(article);
    const res = await fetch(`/api/admin/articles/${article.id}`);
    const d = await res.json();
    setComments(d.comments || []);
  };

  const deleteComment = async (commentId) => {
    await fetch(`/api/admin/articles/${viewComments.id}/comments/${commentId}`, { method: 'DELETE' });
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={26} className="animate-spin text-gray-400" /></div>;

  // ── COMMENT VIEWER ──
  if (viewComments) return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setViewComments(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Comments — {viewComments.title}</h1>
          <p className="text-sm text-gray-500">{comments.length} comments · {viewComments.readCount || 0} reads</p>
        </div>
      </div>
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF7A00] font-bold text-sm flex items-center justify-center shrink-0">
                {(c.authorName || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{c.authorName || 'User'}</p>
                <p className="text-sm text-gray-600 mt-0.5">{c.body}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => deleteComment(c.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
        {comments.length === 0 && <p className="text-gray-400 text-center py-8">No comments yet.</p>}
      </div>
    </div>
  );

  // ── EDITOR ──
  if (editing !== null) return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h1 className="text-xl font-bold text-gray-800">
          {editing === 'new' ? 'New Article' : `Editing: ${editing.title}`}
        </h1>
        {editing !== 'new' && (
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <span>Last saved: {new Date(editing.updatedAt || editing.createdAt).toLocaleString()}</span>
            <span>·</span>
            <span><Eye size={11} className="inline mr-0.5" />{editing.readCount || 0} reads</span>
            {editing.status === 'published' && (
              <a href={`/news/${editing.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700">
                <Globe size={11} /> View live
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: form */}
        <div className="space-y-4 bg-white border border-gray-200 rounded-xl p-5">

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="Article title..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Excerpt (shown in listings)</label>
            <textarea value={form.excerpt} onChange={set('excerpt')} rows={2} placeholder="Brief summary shown on the news listing page..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          {/* Cover image upload */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-2">Cover Image</label>
            <input type="file" ref={coverRef} accept="image/*" className="hidden"
              onChange={e => uploadCover(e.target.files[0])} />

            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-36 group">
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button onClick={() => coverRef.current?.click()} disabled={uploadingCover}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100 transition">
                    {uploadingCover ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Replace
                  </button>
                  <button onClick={() => { setForm(f => ({ ...f, coverImage: '' })); setCoverPreview(''); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition">
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => coverRef.current?.click()} disabled={uploadingCover}
                className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50/50 transition text-gray-400 hover:text-orange-500 disabled:opacity-50">
                {uploadingCover
                  ? <><Loader2 size={22} className="animate-spin" /><span className="text-xs">Uploading...</span></>
                  : <><ImageIcon size={22} /><span className="text-xs font-semibold">Click to upload cover image</span><span className="text-[10px]">JPG, PNG, WebP · Goes to covers/ bucket</span></>
                }
              </button>
            )}
          </div>

          {/* Inline image insert */}
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500">Insert Inline Image</p>
            <div className="flex gap-2 items-center flex-wrap">
              <input type="file" ref={imgRef} accept="image/*" className="hidden" onChange={e => uploadImage(e.target.files[0])} />
              <button onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 transition">
                {uploadingImg ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploadingImg ? 'Uploading...' : 'Upload'}
              </button>
              {insertUrl && (
                <>
                  <input value={insertUrl} readOnly className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-500 bg-white font-mono" />
                  <button onClick={insertImageTag}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition">
                    <ImageIcon size={11} /> Insert
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Content *</label>
              <button onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                {showPreview ? <><Code size={11} /> Raw HTML</> : <><Monitor size={11} /> Preview</>}
              </button>
            </div>

            {/* Formatting toolbar */}
            <div className="flex flex-wrap gap-1 mb-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-lg border-b-0 rounded-b-none">
              {[
                { id: 'bold',       label: 'B',    title: 'Bold',            cls: 'font-black' },
                { id: 'italic',     label: 'I',    title: 'Italic',          cls: 'italic' },
                { id: 'h2',         label: 'H2',   title: 'Heading 2',       cls: 'font-bold text-xs' },
                { id: 'h3',         label: 'H3',   title: 'Heading 3',       cls: 'font-bold text-xs' },
              ].map(b => (
                <button key={b.id} type="button" onClick={() => format(b.id)} title={b.title}
                  className={`px-2.5 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition ${b.cls}`}>
                  {b.label}
                </button>
              ))}

              <span className="w-px bg-gray-200 self-stretch mx-0.5" />

              <button type="button" onClick={() => format('ul')} title="Bullet list"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition">
                <span className="text-base leading-none">•</span> List
              </button>
              <button type="button" onClick={() => format('ol')} title="Numbered list"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition">
                <span>1.</span> List
              </button>
              <button type="button" onClick={() => format('blockquote')} title="Block quote"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition">
                <span className="text-orange-400 font-black">&ldquo;</span> Quote
              </button>

              <span className="w-px bg-gray-200 self-stretch mx-0.5" />

              <button type="button" onClick={() => format('p')} title="Paragraph"
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition">
                ¶ Para
              </button>
              <button type="button" onClick={() => format('hr')} title="Horizontal rule"
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition">
                — Line
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={set('content')}
              rows={14}
              placeholder="Start writing... Use the toolbar above for formatting, or write HTML directly."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg rounded-t-none text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y font-mono"
            />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
              <select value={form.status} onChange={set('status')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex-1" />
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={save} disabled={saving || !form.title || !form.content}
              className="flex items-center gap-2 px-5 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving...' : form.status === 'published' ? 'Save & Publish' : 'Save Draft'}
            </button>
          </div>
        </div>

        {/* Right: preview + ad slots */}
        <div className="space-y-4">
          {/* Content preview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Monitor size={15} /> Article Preview
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {form.title ? (
                <div className="space-y-3">
                  {coverPreview && <img src={coverPreview} alt="Cover" className="w-full rounded-lg object-cover max-h-36" />}
                  <h2 className="text-lg font-bold text-gray-900 leading-snug">{form.title}</h2>
                  {form.excerpt && <p className="text-sm text-gray-500 italic">{form.excerpt}</p>}
                  {form.content && (
                    <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.content.replace(/\n/g, '<br>') }} />
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">Fill in the title to see a preview</p>
              )}
            </div>
          </div>

          {/* Ad slot assignment */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdSlots(!showAdSlots)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              <span>Ad Slot Assignment</span>
              {showAdSlots ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showAdSlots && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  Choose which ad appears in each slot, or leave as &quot;Random&quot; to auto-pick from active ads.
                </p>
                {[1, 2, 3].map(slot => (
                  <div key={slot}>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">
                      Slot {slot} — {slot === 1 ? 'Top of article' : slot === 2 ? 'Mid article' : 'Bottom of article'}
                    </label>
                    <select
                      value={adSlots[slot] || ''}
                      onChange={e => setAdSlots(p => ({ ...p, [slot]: e.target.value || null }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="">🎲 Random (auto-pick)</option>
                      {allAds.filter(a => a.active).map(ad => (
                        <option key={ad.id} value={ad.id}>{ad.title}</option>
                      ))}
                      {allAds.filter(a => !a.active).map(ad => (
                        <option key={ad.id} value={ad.id} disabled>{ad.title} (inactive)</option>
                      ))}
                    </select>
                    {adSlots[slot] && (() => {
                      const selected = allAds.find(a => a.id === adSlots[slot]);
                      return selected?.imageUrl ? (
                        <div className="mt-1.5 flex items-center gap-2">
                          <img src={selected.imageUrl} alt={selected.title} className="h-8 rounded object-cover border border-gray-200" />
                          <span className="text-xs text-gray-500">{selected.title}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── ARTICLE LIST ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
          <p className="text-sm text-gray-500">{articles.length} total · {articles.filter(a => a.status === 'published').length} published</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-semibold rounded-lg transition">
          <Plus size={15} /> New Article
        </button>
      </div>

      <div className="space-y-3">
        {articles.map(a => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {a.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Eye size={11} /> {a.readCount || 0} reads</span>
                <span className="flex items-center gap-1"><MessageCircle size={11} /> {a.commentCount || 0} comments</span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                {a.status === 'published' && (
                  <a href={`/news/${a.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700">
                    <Globe size={11} /> View live
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openComments(a)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                <MessageCircle size={13} /> {a.commentCount || 0}
              </button>
              <button onClick={() => openEdit(a)} className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition">
                <Pencil size={15} />
              </button>
              <button onClick={() => deleteArticle(a.id, a.title)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No articles yet. Click &quot;New Article&quot; to write your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
