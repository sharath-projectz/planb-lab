import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { CONTINGENCIES, FAILURE_MODES } from '../services/api';

export default function ContextPanel({ 
  selectedNode, 
  enabledContingencies, 
  toggleContingency,
  activeFailures,
  toggleFailure,
  onTriggerRetest,
  onOpenCopilotWithQuery
}) {
  return (
    <aside className="w-80 border-l border-navy-700 bg-navy-900/90 backdrop-blur-xl p-4 overflow-y-auto space-y-6 hidden xl:block">
      {/* 1. Node Inspector (if a node is clicked) */}
      {selectedNode ? (
        <div className="p-4 rounded-xl bg-navy-800/90 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Step {selectedNode.stepNumber} Selected</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {(selectedNode.failureProb * 100).toFixed(0)}% Risk
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
            <p className="text-xs text-slate-400 mt-1">{selectedNode.description}</p>
          </div>

          <div className="pt-2 border-t border-navy-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Direct Dependencies:</span>
              <span className="text-slate-200 font-medium">
                {selectedNode.dependencies.length > 0 ? selectedNode.dependencies.join(', ') : 'None (Independent)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Configured Fallbacks:</span>
              <span className="text-emerald-400 font-medium">
                {selectedNode.allowedFallbacks.length > 0 ? `${selectedNode.allowedFallbacks.length} available` : 'None'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenCopilotWithQuery(`Why is ${selectedNode.name} configured with ${(selectedNode.failureProb * 100).toFixed(0)}% failure risk?`)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audit Node with Copilot</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-navy-800/50 border border-navy-700 text-xs text-slate-400 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Click any workflow node in the builder or failure map to inspect component dependencies.</span>
        </div>
      )}

      {/* 2. Interactive Contingency Guardrails */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Active Contingencies</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {enabledContingencies.length} of 4 Active
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Toggle safeguards below and click <b className="text-indigo-400">Retest</b> to evaluate resiliency gains.
        </p>

        <div className="space-y-2">
          {CONTINGENCIES.map((cont) => {
            const isEnabled = enabledContingencies.includes(cont.id);
            return (
              <div 
                key={cont.id}
                onClick={() => toggleContingency(cont.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isEnabled 
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200' 
                    : 'bg-navy-800/40 border-navy-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className={isEnabled ? 'text-emerald-300' : 'text-slate-300'}>{cont.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cont.description}</p>
                  </div>
                  <div className="text-emerald-400 mt-0.5">
                    {isEnabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                </div>

                {cont.requires?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-navy-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Prerequisite Condition:</span>
                    <span className="font-mono text-amber-400">Requires Staff Available</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onTriggerRetest}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold tracking-wide shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>APPLY FIX & RETEST</span>
        </button>
      </div>

      {/* 3. Live Failure Mode Injections */}
      <div className="space-y-3 pt-2 border-t border-navy-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Inject Faults</h3>
          </div>
          <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {activeFailures.length} Active
          </span>
        </div>

        <div className="space-y-1.5">
          {FAILURE_MODES.map((fail) => {
            const isFailing = activeFailures.includes(fail.id);
            return (
              <button
                key={fail.id}
                onClick={() => toggleFailure(fail.id)}
                className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                  isFailing
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                    : 'bg-navy-800/30 border-navy-700 text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isFailing ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="font-medium">{fail.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{(fail.baseProb * 100).toFixed(0)}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
