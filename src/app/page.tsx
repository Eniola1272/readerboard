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

          <h1 className="text-5xl md:text-7xl font-extrabold text-brand-950 mb-6 leading-tight tracking-tight">
            Turn Reading Into a
            <br />
            <span className="gradient-text">Competition</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your reading progress, compete with friends, and climb the
            leaderboard. Every page counts. Every book matters.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-brand-600 text-white text-lg rounded-pill hover:bg-brand-700 font-semibold shadow-glow transition-all hover:scale-105"
            >
              Start Reading Free
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-4 bg-brand-100 text-brand-700 text-lg rounded-pill hover:bg-brand-200 font-semibold transition-all"
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
              className="text-center p-8 bg-white rounded-card shadow-soft hover:shadow-glow transition-all"
            >
              <div className={`text-4xl font-extrabold ${stat.accent} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-brand-950 mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps to reading greatness</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-card p-8 text-center hover:shadow-glow transition-all duration-300">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-950 mb-2">Upload Your Books</h3>
              <p className="text-gray-500">
                Upload PDFs from your library and build your digital bookshelf.
              </p>
            </div>

            <div className="glass-card rounded-card p-8 text-center hover:shadow-glow transition-all duration-300">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-950 mb-2">Read & Track</h3>
              <p className="text-gray-500">
                Every page you read is automatically tracked. See your progress
                in real-time.
              </p>
            </div>

            <div className="glass-card rounded-card p-8 text-center hover:shadow-glow transition-all duration-300">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-950 mb-2">Compete & Win</h3>
              <p className="text-gray-500">
                Climb the leaderboard, challenge friends, and become the top reader.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-card-lg p-16 text-center shadow-glow">
            <h2 className="text-4xl font-bold text-white mb-4">
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
      <footer className="border-t border-brand-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-bold text-brand-950">Readerboard</span>
              </div>
              <p className="text-gray-500 text-sm">Making reading competitive and fun.</p>
            </div>

            <div>
              <h4 className="font-semibold text-brand-950 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/leaderboard" className="hover:text-brand-600 transition-colors">Leaderboard</Link></li>
                <li><Link href="/library" className="hover:text-brand-600 transition-colors">My Library</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-950 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/about" className="hover:text-brand-600 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-brand-600 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-brand-950 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-600 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-brand-100 pt-8 text-center text-sm text-gray-400">
            © 2025 Readerboard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
