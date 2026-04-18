// app/page.tsx
import Link from "next/link";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-600 text-sm font-medium px-4 py-1.5 rounded-pill mb-8">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            Now in Beta — Join the Reading Revolution
          </div>

          <h1 className="text-5xl md:text-7xl font-normal text-brand-950 mb-6 leading-tight" style={{ fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.5px' }}>
            Turn Reading Into a
            <br />
            <span className="gradient-text italic">Competition</span>
          </h1>
          <p className="text-xl text-brand-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your reading progress, compete with friends, and climb the
            leaderboard. Every page counts. Every book matters.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-brand-600 text-white text-lg rounded-pill hover:bg-brand-700 font-medium shadow-glow transition-all hover:scale-105"
            >
              Start Reading Free
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-4 bg-brand-100 text-brand-700 text-lg rounded-pill hover:bg-brand-200 font-medium transition-all"
            >
              View Leaderboard →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            { value: "10K+", label: "Pages Read Today", accent: "text-brand-600" },
            { value: "500+", label: "Active Readers", accent: "text-amber-500" },
            { value: "1,200+", label: "Books Uploaded", accent: "text-brand-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-8 bg-white rounded-card shadow-soft hover:shadow-glow transition-all border border-brand-200"
            >
              <div className={`text-4xl font-bold ${stat.accent} mb-2`} style={{ fontFamily: 'Instrument Serif, serif' }}>
                {stat.value}
              </div>
              <div className="text-brand-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl text-brand-950 mb-3">How It Works</h2>
            <p className="text-brand-500 text-lg">Three simple steps to reading greatness</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                ),
                title: "Upload Your Books",
                body: "Upload PDFs from your library and build your digital bookshelf.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                ),
                title: "Read & Track",
                body: "Every page you read is automatically tracked. See your progress in real-time.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ),
                title: "Compete & Win",
                body: "Climb the leaderboard, challenge friends, and become the top reader.",
              },
            ].map((card) => (
              <div key={card.title} className="glass-card rounded-card p-8 text-center hover:shadow-glow transition-all duration-300">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
                <h3 className="text-xl text-brand-950 mb-2">{card.title}</h3>
                <p className="text-brand-500">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Finder Promo */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-card-lg overflow-hidden"
            style={{ background: "#FAF7F2", border: "1px solid #e8e2da" }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: copy */}
              <div className="p-12 flex flex-col justify-center">
                <span
                  className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 text-brand-600"
                >
                  New Feature
                </span>
                <h2
                  className="mb-4 leading-tight text-brand-950"
                  style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
                >
                  Not sure what to read <em className="opacity-60">next?</em>
                </h2>
                <p className="mb-8 leading-relaxed text-brand-500 max-w-sm">
                  Browse our curated Book Finder — 24 life situations, 72 hand-picked
                  reads. Whether you&apos;re starting a business, dealing with a
                  breakup, or just want to think more clearly, we&apos;ve got the
                  book for you.
                </p>
                <Link
                  href="/book-glossary"
                  className="inline-flex items-center gap-2 self-start px-7 py-3 rounded-full font-medium text-sm transition-all hover:scale-105 bg-brand-950 text-white"
                >
                  Find Your Next Book →
                </Link>
              </div>

              {/* Right: preview cards */}
              <div className="p-10 flex flex-col justify-center gap-3 bg-surface-elevated">
                {[
                  { emoji: "🚀", label: "Starting a Business", color: "#D97706" },
                  { emoji: "🧠", label: "Thinking More Clearly", color: "#7C3AED" },
                  { emoji: "❤️", label: "Improving Your Relationship", color: "#DB2777" },
                  { emoji: "💰", label: "Learning to Make Sales", color: "#059669" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-brand-200"
                    style={{ borderLeft: `3px solid ${item.color}`, fontFamily: 'Instrument Serif, serif', fontSize: '17px' }}
                  >
                    <span style={{ fontSize: "20px" }}>{item.emoji}</span>
                    <span className="text-brand-950">{item.label}</span>
                  </div>
                ))}
                <p className="text-xs text-brand-400 mt-1 text-center">
                  + 20 more situations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-card-lg p-16 text-center shadow-glow">
            <h2 className="text-4xl text-white mb-4">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-brand-200 mb-8 text-lg max-w-xl mx-auto">
              Join thousands of readers tracking their progress and competing for
              the top spot.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-10 py-4 bg-amber-400 text-brand-950 text-lg rounded-pill hover:bg-amber-300 font-bold transition-all hover:scale-105 shadow-gold-glow"
            >
              Join Readerboard Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-serif text-brand-950">Readerboard</span>
              </div>
              <p className="text-brand-500 text-sm">Making reading competitive and fun.</p>
            </div>

            <div>
              <h4 className="font-semibold text-brand-950 mb-4 font-sans">Product</h4>
              <ul className="space-y-2 text-sm text-brand-500">
                <li><Link href="/leaderboard" className="hover:text-brand-600 transition-colors">Leaderboard</Link></li>
                <li><Link href="/library" className="hover:text-brand-600 transition-colors">My Library</Link></li>
                <li><Link href="/book-glossary" className="hover:text-brand-600 transition-colors">Book Finder</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-950 mb-4 font-sans">Company</h4>
              <ul className="space-y-2 text-sm text-brand-500">
                <li><Link href="/about" className="hover:text-brand-600 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-brand-600 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-950 mb-4 font-sans">Legal</h4>
              <ul className="space-y-2 text-sm text-brand-500">
                <li><Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-600 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-200 pt-8 text-center text-sm text-brand-400">
            © 2025 Readerboard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
