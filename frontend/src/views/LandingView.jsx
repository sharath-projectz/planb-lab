import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Network, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Play,
  RotateCcw
} from 'lucide-react';

export default function LandingView({ 
  onStartDemo, 
  onLoadCustomPlan,
  onSelectSampleWorkflow 
}) {
  const [customPlanText, setCustomPlanText] = useState(
    "I'm organizing a college fest for 500 students. Registration requires internet access, OTP verification, and QR scanning."
  );

  const sampleCards = [
    {
      id: 'college_event_reg',
      title: 'College Fest Registration',
      tag: 'Primary Live Demo',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: '500-attendee check-in gate depending on venue Wi-Fi, SMS OTP gateway, 2D QR scanners, and desk volunteers.',
      points: ['4 failure failure modes', '15 stress combinations', 'Encrypted offline roster fallback']
    },
    {
      id: 'small_business_pos',
      title: 'Retail Store POS Checkout',
      tag: 'Commerce & Retail',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      description: 'Point-of-sale register handling NFC card taps, cloud inventory sync, and hardware thermal printing.',
      points: ['Cloud network dropouts', 'Payment gateway timeouts', 'Local offline transaction spooling']
    },
    {
      id: 'emergency_evacuation',
      title: 'Emergency Alert & Evacuation',
      tag: 'Campus Safety',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Telemetry sensor trip triggering SMS broadcast geocast and safety warden roll-call accountability.',
      points: ['Telecom tower overload', 'Manual muster accounting', 'Multi-channel failover']
    }
  ];

  const handleCustomPlanSubmit = (e) => {
    e.preventDefault();
    onLoadCustomPlan(customPlanText);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-glow-indigo">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hackathon Decision Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Every plan has a <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
            Plan B.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
          Discover hidden risks. Test your decisions. Prepare for failure.
        </p>

        {/* 4 Steps Methodology Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2 text-[11px] sm:text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-indigo-300">1. UNDERSTAND</span>
          <span>&rarr;</span>
          <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-violet-300">2. DISCOVER</span>
          <span>&rarr;</span>
          <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-amber-300">3. IMPROVE</span>
          <span>&rarr;</span>
          <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-emerald-300">4. RETEST</span>
        </div>

        {/* Hero CTAs */}
        <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
          <button
            id="btn-hero-test-plan"
            onClick={onStartDemo}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2"
          >
            <span>Test My Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="btn-hero-explore-demo"
            onClick={onStartDemo}
            className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-slate-200 hover:text-white font-semibold text-sm border border-navy-700 hover:border-slate-600 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Explore Demo</span>
          </button>
        </div>
      </div>

      {/* Plan Input Box Section */}
      <div className="max-w-2xl mx-auto w-full p-6 rounded-2xl glass-panel-elevated shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            <span>Stress-Test Your Plan in 1 Click</span>
          </span>
          <span className="text-[11px] text-slate-400">Natural-Language Plan Intake</span>
        </div>

        <form onSubmit={handleCustomPlanSubmit} className="space-y-3">
          <textarea
            id="plan-description-input"
            rows="3"
            value={customPlanText}
            onChange={(e) => setCustomPlanText(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-navy-950 border border-navy-700 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-slate-500 leading-relaxed transition-colors"
            placeholder="Describe your workflow and dependencies..."
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Loads directly into the deterministic simulator without complex setup.
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              Analyze Failure Cascade
            </button>
          </div>
        </form>
      </div>

      {/* Sample Workflow Cards */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Preconfigured Decision Templates</h2>
          <p className="text-xs text-slate-400">Choose a benchmark workflow to inspect failure propagation immediately</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectSampleWorkflow(card.id)}
              className="p-5 rounded-2xl glass-panel hover:glass-panel-elevated border border-navy-700 hover:border-indigo-500/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${card.badgeColor}`}>
                    {card.tag}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-3 border-t border-navy-800 space-y-1.5">
                {card.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
