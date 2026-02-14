import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#1e1e22]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#a78bfa] flex items-center justify-center">
            <span className="text-white text-lg font-bold">{'\u25B8'}</span>
          </div>
          <span className="text-[#fafafa] text-xl font-semibold tracking-tight">CodeLens</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#3b82f6]/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            Powered by Opus 4.6
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#fafafa] mb-6 leading-[1.1]">
            AI-Powered Technical
            <br />
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#a78bfa] bg-clip-text text-transparent">
              Interview Platform
            </span>
          </h1>

          <p className="text-lg text-[#a1a1aa] mb-10 max-w-xl mx-auto leading-relaxed">
            Replace LeetCode-style interviews with real-world coding challenges.
            Three Opus 4.6 agents set up, observe, and analyze — giving interviewers
            real-time insights powered by custom evaluation rubrics.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/interview/setup"
              className="px-6 py-3 rounded-xl bg-[#3b82f6] text-white font-medium hover:bg-[#3b82f6]/90 transition-colors text-sm"
            >
              Start Interview Setup
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-xl bg-[#18181b] text-[#a1a1aa] border border-[#27272a] hover:border-[#3b82f6]/30 hover:text-[#fafafa] transition-all text-sm"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div id="how-it-works" className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mt-24 max-w-4xl w-full">
          {[
            {
              title: 'Interview Architect',
              desc: 'Chat with Opus 4.6 to design a custom interview. Upload JDs, provide SDK docs — it generates a tailored coding challenge.',
              color: '#3b82f6',
            },
            {
              title: 'Session Observer',
              desc: 'While the candidate codes, Opus 4.6 analyzes their approach in real-time against your custom rubric.',
              color: '#22d3ee',
            },
            {
              title: 'Interviewer Copilot',
              desc: 'Get AI-suggested follow-up questions based on what the candidate has — and hasn\'t — demonstrated.',
              color: '#f472b6',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-[#111114] border border-[#27272a] p-6 text-left hover:border-[#3b82f6]/20 transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full mb-4"
                style={{ backgroundColor: feature.color }}
              />
              <h3 className="text-[#fafafa] font-semibold mb-2">{feature.title}</h3>
              <p className="text-[#71717a] text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-[#1e1e22] text-center">
        <p className="text-xs text-[#71717a]">
          Built with Opus 4.6 for the Claude Code Hackathon
        </p>
      </footer>
    </div>
  );
}
