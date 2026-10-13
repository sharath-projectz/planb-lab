import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Save, 
  RotateCw, 
  Sliders, 
  Plus, 
  Trash2,
  Cpu,
  Sparkles,
  Info
} from 'lucide-react';
import { CONTINGENCIES, FAILURE_MODES } from '../services/api';

export default function WorkflowBuilderView({
  workflow,
  setWorkflow,
  selectedNode,
  setSelectedNode,
  onTriggerRetest,
  onOpenCopilotWithQuery
}) {
  const [editingComp, setEditingComp] = useState(selectedNode || workflow.components[0]);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleSelect = (comp) => {
    setSelectedNode(comp);
    setEditingComp(comp);
  };

  const handleUpdateCurrent = (field, value) => {
    const updated = { ...editingComp, [field]: value };
    setEditingComp(updated);

    // Update in workflow components
    const newComponents = workflow.components.map(c => c.id === updated.id ? updated : c);
    setWorkflow({ ...workflow, components: newComponents });
    setSelectedNode(updated);
  };

  const toggleDependency = (depId) => {
    const deps = editingComp.dependencies || [];
    const nextDeps = deps.includes(depId)
      ? deps.filter(d => d !== depId)
      : [...deps, depId];
    handleUpdateCurrent('dependencies', nextDeps);
  };

  const toggleFallback = (fallbackId) => {
    const fbs = editingComp.allowedFallbacks || [];
    const nextFbs = fbs.includes(fallbackId)
      ? fbs.filter(f => f !== fallbackId)
      : [...fbs, fallbackId];
    handleUpdateCurrent('allowedFallbacks', nextFbs);
  };

  const handleSave = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Workflow Builder</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Visual Pipeline Editor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure registration stages, failure likelihoods, and contingency fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span>{saveFeedback ? 'Changes Saved!' : 'Save Configuration'}</span>
          </button>
          <button
            onClick={onTriggerRetest}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
            <span>Run Stress Test</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Nodes representation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Pipeline Sequence (5 Core Operations)
          </span>
          <span className="text-[11px] text-slate-400">Click a node to inspect & tune</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {workflow.components.map((comp, idx) => {
            const isSelected = editingComp?.id === comp.id;
            const probPct = Math.round(comp.failureProb * 100);

            return (
              <div
                key={comp.id}
                onClick={() => handleSelect(comp)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/80 to-navy-900 border-indigo-500 shadow-glow-indigo'
                    : 'bg-navy-900/80 border-navy-700/80 hover:border-slate-600'
                }`}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-navy-800 text-slate-400 border border-navy-700'
                  }`}>
                    Stage {comp.stepNumber}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    probPct > 15 ? 'text-rose-400' : probPct > 8 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {probPct}% Risk
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{comp.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{comp.description}</p>
                </div>

                {/* Dependencies indicators */}
                <div className="pt-2 border-t border-navy-800 text-[10px] text-slate-400 space-y-1">
                  <div className="truncate">
                    <span className="text-slate-500">Deps: </span>
                    <span className="text-indigo-300 font-mono">
                      {comp.dependencies.length > 0 ? comp.dependencies.length : '0'}
                    </span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Fallbacks: </span>
                    <span className="text-emerald-300 font-mono">
                      {comp.allowedFallbacks.length}
                    </span>
                  </div>
                </div>

                {/* Arrow connector on desktop */}
                {idx < workflow.components.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-navy-800 border border-navy-600 items-center justify-center text-slate-400 shadow-md">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Inspector & Configuration Editor */}
      {editingComp && (
        <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Editing Stage {editingComp.stepNumber}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {editingComp.id}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{editingComp.name}</h3>
            </div>

            <button
              onClick={() => onOpenCopilotWithQuery(`Analyze potential failure propagation and contingency weaknesses in ${editingComp.name}.`)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center gap-2 transition-colors self-start"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask Copilot to Audit Stage</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Probability Slider & Basic info */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Component Name</label>
                <input
                  type="text"
                  value={editingComp.name}
                  onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 focus:border-indigo-500 focus:outline-none text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editingComp.description}
                  onChange={(e) => handleUpdateCurrent('description', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 focus:border-indigo-500 focus:outline-none text-xs text-white leading-relaxed"
                />
              </div>

              {/* Configured Failure Probability Slider */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white block">
                      Configured Failure Probability
                    </label>
                    <span className="text-[10px] text-slate-400">
                      User-configured assumption (never fabricated historical data)
                    </span>
                  </div>
                  <span className="text-lg font-mono font-extrabold text-indigo-400">
                    {(editingComp.failureProb * 100).toFixed(0)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(editingComp.failureProb * 100)}
                  onChange={(e) => handleUpdateCurrent('failureProb', Number(e.target.value) / 100)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Fully Resilient)</span>
                  <span>50%</span>
                  <span>100% (Guaranteed Outage)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Dependencies and Allowed Contingencies */}
            <div className="space-y-4">
              {/* Failure Dependencies */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Cascading Failure Triggers (Dependencies)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  When any selected fault trips, this component is directly affected.
                </p>

                <div className="space-y-1.5">
                  {FAILURE_MODES.map((mode) => {
                    const isChecked = editingComp.dependencies?.includes(mode.id);
                    return (
                      <div
                        key={mode.id}
                        onClick={() => toggleDependency(mode.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-rose-950/25 border-rose-500/40 text-slate-200'
                            : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-medium">{mode.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-rose-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Allowed Contingencies */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Allowed Fallback Procedures
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Safeguards permitted to absorb or bypass outages for this component.
                </p>

                <div className="space-y-1.5">
                  {CONTINGENCIES.map((c) => {
                    const isAllowed = editingComp.allowedFallbacks?.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleFallback(c.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isAllowed
                            ? 'bg-emerald-950/25 border-emerald-500/40 text-slate-200'
                            : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-medium">{c.name}</span>
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => {}}
                          className="accent-emerald-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
