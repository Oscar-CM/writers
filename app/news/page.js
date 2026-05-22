import Link from 'next/link';
import { BookOpen, Clock, Eye, ArrowRight, PenLine, Rss } from 'lucide-react';
import NewsNav from './_components/NewsNav';

async function getArticles() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/articles`, { next: { revalidate: 60 } });
    const d = await res.json();
    return d.articles || [];
  } catch { return []; }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function readingTime(content) {
  if (!content) return '1 min';
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function isNew(d) {
  return Date.now() - new Date(d) < 3 * 86400000; // < 3 days
}

const TOPICS = ['Academic Writing', 'AI & Writing', 'Freelancing', 'Copywriting', 'Content Creation', 'SEO Writing', 'Creative Writing', 'Research Skills', 'Writing Tools', 'Career Growth'];

export const metadata = {
  title: 'The Writing World | WriteMaster',
  description: 'Stories, insights and craft from the frontlines of writing. Stay sharp. Think deeply. Write better.',
};

export default async function NewsPage() {
  const articles = await getArticles();
  const [featured, second, third, ...rest] = articles;

  return (
    <div className="min-h-screen bg-[#F8F6F1]">

      {/* ── HEADER (session-aware client component) ─────────────────────── */}
      <NewsNav />

      {/* ── HERO MASTHEAD ──────────────────────────────────────────────────── */}
      <div className="bg-[#1A0A00] text-white overflow-hidden">
        {/* Ruled lines background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,122,0,0.06) 39px, rgba(255,122,0,0.06) 40px)',
        }} />

        <div className="max-w-7xl mx-auto px-5 py-14 md:py-20 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[#FF7A00] text-xs font-bold uppercase tracking-[0.25em] mb-4">
              <Rss size={13} />
              <span>Writing · AI · Craft · Career</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
              The Writing<br />
              <span className="text-[#FF7A00]">World.</span>
            </h1>
            <p className="mt-5 text-white/60 text-lg md:text-xl leading-relaxed max-w-xl">
              Stories, insights and craft from the frontlines of writing.
              Stay sharp. Think deeply. Write better.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <Link href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF7A00] hover:bg-[#e56d00] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-900/40">
                Start Writing <ArrowRight size={15} />
              </Link>
              <span className="text-white/30 text-sm">{articles.length} article{articles.length !== 1 ? 's' : ''} published</span>
            </div>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="h-1 bg-linear-to-r from-[#FF7A00] via-amber-400 to-[#FF7A00]" />
      </div>

      {/* ── TOPICS TICKER ──────────────────────────────────────────────────── */}
      <div className="bg-[#FF7A00] text-white py-2.5 overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {[...TOPICS, ...TOPICS].map((t, i) => (
            <span key={i} className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-white/50 rounded-full inline-block" />
              {t}
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-12 space-y-16">

        {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
        {articles.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <BookOpen size={36} className="text-[#FF7A00]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming soon</h2>
            <p className="text-gray-500">Our first articles are on their way. Check back shortly.</p>
          </div>
        )}

        {/* ── FEATURED ─────────────────────────────────────────────────────── */}
        {featured && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#FF7A00]">Featured</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Link href={`/news/${featured.slug}`}>
              <article className="group grid md:grid-cols-5 gap-0 rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                {/* Image — 3/5 */}
                <div className="md:col-span-3 aspect-video md:aspect-auto overflow-hidden bg-gray-100 relative">
                  {featured.coverPublicUrl ? (
                    <img src={featured.coverPublicUrl} alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full min-h-64 bg-linear-to-br from-[#1A0A00] to-orange-900 flex items-center justify-center">
                      <PenLine size={64} className="text-[#FF7A00]/30" />
                    </div>
                  )}
                  {isNew(featured.createdAt) && (
                    <span className="absolute top-4 left-4 bg-[#FF7A00] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      New
                    </span>
                  )}
                </div>

                {/* Content — 2/5 */}
                <div className="md:col-span-2 p-7 md:p-10 flex flex-col justify-between bg-white">
                  <div className="space-y-4">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[#FF7A00] border border-[#FF7A00]/30 px-2.5 py-1 rounded">
                      Latest Story
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight group-hover:text-[#FF7A00] transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-gray-500 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    )}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {featured.authorName && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#FF7A00] text-white text-[10px] font-black flex items-center justify-center">
                            {featured.authorName[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-600">{featured.authorName}</span>
                        </div>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(featured.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye size={11} /> {(featured.readCount || 0).toLocaleString()} reads</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-[#FF7A00] group-hover:gap-3 transition-all">
                        Read Story <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {/* ── TWO-COLUMN HIGHLIGHT ─────────────────────────────────────────── */}
        {(second || third) && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">More to Read</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[second, third].filter(Boolean).map(article => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <article className="group h-full flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="aspect-[16/7] overflow-hidden bg-gray-100 relative">
                      {article.coverPublicUrl ? (
                        <img src={article.coverPublicUrl} alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                          <PenLine size={36} className="text-orange-200" />
                        </div>
                      )}
                      {isNew(article.createdAt) && (
                        <span className="absolute top-3 left-3 bg-[#FF7A00] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-gray-900 leading-snug group-hover:text-[#FF7A00] transition-colors line-clamp-2 flex-1">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          {article.authorName && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-orange-100 text-[#FF7A00] text-[9px] font-black flex items-center justify-center">
                                {article.authorName[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-500">{article.authorName}</span>
                            </div>
                          )}
                          <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(article.createdAt)}</span>
                        </div>
                        <span className="flex items-center gap-1"><Eye size={10} /> {(article.readCount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── NEWSLETTER BANNER ────────────────────────────────────────────── */}
        {articles.length > 0 && (
          <section className="relative rounded-2xl overflow-hidden bg-[#1A0A00] text-white px-8 py-12 md:px-14 md:py-16">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FF7A00 0, #FF7A00 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10 max-w-2xl">
              <span className="text-[#FF7A00] text-xs font-black uppercase tracking-[0.2em]">WriteMaster Community</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 leading-snug">
                Ready to turn your writing into income?
              </h2>
              <p className="mt-3 text-white/60 leading-relaxed">
                Join thousands of writers who access tasks, tools, training and a supportive community — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF7A00] hover:bg-[#e56d00] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-900/40">
                  Create Free Account <ArrowRight size={15} />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition border border-white/20">
                  Sign In
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── REST OF ARTICLES ─────────────────────────────────────────────── */}
        {rest.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">All Articles</span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{rest.length} more</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map(article => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <article className="group h-full flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div className="aspect-video overflow-hidden bg-gray-100 relative">
                      {article.coverPublicUrl ? (
                        <img src={article.coverPublicUrl} alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                          <PenLine size={28} className="text-orange-200" />
                        </div>
                      )}
                      {isNew(article.createdAt) && (
                        <span className="absolute top-2.5 left-2.5 bg-[#FF7A00] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-black text-gray-900 leading-snug group-hover:text-[#FF7A00] transition-colors line-clamp-2 flex-1 text-sm">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                        <div className="flex items-center gap-2">
                          {article.authorName && (
                            <div className="w-5 h-5 rounded-full bg-orange-100 text-[#FF7A00] text-[9px] font-black flex items-center justify-center">
                              {article.authorName[0].toUpperCase()}
                            </div>
                          )}
                          <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(article.createdAt)}</span>
                        </div>
                        <span className="flex items-center gap-1"><Eye size={10} /> {(article.readCount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A0A00] text-white mt-16">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <Link href="/" className="flex items-center gap-2 text-[#FF7A00] font-extrabold text-lg justify-center md:justify-start">
                <PenLine size={18} /> WriteMaster
              </Link>
              <p className="text-white/40 text-xs mt-1">The Writing World — stories, insights & craft</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <Link href="/news" className="hover:text-white transition text-[#FF7A00]">News</Link>
              <Link href="/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition">Join</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/25">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> WriteMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
