import React, { useState } from 'react';
import { 
  RotateCw, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  TrendingUp, 
  RefreshCcw, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Info
} from 'lucide-react';
import { CONTINGENCIES } from '../services/api';

export default function ApplyFixRetestModal({
  isOpen,
  onClose,
  retestData,
  isRetesting,
  enabledContingencies,
  toggleContingency,
  onExecuteRetest,
  onResetToBaseline
}) {
  if (!isOpen) return null;

  const comparison = retestData?.comparison;
  const baseline = retestData?.baseline;
  const retest = retestData?.retest;

  const baselinePercent = comparison?.baselineHandledPercentage ?? 0;
  const retestPercent = comparison?.retestHandledPercentage ?? 0;
  const absoluteGain = comparison?.absoluteGain ?? 0;
  const recoveredList = comparison?.recoveredScenarios || [];
  const stillFailingList = comparison?.stillFailingScenarios || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden my-8 animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-navy-700 bg-navy-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <RotateCw className="w-5 h-5 animate-spin-reverse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">APPLY FIX & RETEST</h2>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  Decision Intelligence Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stress-test identical failure conditions against your active contingency safeguards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Safeguard Configuration Bar */}
          <div className="p-4 rounded-xl bg-navy-800/80 border border-navy-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Configured Contingency Defenses ({enabledContingencies.length} of 4 Active)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Toggle procedures to test how the workflow recovers from compound outages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onResetToBaseline}
                  className="px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Reset Baseline (0 Fixes)</span>
                </button>
                <button
                  onClick={onExecuteRetest}
                  disabled={isRetesting}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRetesting ? 'animate-spin' : ''}`} />
                  <span>{isRetesting ? 'Evaluating Retest...' : 'Run Retest Simulation'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {CONTINGENCIES.map((c) => {
                const active = enabledContingencies.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleContingency(c.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-slate-200'
                        : 'bg-navy-900/60 border-navy-700/80 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <span className={active ? 'text-emerald-300' : 'text-slate-300'}>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        Addresses: {c.addresses.join(', ')}
                      </span>
                    </div>
                    {active ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before vs After Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Baseline Card */}
            <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-700/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Baseline (Zero Contingencies)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-rose-400">{baselinePercent}%</span>
                <span className="text-xs text-slate-400">handled</span>
              </div>
              <div className="text-xs space-y-1 text-slate-400 pt-1 border-t border-navy-800">
                <div className="flex justify-between">
                  <span>Successful Scenarios:</span>
                  <span className="font-mono text-slate-200">{comparison?.baselineHandledCount ?? 0} of {comparison?.totalScenarios ?? 15}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan Health:</span>
                  <span className="font-semibold text-rose-400">{comparison?.healthBefore || 'High Risk'}</span>
                </div>
              </div>
            </div>

            {/* Delta Comparison */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-navy-850 to-violet-950/40 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Resiliency Delta</span>
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">
                    +{absoluteGain}%
                  </span>
                  <span className="text-xs text-emerald-300/80">gain in handled tests</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 pt-2 border-t border-indigo-500/20">
                <b className="text-white">{recoveredList.length}</b> failure scenario(s) recovered by active contingencies.
              </p>
            </div>

            {/* Retested Card */}
            <div className="p-4 rounded-xl bg-navy-950/80 border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Retest (With Active Fixes)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">{retestPercent}%</span>
                <span className="text-xs text-slate-400">handled</span>
              </div>
              <div className="text-xs space-y-1 text-slate-400 pt-1 border-t border-navy-800">
                <div className="flex justify-between">
                  <span>Successful Scenarios:</span>
                  <span className="font-mono text-emerald-300">{comparison?.retestHandledCount ?? 0} of {comparison?.totalScenarios ?? 15}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan Health:</span>
                  <span className="font-semibold text-emerald-400">{comparison?.healthAfter || 'Looks Resilient'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Scientific Disclaimer as required by Section 12 */}
          <div className="p-3 rounded-lg bg-navy-800/40 border border-navy-700/60 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Methodological Transparency Notice:</span>{' '}
              {retestPercent}% represents the exact proportion of tested compound failure combinations successfully absorbed by configured fallback rules ({comparison?.retestHandledCount ?? 0}/{comparison?.totalScenarios ?? 15}). This is an objective simulation score, not an empirical probability prediction of real-world outcomes.
            </div>
          </div>

          {/* Recovered Scenarios Inspection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recovered Scenarios ({recoveredList.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Transformed from Halted &rarr; Handled</span>
            </div>

            {recoveredList.length === 0 ? (
              <div className="p-4 rounded-xl bg-navy-800/30 border border-navy-700 text-xs text-slate-400 text-center">
                No failure scenarios recovered yet. Enable contingencies above and click "Run Retest Simulation".
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {recoveredList.map((sc, i) => (
                  <div key={i} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">
                        Failures: {sc.activeFailureNames.join(' + ')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {sc.retestOutcome}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{sc.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remaining Blockers */}
          {stillFailingList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Remaining Unresolved Paths ({stillFailingList.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Still Halting the Gate</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {stillFailingList.map((sc, i) => (
                  <div key={i} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{sc.activeFailureNames.join(' + ')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        Blocked at {sc.blockedAt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{sc.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-700 bg-navy-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Baseline preserved. Real-time deterministic retest.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
