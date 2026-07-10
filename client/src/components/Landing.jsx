import { useNavigate } from 'react-router-dom';
import {
  Dna,
  ShieldCheck,
  Zap,
  Brain,
  ArrowRight,
  Sparkles,
  Lock,
  Activity,
} from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Zero-Upload Privacy',
    desc: 'Your raw genome file is parsed entirely in your browser. No data ever leaves your device.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    desc: 'Groq-accelerated Llama 3.1 provides real-time, personalized health insights from your genetic markers.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    desc: '600,000+ lines parsed in under a second. AI analysis streams live — no waiting for batch processing.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Activity,
    title: 'Clinically Curated',
    desc: '27 high-impact SNPs covering cardiovascular, methylation, inflammation, and neurotransmitter pathways.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
];

const steps = [
  { num: '01', label: 'Export your raw data from 23andMe as a .txt file' },
  { num: '02', label: 'Drop it into our scanner — it never leaves your browser' },
  { num: '03', label: 'Get an AI-generated, personalized genetic health report' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-mist-200 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-ink-700">
            <Dna className="h-6 w-6 text-tealish-500" />
            <span className="text-lg font-bold tracking-tight">GenomeScan</span>
          </div>
          <button
            onClick={() => navigate('/analyze')}
            className="rounded-full bg-tealish-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-tealish-600 hover:shadow-lg active:scale-95"
          >
            Launch Scanner
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div className="med-grid absolute inset-0 opacity-50" />
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-tealish-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-20 pt-24 text-center md:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-tealish-500/20 bg-tealish-500/5 px-4 py-1.5 text-sm font-medium text-tealish-600">
            <Sparkles className="h-4 w-4" />
            Powered by Groq &amp; Llama 3.1
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ink-700 md:text-6xl">
            Decode your DNA with{' '}
            <span className="bg-gradient-to-r from-tealish-500 to-violet-500 bg-clip-text text-transparent">
              AI-powered
            </span>{' '}
            precision
          </h1>

          <p className="max-w-2xl text-lg text-ink-600 md:text-xl">
            Upload your 23andMe raw data and receive a comprehensive, personalized
            genetic health analysis — entirely private, blazingly fast, and backed
            by clinically curated markers.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate('/analyze')}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-tealish-500 to-tealish-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95"
            >
              Start Analysis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              No sign-up required · 100% free
            </div>
          </div>
        </div>
      </section>

      {/* Product Video Showcase */}
      <section className="border-t border-mist-200 bg-mist-50/50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-ink-700 md:text-3xl">
            See GenomeScan in Action
          </h2>
          <div className="overflow-hidden rounded-3xl border border-mist-200 bg-white p-3 shadow-soft">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <video
                src="https://res.cloudinary.com/eiss6qy0/video/upload/v1783696401/Untitled_design_bx8x5w.mp4"
                controls
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-mist-200">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-12 text-center text-2xl font-bold text-ink-700 md:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.num} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tealish-500 to-tealish-600 text-lg font-bold text-white shadow-md">
                  {s.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden h-0.5 w-full bg-gradient-to-r from-tealish-500/20 to-transparent md:block" />
                )}
                <p className="max-w-xs text-sm leading-relaxed text-ink-600">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate('/analyze')}
              className="group flex items-center gap-2 rounded-full bg-ink-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-ink-600 active:scale-95"
            >
              Try it now — it's free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-mist-200 bg-mist-50/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-ink-600">
          <div className="flex items-center gap-2">
            <Dna className="h-4 w-4 text-tealish-500" />
            <span className="font-semibold text-ink-700">GenomeScan</span>
          </div>
          <p>Educational tool only · Not medical advice</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
