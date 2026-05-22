'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Clock, Eye, Send, Trash2, Loader2,
  Twitter, Facebook, Link2, MessageCircle, CheckCircle, BookOpen
} from 'lucide-react';
import NewsNav from '../_components/NewsNav';

/* ── helpers ──────────────────────────────────────────────────────────────── */

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function readingTime(content) {
  const words = (content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

function RelativeTime({ date }) {
  const [label, setLabel] = useState(() => formatDate(date));
  useEffect(() => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor(diff / 3600000);
    const mins = Math.floor(diff / 60000);
    if (days > 30) setLabel(formatDate(date));
    else if (days > 0) setLabel(`${days}d ago`);
    else if (hrs  > 0) setLabel(`${hrs}h ago`);
    else if (mins > 0) setLabel(`${mins}m ago`);
    else setLabel('Just now');
  }, [date]);
  return <span suppressHydrationWarning>{label}</span>;
}

/* ── ad slot ──────────────────────────────────────────────────────────────── */
function AdSlot({ ad }) {
  if (!ad) return null;
  const inner = (
    <div className="my-10 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
      <div className="px-3 pt-2.5 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sponsored</span>
      </div>
      {ad.imageUrl
        ? <img src={ad.imageUrl} alt={ad.description || ad.title} className="w-full object-cover max-h-28 rounded-b-2xl" />
        : <p className="px-4 pb-3 text-sm text-gray-500">{ad.title}</p>
      }
    </div>
  );
  return ad.linkUrl
    ? <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored">{inner}</a>
    : inner;
}

/* ── share buttons ─────────────────────────────────────────────────────────── */
function ShareButtons({ title, slug, compact = false }) {
  const [copied, setCopied] = useState(false);
  const url  = typeof window !== 'undefined' ? window.location.href : '';
  const enc  = encodeURIComponent(url);
  const tEnc = encodeURIComponent(title);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (compact) return (
    <div className="flex items-center gap-2">
      <a href={`https://twitter.com/intent/tweet?url=${enc}&text=${tEnc}`} target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white transition text-gray-600" title="Share on X">
        <Twitter size={15} />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white transition text-gray-600" title="Share on Facebook">
        <Facebook size={15} />
      </a>
      <a href={`https://wa.me/?text=${tEnc}%20${enc}`} target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-green-500 hover:text-white transition text-gray-600" title="Share on WhatsApp">
        <MessageCircle size={15} />
      </a>
      <button onClick={copy}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-700 hover:text-white transition text-gray-600" title="Copy link">
        {copied ? <CheckCircle size={15} className="text-green-500" /> : <Link2 size={15} />}
      </button>
    </div>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">Share</span>
      <a href={`https://twitter.com/intent/tweet?url=${enc}&text=${tEnc}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition">
        <Twitter size={12} /> Twitter / X
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
        <Facebook size={12} /> Facebook
      </a>
      <a href={`https://wa.me/?text=${tEnc}%20${enc}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition">
        <MessageCircle size={12} /> WhatsApp
      </a>
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition">
        {copied ? <><CheckCircle size={12} className="text-green-500" /> Copied!</> : <><Link2 size={12} /> Copy link</>}
      </button>
    </div>
  );
}

/* ── inject ads into content ───────────────────────────────────────────────── */
function injectAds(html, ads) {
  // Split at </p> boundaries, inject ad after ~33% and ~66%
  const parts = html.split(/(?<=<\/p>)/);
  if (parts.length < 4 || !ads.length) return [{ type: 'html', content: html }];

  const third  = Math.floor(parts.length / 3);
  const twothird = Math.floor((parts.length * 2) / 3);

  const result = [];
  parts.forEach((part, i) => {
    result.push({ type: 'html', content: part });
    if (i + 1 === third  && ads[0]) result.push({ type: 'ad', ad: ads[0] });
    if (i + 1 === twothird && ads[1]) result.push({ type: 'ad', ad: ads[1] });
  });
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ArticlePage() {
  const { slug } = useParams();
  const { data: session, status } = useSession();
  const [article, setArticle]     = useState(null);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [slotAds, setSlotAds]     = useState([]);
  const [progress, setProgress]   = useState(0);
  const contentRef = useRef(null);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((-top) / (height - window.innerHeight)) * 100));
      setProgress(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [article]);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(r => r.json())
      .then(d => {
        setArticle(d.article);
        setLoading(false);
        if (d.article?.id) {
          fetch(`/api/ads?articleId=${d.article.id}`)
            .then(r => r.json())
            .then(ad => setSlotAds(ad.ads || []));
        }
      });
    fetch(`/api/articles/${slug}/comments`)
      .then(r => r.json())
      .then(d => setComments(d.comments || []));
  }, [slug]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/articles/${slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: commentText }),
    });
    if (res.ok) {
      const d = await res.json();
      setComments(prev => [...prev, { ...d.comment, authorName: session?.user?.name }]);
      setCommentText('');
    }
    setSubmitting(false);
  };

  const deleteComment = async (id) => {
    await fetch(`/api/articles/${slug}/comments/${id}`, { method: 'DELETE' });
    setComments(prev => prev.filter(c => c.id !== id));
  };

  /* ── loading / not found ─────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-gray-300" />
    </div>
  );
  if (!article) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <BookOpen size={48} className="text-gray-200" />
      <p className="text-gray-400 font-medium">Article not found.</p>
      <Link href="/news" className="text-[#FF7A00] hover:underline text-sm">← Back to News</Link>
    </div>
  );

  /* ── content sections with injected ads ─────────────────────────────── */
  const rawHtml   = article.content.replace(/\n(?!\n)/g, ' ').replace(/\n\n/g, '</p><p>');
  const fullHtml  = rawHtml.startsWith('<') ? article.content : `<p>${rawHtml}</p>`;
  const sections  = injectAds(fullHtml, slotAds);

  return (
    <div className="min-h-screen bg-white">

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-50 h-0.5 bg-[#FF7A00] transition-all duration-100"
        style={{ width: `${progress}%` }} />

      {/* Navbar */}
      <NewsNav showBack />

      {/* ── Hero cover ──────────────────────────────────────────────────── */}
      {article.coverPublicUrl ? (
        <div className="relative w-full bg-gray-900" style={{ maxHeight: '70vh', overflow: 'hidden' }}>
          <img
            src={article.coverPublicUrl}
            alt={article.title}
            className="w-full object-cover"
            style={{ maxHeight: '70vh', opacity: 0.85 }}
          />
          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          {/* Title overlaid on cover */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3 drop-shadow-lg">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-white/80 text-lg leading-relaxed max-w-2xl hidden md:block">
                  {article.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* No cover — show title in a clean block */
        <div className="bg-[#1A0A00] px-6 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-white/60 text-lg mt-4 leading-relaxed max-w-2xl">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Article meta bar ────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {article.authorName && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF7A00] text-white text-xs font-black flex items-center justify-center shrink-0">
                  {article.authorName[0].toUpperCase()}
                </div>
                <span className="font-semibold text-gray-700">{article.authorName}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-gray-400" />
              <RelativeTime date={article.createdAt} />
            </span>
            <span className="text-gray-400 hidden sm:block">{readingTime(article.content)}</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Eye size={13} /> {(article.readCount || 1).toLocaleString()}
            </span>
          </div>
          <ShareButtons title={article.title} slug={article.slug} compact />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-6 md:px-8 py-10">

        {/* Excerpt below cover on mobile */}
        {article.excerpt && article.coverPublicUrl && (
          <p className="text-xl text-gray-500 leading-relaxed mb-8 md:hidden font-serif italic">
            {article.excerpt}
          </p>
        )}

        {/* Article body with inline ads */}
        {sections.map((section, i) =>
          section.type === 'ad'
            ? <AdSlot key={`ad-${i}`} ad={section.ad} />
            : (
              <div
                key={`content-${i}`}
                className="article-body"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )
        )}

        {/* Bottom ad slot (slot 3) */}
        <AdSlot ad={slotAds[2]} />

        {/* ── Bottom share ─────────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Did you enjoy this article?
          </p>
          <ShareButtons title={article.title} slug={article.slug} />
        </div>

        {/* ── Author card ──────────────────────────────────────────────── */}
        {article.authorName && (
          <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#FF7A00] text-white text-xl font-black flex items-center justify-center shrink-0">
              {article.authorName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Written by</p>
              <p className="font-bold text-gray-900 text-lg">{article.authorName}</p>
              <p className="text-sm text-gray-500 mt-0.5">WriteMaster contributor</p>
            </div>
          </div>
        )}

        {/* ── Comments ─────────────────────────────────────────────────── */}
        <section className="mt-14" id="comments">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-gray-900">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Comment form */}
          {status === 'loading' ? null : session ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FF7A00] text-white text-xs font-black flex items-center justify-center shrink-0">
                  {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  Commenting as <span className="text-[#FF7A00]">{session.user?.name || session.user?.email}</span>
                </p>
              </div>
              <textarea
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this article..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none transition"
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim() || submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post Comment
              </button>
            </div>
          ) : (
            <div className="bg-[#1A0A00] text-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-base">Join the conversation</p>
                <p className="text-white/60 text-sm mt-0.5">Sign in to leave a comment on this article.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href={`/login?redirect=/news/${slug}`}
                  className="px-4 py-2.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-bold rounded-xl transition">
                  Sign In
                </Link>
                <Link href="/signup"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl border border-white/20 transition">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Comment list */}
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7A00] font-bold text-sm shrink-0 mt-0.5">
                  {(c.authorName || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{c.authorName || 'Writer'}</span>
                    <span className="text-xs text-gray-400"><RelativeTime date={c.createdAt} /></span>
                    {session?.user?.role === 'admin' && (
                      <button onClick={() => deleteComment(c.id)} className="ml-auto text-red-300 hover:text-red-500 transition">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8 border border-dashed border-gray-200 rounded-2xl">
                No comments yet — be the first to share your thoughts!
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A0A00] text-white mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" className="text-[#FF7A00] font-extrabold">WriteMaster</Link>
          <div className="flex items-center gap-5 text-sm text-white/50">
            <Link href="/news" className="hover:text-white transition">← All Articles</Link>
            <Link href="/" className="hover:text-white transition">Home</Link>
          </div>
          <p className="text-white/25 text-xs w-full text-center">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> WriteMaster
          </p>
        </div>
      </footer>
    </div>
  );
}
