import React, { useState } from 'react';
import { 
  Percent, 
  HelpCircle, 
  Sliders, 
  Info, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCw,
  Sparkles
} from 'lucide-react';

export default function RiskAnalysisView({
  workflow,
  setWorkflow,
  onTriggerRetest,
  onOpenCopilotWithQuery
}) {
  const [selectedCompId, setSelectedCompId] = useState(workflow.components[0].id);

  const selectedComp = workflow.components.find(c => c.id === selectedCompId) || workflow.components[0];

  const handleProbChange = (newProb) => {
    const updatedComponents = workflow.components.map(c => 
      c.id === selectedComp.id ? { ...c, failureProb: newProb } : c
    );
    setWorkflow({ ...workflow, components: updatedComponents });
  };

  // Explicit transparent math calculations
  const internetP = workflow.components.find(c => c.id === 'comp_reg')?.failureProb ?? 0.20;
  const otpConditionalGivenInternet = 0.95; // P(OTP | Internet Outage)
  const jointInternetAndOtp = internetP * otpConditionalGivenInternet;

  const qrP = workflow.components.find(c => c.id === 'comp_qr')?.failureProb ?? 0.10;
  const jointIndependentInternetAndQr = internetP * qrP;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Failure Probability Analysis</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Transparent Calculations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditable mathematical probabilities versus tested scenario fractions. Zero fabricated statistics.
          </p>
        </div>

        <button
          onClick={onTriggerRetest}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 self-start transition-all"
        >
          <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
          <span>Recalculate Stress Test</span>
        </button>
      </div>

      {/* Distinction Framework Banner (Section 8 Requirement) */}
      <div className="p-5 rounded-2xl bg-navy-900 border border-indigo-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Core Statistical Disambiguation
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          In decision intelligence, four distinct metrics are frequently conflated. PLANB LAB strictly separates them:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-navy-950 border border-navy-700/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">1. Individual P(A)</span>
            <span className="text-xs font-semibold text-white">Component Base Risk</span>
            <p className="text-[11px] text-slate-400">Probability of an isolated component failing without external context.</p>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-700/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">2. Conditional P(B | A)</span>
            <span className="text-xs font-semibold text-white">Induced Failure Risk</span>
            <p className="text-[11px] text-slate-400">Likelihood that component B fails given that upstream component A has failed.</p>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-700/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">3. Joint P(A ∩ B)</span>
            <span className="text-xs font-semibold text-white">Compound Co-Occurrence</span>
            <p className="text-[11px] text-slate-400">Calculated strictly as P(A) × P(B | A). (Or P(A) × P(B) if strictly independent).</p>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-700/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">4. Scenario Test Fraction</span>
            <span className="text-xs font-semibold text-white">Simulation Coverage</span>
            <p className="text-[11px] text-slate-400">Percentage of tested edge-case combinations that halted vs handled.</p>
          </div>
        </div>
      </div>

      {/* Component Risk Inspector & Live Assumption Tuner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Selector List */}
        <div className="p-5 rounded-2xl glass-panel border border-navy-700 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Inspect Workflow Components
          </span>

          <div className="space-y-2">
            {workflow.components.map((c) => {
              const isSelected = selectedComp.id === c.id;
              const pct = Math.round(c.failureProb * 100);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCompId(c.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                      : 'bg-navy-900/60 border-navy-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{c.name}</div>
                    <span className="text-[10px] text-slate-500 font-mono">Stage {c.stepNumber}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${
                    pct > 15 ? 'text-rose-400' : pct > 8 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Dive on Selected Component */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold">
                Stage {selectedComp.stepNumber} Risk Assessment
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedComp.name}</h3>
            </div>

            {/* Clear Labels as required by Section 8 */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
                Configured Estimate: {(selectedComp.failureProb * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-navy-800 text-slate-400 font-mono border border-navy-700">
                Historical: Not Recorded
              </span>
            </div>
          </div>

          {/* Interactive Probability Tuner */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white block">Edit Assumed Probability</label>
                <span className="text-[11px] text-slate-400">
                  Slide to update this assumption; dependent stress tests will recalculate.
                </span>
              </div>
              <span className="text-2xl font-mono font-extrabold text-indigo-400">
                {(selectedComp.failureProb * 100).toFixed(0)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(selectedComp.failureProb * 100)}
              onChange={(e) => handleProbChange(Number(e.target.value) / 100)}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            {/* Horizontal Risk Bar Indicator */}
            <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  selectedComp.failureProb > 0.15 ? 'bg-rose-500' : selectedComp.failureProb > 0.08 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${selectedComp.failureProb * 100}%` }}
              />
            </div>
          </div>

          {/* Structured Plain-Language Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-navy-800/40 border border-navy-700/80 space-y-1">
              <span className="font-bold text-slate-200 block">Plain-Language Explanation:</span>
              <p className="text-slate-400 leading-relaxed">
                {selectedComp.description || 'Core stage in student check-in pipeline.'} Operates under a configured assumption of {(selectedComp.failureProb * 100).toFixed(0)}% baseline operational interruption risk.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-800/40 border border-navy-700/80 space-y-1">
              <span className="font-bold text-slate-200 block">Potential Cascading Consequences:</span>
              <p className="text-slate-400 leading-relaxed">
                If {selectedComp.name} fails, downstream stages cannot proceed unless active contingency bypasses are engaged. Queue bottlenecks form immediately.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-800/40 border border-navy-700/80 space-y-1">
              <span className="font-bold text-slate-200 block">Related Components & Dependencies:</span>
              <p className="text-slate-400 leading-relaxed">
                {selectedComp.dependencies.length > 0 
                  ? `Directly dependent on: ${selectedComp.dependencies.join(', ')}.` 
                  : 'Zero external hardware dependencies; acts as an independent pipeline stage.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-800/40 border border-navy-700/80 space-y-1">
              <span className="font-bold text-slate-200 block">Suggested Safeguards & Interventions:</span>
              <p className="text-slate-400 leading-relaxed">
                {selectedComp.allowedFallbacks.length > 0
                  ? `Enable ${selectedComp.allowedFallbacks.join(' or ')} in the contingency panel.`
                  : 'Establish a secondary manual review station to prevent total pipeline blockages.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Mathematical Formulas Demonstration */}
      <div className="p-6 rounded-2xl glass-panel border border-navy-700 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">
          Exact Mathematical Models (Dependent vs Independent)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dependent Model */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">Dependent Conditional Cascade</span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                Internet ∩ OTP
              </span>
            </div>
            <div className="p-3 rounded-lg bg-navy-900 border border-navy-700 font-mono text-xs text-white">
              P(Internet ∩ OTP) = P(Internet) × P(OTP | Internet)<br />
              = {(internetP).toFixed(2)} × {otpConditionalGivenInternet} = <b>{(jointInternetAndOtp * 100).toFixed(1)}%</b>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Because SMS/Email OTP verification relies directly on cloud network access, conditional failure P(OTP | Internet) jumps to 95%, creating a 19.0% compound failure likelihood.
            </p>
          </div>

          {/* Independent Model */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Independent Hardware Fault</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Internet ∩ QR Jam
              </span>
            </div>
            <div className="p-3 rounded-lg bg-navy-900 border border-navy-700 font-mono text-xs text-white">
              P(Internet ∩ QR Jam) = P(Internet) × P(QR Jam)<br />
              = {(internetP).toFixed(2)} × {(qrP).toFixed(2)} = <b>{(jointIndependentInternetAndQr * 100).toFixed(1)}%</b>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hardware optical scanner jamming is physically independent of external Internet connectivity. Therefore, independence multiplication applies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
