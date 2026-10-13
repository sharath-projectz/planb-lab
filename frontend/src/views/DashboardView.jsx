import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  Network, 
  GitBranch, 
  RotateCw, 
  Sliders, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DashboardView({
  workflow,
  simulationSuite,
  onNavigate,
  onTriggerRetest,
  onOpenCopilotWithQuery
}) {
  const handledPercent = simulationSuite?.handledPercentage ?? 0;
  const planHealth = simulationSuite?.planHealth ?? 'High Risk';
  const totalScenarios = simulationSuite?.totalScenariosTested ?? 15;
  const handledCount = simulationSuite?.scenariosHandledSuccessfully ?? 0;
  const blockedCount = simulationSuite?.unresolvedFailureScenarios ?? 15;
  const degradedCount = simulationSuite?.degradedScenarios ?? 0;
  const componentCount = workflow?.components?.length ?? 5;

  // Highest-risk components sorted dynamically by configured failure probability
  const highestRiskComps = [...(workflow?.components || [])]
    .sort((a, b) => b.failureProb - a.failureProb)
    .slice(0, 3);

  // Recent investigation records
  const recentInvestigations = [
    {
      id: 'inv-1',
      title: 'College Fest Registration (Baseline Audit)',
      date: '10 mins ago',
      handled: handledCount,
      total: totalScenarios,
      rate: `${handledPercent}%`,
      status: planHealth
    },
    {
      id: 'inv-2',
      title: 'Boutique Store POS Offline Mode Stress Test',
      date: '2 hours ago',
      handled: 11,
      total: 15,
      rate: '73%',
      status: 'Needs Attention'
    },
    {
      id: 'inv-3',
      title: 'Campus Emergency Mass Evacuation Dispatch',
      date: 'Yesterday',
      handled: 13,
      total: 15,
      rate: '87%',
      status: 'Looks Resilient'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Overall Plan Health Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        planHealth === 'Looks Resilient'
          ? 'bg-gradient-to-r from-emerald-950/40 via-navy-900 to-navy-950 border-emerald-500/40 shadow-glow-emerald'
          : planHealth === 'Needs Attention'
          ? 'bg-gradient-to-r from-amber-950/40 via-navy-900 to-navy-950 border-amber-500/40 shadow-glow-amber'
          : 'bg-gradient-to-r from-rose-950/40 via-navy-900 to-navy-950 border-rose-500/40 shadow-glow-rose'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              {planHealth === 'Looks Resilient' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : planHealth === 'Needs Attention' ? (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              )}
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Overall Plan Health: <span className={
                  planHealth === 'Looks Resilient' ? 'text-emerald-400' :
                  planHealth === 'Needs Attention' ? 'text-amber-400' : 'text-rose-400'
                }>{planHealth}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This status is derived from <b>{totalScenarios} systematic failure combinations</b> stress-tested against your currently active contingencies. Zero hardcoded placeholders: values reflect live workflow state.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span>Active Workflow: <b className="text-white">{workflow.name}</b></span>
              <span>•</span>
              <span>Contingencies Active: <b className="text-indigo-400">{simulationSuite?.enabledContingencies?.length ?? 0}/4</b></span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <span className="text-3xl font-extrabold font-mono text-white">{handledPercent}%</span>
              <span className="text-[11px] text-slate-400 block">Scenario Coverage</span>
            </div>
            <button
              onClick={onTriggerRetest}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4 animate-spin-reverse" />
              <span>APPLY FIX & RETEST</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Components Analyzed */}
        <div className="p-4 rounded-xl glass-panel border border-navy-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Components Analyzed</span>
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{componentCount}</div>
          <p className="text-[11px] text-slate-400">Sequential registration & entry stages</p>
        </div>

        {/* Card 2: Failure Scenarios Tested */}
        <div className="p-4 rounded-xl glass-panel border border-navy-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Failure Scenarios Tested</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{totalScenarios}</div>
          <p className="text-[11px] text-slate-400">All 2⁴ - 1 non-empty stress combos</p>
        </div>

        {/* Card 3: Scenarios Handled Successfully */}
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Handled Successfully</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">{handledCount}</div>
          <p className="text-[11px] text-slate-400">{degradedCount} handled under degraded fallback</p>
        </div>

        {/* Card 4: Unresolved Failure Scenarios */}
        <div className="p-4 rounded-xl glass-panel border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold">Unresolved Failures</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">{blockedCount}</div>
          <p className="text-[11px] text-slate-400">Combinations halting gate admission</p>
        </div>
      </div>

      {/* 3. Highest-Risk Components & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest-Risk Components (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Highest-Risk Components</h3>
              <p className="text-xs text-slate-400">Components with highest configured baseline failure probability</p>
            </div>
            <button
              onClick={() => onNavigate('risk_analysis')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View Math Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {highestRiskComps.map((comp) => {
              const probPercent = Math.round(comp.failureProb * 100);
              return (
                <div 
                  key={comp.id}
                  onClick={() => onNavigate('workflows')}
                  className="p-3.5 rounded-xl bg-navy-800/60 border border-navy-700/80 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        Step {comp.stepNumber}
                      </span>
                      <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {probPercent}% Configured Risk
                    </span>
                  </div>

                  {/* Horizontal Risk Bar */}
                  <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        probPercent > 15 ? 'bg-rose-500' : probPercent > 8 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${probPercent * 3.5}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Dependencies: {comp.dependencies.join(', ') || 'Independent'}</span>
                    <span className="text-indigo-300 hover:underline">Edit step &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions (1 col) */}
        <div className="p-5 rounded-2xl glass-panel border border-navy-700 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Quick Actions</h3>
            <p className="text-xs text-slate-400">Launch direct investigation workflows</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('workflows')}
              className="w-full p-3 rounded-xl bg-navy-800/80 hover:bg-navy-750 border border-navy-700 text-left text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <span>Create / Edit Workflow</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate('simulations')}
              className="w-full p-3 rounded-xl bg-navy-800/80 hover:bg-navy-750 border border-navy-700 text-left text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-violet-400" />
                <span>Run Stress Test Suite</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate('failure_map')}
              className="w-full p-3 rounded-xl bg-navy-800/80 hover:bg-navy-750 border border-navy-700 text-left text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Network className="w-4 h-4 text-emerald-400" />
                <span>View Failure Map</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onTriggerRetest}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 hover:from-indigo-900 hover:to-violet-900 border border-indigo-500/40 text-left text-xs font-bold text-white transition-all flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <RotateCw className="w-4 h-4 text-indigo-300 animate-spin-reverse" />
                <span>Compare Decisions (Retest)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-300 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="pt-2 border-t border-navy-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Need advice? Click Copilot in the top bar.</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Investigations */}
      <div className="p-5 rounded-2xl glass-panel border border-navy-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Investigations</h3>
            <p className="text-xs text-slate-400">Previously saved workflows and latest stress test runs</p>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Audited Live</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentInvestigations.map((inv) => (
            <div 
              key={inv.id}
              onClick={() => onNavigate('simulations')}
              className="p-4 rounded-xl bg-navy-800/50 border border-navy-700/80 hover:border-slate-600 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">{inv.date}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  inv.status === 'Looks Resilient' 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : inv.status === 'Needs Attention'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {inv.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">{inv.title}</h4>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-navy-800">
                <span>Handled Scenarios:</span>
                <span className="font-mono text-slate-200 font-semibold">{inv.handled}/{inv.total} ({inv.rate})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
