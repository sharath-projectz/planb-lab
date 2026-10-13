import React, { useState } from 'react';
import { 
  Cpu, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sliders, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { FAILURE_MODES, CONTINGENCIES } from '../services/api';

export default function SimulationsView({
  simulationSuite,
  onTriggerRetest,
  enabledContingencies,
  toggleContingency,
  onOpenCopilotWithQuery
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    simulationSuite?.scenarioResults?.[0]?.combinationId || 'combo_1'
  );
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'handled' | 'blocked'

  const scenarioResults = simulationSuite?.scenarioResults || [];

  const selectedScenario = scenarioResults.find(s => s.combinationId === selectedScenarioId) || scenarioResults[0];

  const filteredScenarios = scenarioResults.filter(s => {
    if (filterMode === 'handled') return s.isHandled;
    if (filterMode === 'blocked') return !s.isHandled;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Failure Injection & Stress Test Center</h1>
            <span className="text-[10px] font-semibold bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30">
              15 Systematic Scenarios
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Systematic exploration of all 2⁴ - 1 compound failure states. Fully deterministic without random rolls.
          </p>
        </div>

        <button
          onClick={onTriggerRetest}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start"
        >
          <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
          <span>APPLY FIX & RETEST</span>
        </button>
      </div>

      {/* Contingency Safety Net Summary */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Active Contingencies Safeguarding This Test Suite ({enabledContingencies.length} of 4 Active)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-indigo-400">
            {simulationSuite.scenariosHandledSuccessfully}/{simulationSuite.totalScenariosTested} Handled ({simulationSuite.handledPercentage}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {CONTINGENCIES.map((c) => {
            const active = enabledContingencies.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggleContingency(c.id)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  active
                    ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                    : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="truncate font-semibold">{c.name.split('(')[0]}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-navy-800 text-slate-500'
                }`}>
                  {active ? 'ON' : 'OFF'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 15 Combinations Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios Table / List (1 col) */}
        <div className="p-5 rounded-2xl glass-panel border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Scenario Suite ({filteredScenarios.length})
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800 text-[10px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2 py-0.5 rounded font-semibold ${
                  filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (15)
              </button>
              <button
                onClick={() => setFilterMode('handled')}
                className={`px-2 py-0.5 rounded font-semibold ${
                  filterMode === 'handled' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Handled
              </button>
              <button
                onClick={() => setFilterMode('blocked')}
                className={`px-2 py-0.5 rounded font-semibold ${
                  filterMode === 'blocked' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Blocked
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredScenarios.map((sc, index) => {
              const isSelected = selectedScenario?.combinationId === sc.combinationId;
              const isHandled = sc.isHandled;

              return (
                <div
                  key={sc.combinationId}
                  onClick={() => setSelectedScenarioId(sc.combinationId)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                      : 'bg-navy-900/60 border-navy-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Combo #{index + 1} ({sc.failureCount} fault{sc.failureCount > 1 ? 's' : ''})
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      sc.finalOutcome === 'SUCCESS' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : sc.finalOutcome === 'DEGRADED_SUCCESS' 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}>
                      {sc.finalOutcome}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200">
                    {sc.activeFailureNames.join(' + ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Scenario Inspection Panel (2 cols) */}
        {selectedScenario && (
          <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                  Inspection: Scenario {selectedScenario.combinationId}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Faults: {selectedScenario.activeFailureNames.join(' + ')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  selectedScenario.finalOutcome === 'SUCCESS' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald' 
                    : selectedScenario.finalOutcome === 'DEGRADED_SUCCESS' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-glow-rose'
                }`}>
                  {selectedScenario.finalOutcome}
                </span>

                <button
                  onClick={() => onOpenCopilotWithQuery(`Explain the outcome of test scenario ${selectedScenario.combinationId} (${selectedScenario.activeFailureNames.join(' + ')}). Why did it produce ${selectedScenario.finalOutcome}?`)}
                  className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  title="Ask Copilot about this scenario"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scenario Breakdown Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Successful Steps</span>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {selectedScenario.successfulSteps.length}
                </div>
                <p className="text-[10px] text-slate-500">Nominal or backup operational speed</p>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Degraded Steps</span>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {selectedScenario.degradedSteps.length}
                </div>
                <p className="text-[10px] text-slate-500">Manual / slowed contingency throughput</p>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Blocked Steps</span>
                <div className="text-xl font-bold font-mono text-rose-400">
                  {selectedScenario.blockedSteps.length}
                </div>
                <p className="text-[10px] text-slate-500">Pipeline stopped; line bottlenecked</p>
              </div>
            </div>

            {/* Failure Propagation Path & Applied Fixes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Applied Safeguards & Root-Cause Propagation
              </h4>

              {selectedScenario.appliedFixes?.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Contingencies Activated During Scenario:</span>
                  </span>
                  <ul className="space-y-1">
                    {selectedScenario.appliedFixes.map((fix, idx) => (
                      <li key={idx} className="text-xs text-slate-300 ml-4 list-disc">
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-xs text-slate-400">
                  Zero active safeguards intervened during this scenario run.
                </div>
              )}

              {/* Explanations & Step statuses */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">Step Execution Trail:</span>
                <div className="space-y-1.5">
                  {selectedScenario.successfulSteps.map(s => (
                    <div key={s.id} className="p-2.5 rounded-lg bg-emerald-950/15 border border-emerald-500/20 text-xs flex items-center justify-between">
                      <span className="text-slate-200">Stage {s.stepNumber}: <b>{s.name}</b></span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">PASSED</span>
                    </div>
                  ))}
                  {selectedScenario.degradedSteps.map(s => (
                    <div key={s.id} className="p-2.5 rounded-lg bg-amber-950/15 border border-amber-500/30 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-200">Stage {s.stepNumber}: <b>{s.name}</b></span>
                        <p className="text-[10px] text-amber-300/80 mt-0.5">{s.reason}</p>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono font-semibold">DEGRADED</span>
                    </div>
                  ))}
                  {selectedScenario.blockedSteps.map(s => (
                    <div key={s.id} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-200">Stage {s.stepNumber}: <b>{s.name}</b></span>
                        <p className="text-[10px] text-rose-300 mt-0.5">{s.reason}</p>
                      </div>
                      <span className="text-[10px] text-rose-400 font-mono font-semibold">BLOCKED</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
