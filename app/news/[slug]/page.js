'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Clock, Eye, BookOpen, Send, Trash2, Loader2,
  Twitter, Facebook, Link2, MessageCircle, ArrowLeft, CheckCircle
} from 'lucide-react';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Client-only relative time — avoids server/client hydration mismatch
function RelativeTime({ date }) {
  const [label, setLabel] = useState(() => formatDate(date));
  useEffect(() => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor(diff / 60000);
    if (days > 30) setLabel(formatDate(date));
    else if (days > 0) setLabel(`${days}d ago`);
    else if (hours > 0) setLabel(`${hours}h ago`);
    else if (mins > 0) setLabel(`${mins}m ago`);
    else setLabel('Just now');
  }, [date]);
  return <span suppressHydrationWarning>{label}</span>;
}

function AdSlot({ ad }) {
  if (!ad) return null;
  const inner = (
    <div className="my-8 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-md transition">
      {ad.imageUrl && (
        <img src={ad.imageUrl} alt={ad.description || ad.title} className="w-full object-cover max-h-24" />
      )}
      {!ad.imageUrl && (
        <div className="px-4 py-3 text-sm text-gray-500 text-center">{ad.title}</div>
      )}
    </div>
  );
  return ad.linkUrl
    ? <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored">{inner}</a>
    : inner;
}

function ShareButtons({ title, slug }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : `https://masterwriters.org/news/${slug}`;
  const encoded = encodeURIComponent(url);
  const titleEnc = encodeURIComponent(title);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-500">Share:</span>
      <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${titleEnc}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition">
        <Twitter size={13} /> Twitter / X
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition">
        <Facebook size={13} /> Facebook
      </a>
      <a href={`https://wa.me/?text=${titleEnc}%20${encoded}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition">
        <MessageCircle size={13} /> WhatsApp
      </a>
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition">
        {copied ? <><CheckCircle size={13} className="text-green-500" /> Copied!</> : <><Link2 size={13} /> Copy link</>}
      </button>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { data: session } = useSession();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slotAds, setSlotAds] = useState([]); // array of 3 ad objects (or null)

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

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-gray-300" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4">
      <BookOpen size={48} className="text-gray-300" />
      <p className="text-gray-500 font-medium">Article not found.</p>
      <Link href="/news" className="text-[#FF7A00] hover:underline text-sm">← Back to News</Link>
    </div>
  );

  // Split content into sections for ad injection
  const paragraphs = article.content.split('\n\n').filter(Boolean);
  const mid = Math.floor(paragraphs.length / 2);
  const topSection = paragraphs.slice(0, 2).join('\n\n');
  const midSection = paragraphs.slice(2, mid).join('\n\n');
  const bottomSection = paragraphs.slice(mid).join('\n\n');

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#FF7A00]">WriteMaster</Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link href="/news" className="hover:text-[#FF7A00] flex items-center gap-1"><ArrowLeft size={14} /> News</Link>
            {!session && <Link href="/login" className="px-3 py-1.5 bg-[#FF7A00] text-white rounded-lg hover:bg-[#e56d00] transition text-xs font-semibold">Sign In</Link>}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* Cover image */}
        {article.coverPublicUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 aspect-video">
            <img src={article.coverPublicUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article meta */}
        <div className="space-y-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{article.title}</h1>
          {article.excerpt && <p className="text-lg text-gray-500 leading-relaxed">{article.excerpt}</p>}
          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap pt-1">
            {article.authorName && <span className="font-semibold text-gray-600">by {article.authorName}</span>}
            <span className="flex items-center gap-1"><Clock size={13} /> <RelativeTime date={article.createdAt} /></span>
            <span className="flex items-center gap-1"><Eye size={13} /> {(article.readCount || 1).toLocaleString()} reads</span>
            <span className="flex items-center gap-1"><MessageCircle size={13} /> {comments.length} comments</span>
          </div>
          <div className="pt-1">
            <ShareButtons title={article.title} slug={article.slug} />
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Ad Slot 1 — top */}
        <AdSlot ad={slotAds[0]} />

        {/* Content part 1 */}
        <div className="prose prose-lg prose-gray max-w-none" style={{ lineHeight: '1.8' }}>
          <div dangerouslySetInnerHTML={{ __html: topSection.replace(/\n/g, '<br>') }} />
        </div>

        {/* Ad Slot 2 — mid */}
        {midSection && <AdSlot ad={slotAds[1]} />}

        {/* Content part 2 */}
        {midSection && (
          <div className="prose prose-lg prose-gray max-w-none" style={{ lineHeight: '1.8' }}>
            <div dangerouslySetInnerHTML={{ __html: midSection.replace(/\n/g, '<br>') }} />
          </div>
        )}

        {/* Content part 3 */}
        {bottomSection && (
          <div className="prose prose-lg prose-gray max-w-none mt-6" style={{ lineHeight: '1.8' }}>
            <div dangerouslySetInnerHTML={{ __html: bottomSection.replace(/\n/g, '<br>') }} />
          </div>
        )}

        {/* Ad Slot 3 — bottom */}
        <AdSlot ad={slotAds[2]} />

        {/* Share (bottom) */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <ShareButtons title={article.title} slug={article.slug} />
        </div>

        {/* Comments section */}
        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle size={20} className="text-[#FF7A00]" />
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </h2>

          {/* Comment form */}
          {session ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-600">Leave a comment as <span className="text-[#FF7A00]">{session.user.name || session.user.email}</span></p>
              <textarea
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
              <button onClick={submitComment} disabled={!commentText.trim() || submitting}
                className="flex items-center gap-2 px-5 py-2 bg-[#FF7A00] hover:bg-[#e56d00] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post Comment
              </button>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center space-y-2">
              <p className="text-sm text-gray-600">Join the conversation — sign in to leave a comment.</p>
              <div className="flex justify-center gap-3">
                <Link href={`/login?redirect=/news/${slug}`}
                  className="px-4 py-2 bg-[#FF7A00] text-white text-sm font-semibold rounded-lg hover:bg-[#e56d00] transition">
                  Sign In
                </Link>
                <Link href="/signup"
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Comment list */}
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7A00] font-bold text-sm shrink-0">
                  {(c.authorName || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{c.authorName || 'Writer'}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400"><RelativeTime date={c.createdAt} /></span>
                      {session?.user?.role === 'admin' && (
                        <button onClick={() => deleteComment(c.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16 py-6 text-center text-sm text-gray-400">
        © <span suppressHydrationWarning>{new Date().getFullYear()}</span> WriteMaster · <Link href="/news" className="hover:text-[#FF7A00]">News</Link> · <Link href="/" className="hover:text-[#FF7A00]">Home</Link>
      </footer>
    </div>
  );
}
