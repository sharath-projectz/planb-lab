import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Bot, 
  RotateCw, 
  User, 
  Zap, 
  ChevronRight,
  Menu,
  Activity
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  planHealth, 
  handledPercentage, 
  openCopilot, 
  onTriggerRetest,
  openAuthModal,
  currentUser,
  onLogout,
  toggleSidebar
}) {
  const getHealthBadge = () => {
    switch (planHealth) {
      case 'Looks Resilient':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-glow-emerald">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Looks Resilient ({handledPercentage}% Handled)</span>
          </div>
        );
      case 'Needs Attention':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-semibold shadow-glow-amber">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Needs Attention ({handledPercentage}% Handled)</span>
          </div>
        );
      case 'High Risk':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-semibold shadow-glow-rose">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>High Risk ({handledPercentage}% Handled)</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-navy-700 bg-navy-950/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-3 group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-base tracking-tighter">PB</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-300 transition-colors">PLANB LAB</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">Intelligence</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Break the plan before reality does</p>
          </div>
        </button>

        {currentView !== 'landing' && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-navy-700">
            <span>Workflow:</span>
            <span className="font-semibold text-slate-200">College Fest Registration</span>
          </div>
        )}
      </div>

      {/* Right Action Elements */}
      <div className="flex items-center gap-3">
        {/* Health status pill */}
        {currentView !== 'landing' && getHealthBadge()}

        {/* Most Important Interactive Action: APPLY FIX & RETEST */}
        {currentView !== 'landing' && (
          <button
            id="btn-apply-fix-retest-nav"
            onClick={onTriggerRetest}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95"
            title="Preserve baseline and retest against revised contingencies"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
            <span className="hidden sm:inline">APPLY FIX & RETEST</span>
            <span className="sm:hidden">Retest</span>
          </button>
        )}

        {/* AI Copilot Button */}
        <button
          id="btn-nav-copilot"
          onClick={openCopilot}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-medium transition-all shadow-sm"
          title="Open PLANB Copilot Contextual Assistant"
        >
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="hidden md:inline">PLANB Copilot</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </button>

        {/* User Auth */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-200">
              {currentUser.name ? currentUser.name[0] : 'U'}
            </div>
            <button 
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors hidden sm:inline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs font-medium border border-navy-700 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
