import React, { useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Play, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { DEFAULT_WORKFLOW } from '../services/api';

export default function WorkflowsListView({
  activeWorkflow,
  onSelectWorkflow,
  onEditInBuilder,
  onTriggerRetest
}) {
  const [workflows, setWorkflows] = useState([
    {
      id: 'college_event_reg',
      name: DEFAULT_WORKFLOW.name,
      category: DEFAULT_WORKFLOW.category,
      description: DEFAULT_WORKFLOW.description,
      stepCount: 5,
      isPrimary: true
    },
    {
      id: 'small_business_pos',
      name: 'Omnichannel Boutique Store Checkout & Inventory Sync',
      category: 'Retail & Commerce',
      description: 'Point of sale terminal processing contactless payments, online cloud inventory sync, and hardware thermal printing.',
      stepCount: 3,
      isPrimary: false
    },
    {
      id: 'emergency_evacuation',
      name: 'Municipal Campus Emergency Alert & Evacuation Dispatch',
      category: 'Safety & Resilience',
      description: 'Triggering siren alert, SMS geocast warning, and assembly point head-count verification.',
      stepCount: 3,
      isPrimary: false
    }
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Decision Workflows Library</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              3 Benchmark Templates
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Select or customize workflow pipelines to stress-test failure cascades and contingency procedures.
          </p>
        </div>

        <button
          onClick={onEditInBuilder}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all self-start"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Open in Visual Builder</span>
        </button>
      </div>

      {/* Workflow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflows.map((wf) => {
          const isActive = activeWorkflow.id === wf.id;

          return (
            <div
              key={wf.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-950/40 via-navy-900 to-navy-950 border-indigo-500 shadow-glow-indigo ring-1 ring-indigo-400'
                  : 'glass-panel border-navy-700/80 hover:border-slate-600'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-indigo-300 border border-navy-700">
                    {wf.category}
                  </span>
                  {wf.isPrimary && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Primary Hackathon Demo
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{wf.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {wf.description}
                </p>
              </div>

              <div className="pt-4 border-t border-navy-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Pipeline Depth:</span>
                  <span className="font-mono text-slate-200 font-bold">{wf.stepCount} Stages</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectWorkflow(wf.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-navy-800 hover:bg-navy-700 text-slate-200'
                    }`}
                  >
                    <span>{isActive ? 'Active Workflow' : 'Load Pipeline'}</span>
                    {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={onEditInBuilder}
                    className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
                    title="Edit in builder"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
