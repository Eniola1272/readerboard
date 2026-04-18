'use client';

import { useState, useMemo } from "react";

const CATEGORIES = [
  {
    id: "public-speaking",
    emoji: "🎤",
    situation: "Preparing for a Speech",
    books: [
      { title: "Talk Like TED", author: "Carmine Gallo", why: "Breaks down what makes TED talks captivating and gives you a repeatable framework." },
      { title: "The Art of Public Speaking", author: "Dale Carnegie", why: "The classic. Timeless principles on connecting with any audience." },
      { title: "Steal the Show", author: "Michael Port", why: "Treats every speaking moment like a performance — with rehearsal techniques that actually work." },
    ],
  },
  {
    id: "making-friends",
    emoji: "🤝",
    situation: "Learning to Make Friends",
    books: [
      { title: "How to Win Friends and Influence People", author: "Dale Carnegie", why: "The gold standard. Simple rules that change how people respond to you." },
      { title: "The Like Switch", author: "Jack Schafer", why: "Written by a former FBI agent — teaches you the signals that make people trust you fast." },
      { title: "Platonic", author: "Marisa G. Franco", why: "A modern, research-backed guide to building adult friendships from scratch." },
    ],
  },
  {
    id: "sales",
    emoji: "💰",
    situation: "Learning to Make Sales",
    books: [
      { title: "SPIN Selling", author: "Neil Rackham", why: "Data-driven approach to consultative selling. Especially powerful for big deals." },
      { title: "The Challenger Sale", author: "Matthew Dixon & Brent Adamson", why: "Flips the script — the best salespeople teach and push back, not just build rapport." },
      { title: "Never Split the Difference", author: "Chris Voss", why: "FBI hostage negotiator tactics applied to deals. You'll use these daily." },
    ],
  },
  {
    id: "workforce",
    emoji: "💼",
    situation: "Entering the Workforce",
    books: [
      { title: "The First 90 Days", author: "Michael D. Watkins", why: "A playbook for the critical early period in any new role." },
      { title: "So Good They Can't Ignore You", author: "Cal Newport", why: "Forget 'follow your passion' — build rare skills and leverage follows." },
      { title: "The Defining Decade", author: "Meg Jay", why: "Why your twenties matter more than you think, and how to use them wisely." },
    ],
  },
  {
    id: "leadership",
    emoji: "🏆",
    situation: "Preparing for Leadership",
    books: [
      { title: "Leaders Eat Last", author: "Simon Sinek", why: "Why great leaders create safety and trust — backed by biology and real stories." },
      { title: "The 21 Irrefutable Laws of Leadership", author: "John C. Maxwell", why: "A comprehensive map of what leadership actually requires." },
      { title: "Dare to Lead", author: "Brené Brown", why: "Vulnerability as a leadership superpower. Counterintuitive but deeply effective." },
    ],
  },
  {
    id: "money",
    emoji: "🏦",
    situation: "Getting Your Finances Together",
    books: [
      { title: "The Psychology of Money", author: "Morgan Housel", why: "Short, brilliant chapters on how emotions drive financial decisions." },
      { title: "I Will Teach You to Be Rich", author: "Ramit Sethi", why: "Step-by-step system for automating your finances. No shame, no jargon." },
      { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", why: "Shifts your mindset from earning money to building assets." },
    ],
  },
  {
    id: "confidence",
    emoji: "🔥",
    situation: "Building Self-Confidence",
    books: [
      { title: "The Confidence Gap", author: "Russ Harris", why: "ACT-based approach: stop waiting to feel confident and act your way into it." },
      { title: "The Six Pillars of Self-Esteem", author: "Nathaniel Branden", why: "Deep, foundational work on where real self-esteem comes from." },
      { title: "You Are a Badass", author: "Jen Sincero", why: "Energetic, funny, no-nonsense push to stop doubting yourself." },
    ],
  },
  {
    id: "career-change",
    emoji: "🧭",
    situation: "Changing Careers",
    books: [
      { title: "Designing Your Life", author: "Bill Burnett & Dave Evans", why: "Stanford design thinking applied to your career — prototype before you leap." },
      { title: "Working Identity", author: "Herminia Ibarra", why: "You don't discover a new career by thinking — you discover it by experimenting." },
      { title: "Range", author: "David Epstein", why: "Proof that generalists thrive. Your diverse background is a feature, not a bug." },
    ],
  },
  {
    id: "negotiation",
    emoji: "⚖️",
    situation: "Negotiating Better Deals",
    books: [
      { title: "Getting to Yes", author: "Roger Fisher & William Ury", why: "The foundational text on principled negotiation — separate people from problems." },
      { title: "Never Split the Difference", author: "Chris Voss", why: "Tactical empathy from an FBI negotiator. Game-changing for salary talks." },
      { title: "Bargaining for Advantage", author: "G. Richard Shell", why: "Helps you find your own negotiation style instead of forcing one on you." },
    ],
  },
  {
    id: "starting-business",
    emoji: "🚀",
    situation: "Starting a Business",
    books: [
      { title: "The Lean Startup", author: "Eric Ries", why: "Build, measure, learn. Stop wasting time on plans nobody will read." },
      { title: "The $100 Startup", author: "Chris Guillebeau", why: "Real stories of people who built businesses with almost nothing." },
      { title: "Zero to One", author: "Peter Thiel", why: "Contrarian thinking on building something truly new, not just iterating." },
    ],
  },
  {
    id: "productivity",
    emoji: "⚡",
    situation: "Becoming More Productive",
    books: [
      { title: "Deep Work", author: "Cal Newport", why: "The ability to focus without distraction is the new superpower. This book shows how." },
      { title: "Atomic Habits", author: "James Clear", why: "Tiny changes, remarkable results. The definitive system for building habits." },
      { title: "Getting Things Done", author: "David Allen", why: "Capture everything, organize it, and trust your system. Clears mental clutter." },
    ],
  },
  {
    id: "relationships",
    emoji: "❤️",
    situation: "Improving Your Relationship",
    books: [
      { title: "The Seven Principles for Making Marriage Work", author: "John Gottman", why: "Decades of research distilled into what actually predicts relationship success." },
      { title: "Attached", author: "Amir Levine & Rachel Heller", why: "Understand your attachment style and stop repeating the same patterns." },
      { title: "Hold Me Tight", author: "Sue Johnson", why: "Emotionally focused therapy for couples — learn to reach for each other." },
    ],
  },
  {
    id: "difficult-conversations",
    emoji: "💬",
    situation: "Having Difficult Conversations",
    books: [
      { title: "Difficult Conversations", author: "Douglas Stone, Bruce Patton & Sheila Heen", why: "From the Harvard Negotiation Project — a framework for the talks you've been avoiding." },
      { title: "Crucial Conversations", author: "Patterson, Grenny, McMillan & Switzler", why: "When stakes are high and emotions run hot, this keeps you effective." },
      { title: "Nonviolent Communication", author: "Marshall B. Rosenberg", why: "Express needs without blame. A different language for conflict." },
    ],
  },
  {
    id: "writing",
    emoji: "✍️",
    situation: "Becoming a Better Writer",
    books: [
      { title: "On Writing Well", author: "William Zinsser", why: "The bible of clear, simple nonfiction writing. Every sentence earns its place." },
      { title: "Bird by Bird", author: "Anne Lamott", why: "Honest, funny guide to the writing life — including the ugly first drafts." },
      { title: "Everybody Writes", author: "Ann Handley", why: "Practical writing rules for the internet age. Emails, posts, pages — all of it." },
    ],
  },
  {
    id: "parenting",
    emoji: "👶",
    situation: "Becoming a Parent",
    books: [
      { title: "The Whole-Brain Child", author: "Daniel J. Siegel & Tina Payne Bryson", why: "Neuroscience-based strategies for nurturing your child's developing mind." },
      { title: "How to Talk So Kids Will Listen", author: "Adele Faber & Elaine Mazlish", why: "Communication techniques that actually work with children. Tested by millions." },
      { title: "Hunt, Gather, Parent", author: "Michaeleen Doucleff", why: "What ancient parenting cultures teach us about raising calm, helpful kids." },
    ],
  },
  {
    id: "grief",
    emoji: "🕊️",
    situation: "Dealing with Loss or Grief",
    books: [
      { title: "It's OK That You're Not OK", author: "Megan Devine", why: "Rejects toxic positivity. Grief isn't a problem to solve — it's a process to honor." },
      { title: "Option B", author: "Sheryl Sandberg & Adam Grant", why: "Finding resilience after devastating loss. Raw, real, and research-backed." },
      { title: "When Breath Becomes Air", author: "Paul Kalanithi", why: "A dying neurosurgeon's meditation on meaning. Will change how you see time." },
    ],
  },
  {
    id: "creativity",
    emoji: "🎨",
    situation: "Unlocking Your Creativity",
    books: [
      { title: "The War of Art", author: "Steven Pressfield", why: "Names the enemy — Resistance — and shows you how to beat it daily." },
      { title: "Big Magic", author: "Elizabeth Gilbert", why: "Permission to create without suffering. Joyful, liberating, practical." },
      { title: "Steal Like an Artist", author: "Austin Kleon", why: "Short, visual, punchy. Nothing is original — and that's freeing." },
    ],
  },
  {
    id: "health",
    emoji: "🏃",
    situation: "Getting Healthier",
    books: [
      { title: "Outlive", author: "Peter Attia", why: "Longevity science made actionable. Exercise, nutrition, sleep, emotional health." },
      { title: "Why We Sleep", author: "Matthew Walker", why: "After reading this, you will never skip sleep again. Alarming and essential." },
      { title: "Atomic Habits", author: "James Clear", why: "Health is a system, not a goal. Build the identity of a healthy person." },
    ],
  },
  {
    id: "managing-people",
    emoji: "👥",
    situation: "Managing a Team",
    books: [
      { title: "The Making of a Manager", author: "Julie Zhuo", why: "Honest, practical guide from someone who became a manager at 25 at Facebook." },
      { title: "Radical Candor", author: "Kim Scott", why: "Care personally, challenge directly. The two-axis framework for giving feedback." },
      { title: "High Output Management", author: "Andy Grove", why: "Intel's legendary CEO on leverage, meetings, and performance. Dense and brilliant." },
    ],
  },
  {
    id: "anxiety",
    emoji: "🧘",
    situation: "Managing Stress & Anxiety",
    books: [
      { title: "The Body Keeps the Score", author: "Bessel van der Kolk", why: "How trauma lives in the body and what actually helps release it." },
      { title: "Unwinding Anxiety", author: "Judson Brewer", why: "A neuroscientist's habit-loop approach to breaking the anxiety cycle." },
      { title: "Feeling Good", author: "David D. Burns", why: "The cognitive behavioral therapy classic. Challenge distorted thoughts on paper." },
    ],
  },
  {
    id: "thinking",
    emoji: "🧠",
    situation: "Thinking More Clearly",
    books: [
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", why: "The two systems in your brain — and all the ways they trick you." },
      { title: "The Art of Thinking Clearly", author: "Rolf Dobelli", why: "99 cognitive biases in short, punchy chapters. A field guide to your blind spots." },
      { title: "Super Thinking", author: "Gabriel Weinberg & Lauren McCann", why: "Mental models from every discipline, organized for practical use." },
    ],
  },
  {
    id: "investing",
    emoji: "📈",
    situation: "Learning to Invest",
    books: [
      { title: "The Little Book of Common Sense Investing", author: "John C. Bogle", why: "Vanguard's founder makes the case for index funds. Simple, proven, powerful." },
      { title: "A Random Walk Down Wall Street", author: "Burton Malkiel", why: "Why trying to beat the market usually fails — and what to do instead." },
      { title: "The Intelligent Investor", author: "Benjamin Graham", why: "Warren Buffett's favorite book. The margin-of-safety concept alone is worth it." },
    ],
  },
  {
    id: "moving-abroad",
    emoji: "🌍",
    situation: "Moving to Another Country",
    books: [
      { title: "The Culture Map", author: "Erin Meyer", why: "Eight scales that explain why people from different cultures clash — and how to bridge gaps." },
      { title: "The Art of Crossing Cultures", author: "Craig Storti", why: "Practical wisdom on the emotional arc of living abroad." },
      { title: "Homelands", author: "Chitra Raghavan & James Leitzel", why: "Stories and psychology of belonging when home is more than one place." },
    ],
  },
  {
    id: "breakup",
    emoji: "💔",
    situation: "Going Through a Breakup",
    books: [
      { title: "It's Called a Breakup Because It's Broken", author: "Greg Behrendt & Amiira Ruotola", why: "Tough love, humor, and a clear-eyed look at why you need to move forward." },
      { title: "Attached", author: "Amir Levine & Rachel Heller", why: "Understanding attachment styles helps you see patterns — and break them." },
      { title: "Tiny Beautiful Things", author: "Cheryl Strayed", why: "Advice columns that feel like being held. Raw, wise, deeply human." },
    ],
  },
];

const ACCENT_COLORS = [
  "#E8453C", "#D97706", "#0284C7", "#7C3AED",
  "#059669", "#DB2777", "#4F46E5", "#B45309",
  "#0891B2", "#9333EA", "#16A34A", "#DC2626",
];

export default function BookGlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.filter(
      (c) =>
        c.situation.toLowerCase().includes(q) ||
        c.books.some(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        )
    );
  }, [search]);

  const active = activeCategory
    ? CATEGORIES.find((c) => c.id === activeCategory)
    : null;

  return (
    <div
      style={{
        fontFamily: "'Instrument Serif', 'Georgia', serif",
        minHeight: "100vh",
        background: "var(--bg, #FAF7F2)",
        color: "var(--text, #1a1a1a)",
        padding: "0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        :root {
          --bg: #FAF7F2;
          --text: #1a1a1a;
          --text-muted: #6b6560;
          --card-bg: #FFFFFF;
          --card-border: #e8e2da;
          --card-hover: #F5F0E8;
          --search-bg: #FFFFFF;
          --tag-bg: #f0ebe4;
          --overlay-bg: rgba(250, 247, 242, 0.92);
          --book-bg: #faf8f5;
          --book-border: #ede8e0;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #141210;
            --text: #e8e2da;
            --text-muted: #8a8480;
            --card-bg: #1e1c18;
            --card-border: #2e2a24;
            --card-hover: #262420;
            --search-bg: #1e1c18;
            --tag-bg: #2a2622;
            --overlay-bg: rgba(20, 18, 16, 0.94);
            --book-bg: #1a1816;
            --book-border: #2e2a24;
          }
        }

        .bg-header {
          padding: 48px 24px 32px;
          text-align: center;
          max-width: 640px;
          margin: 0 auto;
        }
        .bg-header h1 {
          font-family: 'Instrument Serif', serif;
          font-size: 42px;
          font-weight: 400;
          letter-spacing: -0.5px;
          line-height: 1.1;
          margin-bottom: 12px;
          color: var(--text);
        }
        .bg-header h1 em {
          font-style: italic;
          opacity: 0.7;
        }
        .bg-header p {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .bg-search-wrap {
          max-width: 480px;
          margin: 0 auto 40px;
          padding: 0 24px;
        }
        .bg-search-wrap input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 40px;
          border: 1.5px solid var(--card-border);
          background: var(--search-bg);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--text);
          outline: none;
          transition: border-color 0.2s;
        }
        .bg-search-wrap input::placeholder { color: var(--text-muted); }
        .bg-search-wrap input:focus { border-color: #b0a898; }

        .bg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
          padding: 0 24px 60px;
          max-width: 960px;
          margin: 0 auto;
        }

        .bg-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 14px;
          padding: 22px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .bg-card:hover {
          background: var(--card-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .bg-card-emoji {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
        }
        .bg-card-situation {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          line-height: 1.25;
          margin-bottom: 8px;
          color: var(--text);
        }
        .bg-card-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .bg-card-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        .bg-overlay {
          position: fixed;
          inset: 0;
          background: var(--overlay-bg);
          backdrop-filter: blur(12px);
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px;
          overflow-y: auto;
          animation: bgFadeIn 0.2s ease;
        }
        @keyframes bgFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .bg-detail-panel {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          max-width: 580px;
          width: 100%;
          padding: 36px 32px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.08);
          animation: bgSlideUp 0.25s ease;
        }
        @keyframes bgSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .bg-detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .bg-detail-emoji { font-size: 36px; margin-bottom: 8px; }
        .bg-detail-situation {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          line-height: 1.2;
          color: var(--text);
        }
        .bg-close-btn {
          background: var(--tag-bg);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
          margin-left: 16px;
          transition: background 0.15s;
        }
        .bg-close-btn:hover { background: var(--card-border); }

        .bg-book-card {
          background: var(--book-bg);
          border: 1px solid var(--book-border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 12px;
        }
        .bg-book-number {
          font-family: 'Instrument Serif', serif;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 6px;
          display: block;
        }
        .bg-book-title {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          color: var(--text);
          margin-bottom: 2px;
        }
        .bg-book-author {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .bg-book-why {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.55;
          color: var(--text);
          opacity: 0.85;
        }

        .bg-empty {
          text-align: center;
          padding: 60px 24px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-muted);
        }
        .bg-empty-emoji { font-size: 40px; margin-bottom: 12px; }
        .bg-empty p { font-size: 15px; }
      `}</style>

      <div className="bg-header">
        <h1>
          What Book Should <em>You</em> Read?
        </h1>
        <p>
          A glossary of books organized by life situations. Find what you&apos;re
          going through, and we&apos;ll tell you what to read.
        </p>
      </div>

      <div className="bg-search-wrap">
        <input
          type="text"
          placeholder="Search a situation, book, or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-empty">
          <div className="bg-empty-emoji">📚</div>
          <p>No matching situations found. Try different keywords.</p>
        </div>
      ) : (
        <div className="bg-grid">
          {filtered.map((cat, i) => (
            <div
              key={cat.id}
              className="bg-card"
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="bg-card-emoji">{cat.emoji}</span>
              <div className="bg-card-situation">{cat.situation}</div>
              <div className="bg-card-count">
                {cat.books.length} book{cat.books.length !== 1 ? "s" : ""}
              </div>
              <div
                className="bg-card-accent"
                style={{
                  background: ACCENT_COLORS[i % ACCENT_COLORS.length],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="bg-overlay" onClick={() => setActiveCategory(null)}>
          <div className="bg-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="bg-detail-header">
              <div>
                <div className="bg-detail-emoji">{active.emoji}</div>
                <div className="bg-detail-situation">{active.situation}</div>
              </div>
              <button
                className="bg-close-btn"
                onClick={() => setActiveCategory(null)}
              >
                ✕
              </button>
            </div>
            {active.books.map((book, bi) => (
              <div className="bg-book-card" key={bi}>
                <span className="bg-book-number">Book {bi + 1}</span>
                <div className="bg-book-title">{book.title}</div>
                <div className="bg-book-author">by {book.author}</div>
                <div className="bg-book-why">{book.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
