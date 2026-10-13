import React, { useState } from 'react';
import { 
  Network, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowDown, 
  Layers, 
  RotateCw,
  Sparkles,
  Info
} from 'lucide-react';
import { FAILURE_MODES, CONTINGENCIES } from '../services/api';

export default function FailureMapView({
  workflow,
  activeFailures,
  toggleFailure,
  enabledContingencies,
  toggleContingency,
  selectedNode,
  setSelectedNode,
  onTriggerRetest,
  onOpenCopilotWithQuery
}) {
  const [hoveredMode, setHoveredMode] = useState(null);

  // Determine current node statuses based on active failures and enabled contingencies
  const isInternetDown = activeFailures.includes('internet_outage');
  const isOtpDown = activeFailures.includes('otp_unavailable');
  const isQrDown = activeFailures.includes('qr_scanner_down');
  const isStaffDown = activeFailures.includes('staff_unavailable');

  const hasOfflineRecords = enabledContingencies.includes('offline_records');
  const hasAltId = enabledContingencies.includes('alternative_id_check');
  const hasBackupQr = enabledContingencies.includes('backup_qr_procedure');
  const hasBackupStaff = enabledContingencies.includes('backup_staff_oncall');

  const staffAvailable = !isStaffDown || hasBackupStaff;

  // Node statuses: 'OPTIMAL' | 'DEGRADED' | 'BLOCKED'
  const getNodeState = (nodeId) => {
    switch (nodeId) {
      case 'comp_reg': // Online Registration
        if (!isInternetDown) return { status: 'OPTIMAL', text: 'Online Portal Active' };
        if (hasOfflineRecords && staffAvailable) return { status: 'DEGRADED', text: 'Recovered: Offline Encrypted Cache' };
        return { status: 'BLOCKED', text: 'Halted: No Internet & No Offline Cache' };

      case 'comp_otp': // OTP Verification
        if (!isInternetDown && !isOtpDown) return { status: 'OPTIMAL', text: 'SMS/Email OTP Passing' };
        if (hasAltId && staffAvailable) return { status: 'DEGRADED', text: 'Recovered: Manual Photo ID Check' };
        return { status: 'BLOCKED', text: 'Halted: OTP Failed & Alt ID Inactive' };

      case 'comp_qr': // QR Scanning
        if (!isQrDown) return { status: 'OPTIMAL', text: 'Optical Scanning Active' };
        if (hasBackupQr) return { status: 'OPTIMAL', text: 'Recovered: Handheld Backup Scanner' };
        return { status: 'BLOCKED', text: 'Halted: Scanner Jammed' };

      case 'comp_id_verify': // Identity Verification Desk
        if (!isStaffDown) return { status: 'OPTIMAL', text: 'Staff Coordinator Present' };
        if (hasBackupStaff) return { status: 'OPTIMAL', text: 'Recovered: Standby Floater Staff' };
        return { status: 'BLOCKED', text: 'Halted: No Volunteer / Staff at Desk' };

      case 'comp_entry': // Event Entry
      default:
        // Downstream depends on previous stages
        const regState = getNodeState('comp_reg').status;
        const otpState = getNodeState('comp_otp').status;
        const qrState = getNodeState('comp_qr').status;
        const idState = getNodeState('comp_id_verify').status;

        if (regState === 'BLOCKED' || otpState === 'BLOCKED' || qrState === 'BLOCKED' || idState === 'BLOCKED') {
          return { status: 'BLOCKED', text: 'Blocked by upstream bottleneck' };
        }
        if (regState === 'DEGRADED' || otpState === 'DEGRADED') {
          return { status: 'DEGRADED', text: 'Admitted via Manual Contingency Desk' };
        }
        return { status: 'OPTIMAL', text: 'Normal High-Speed Admission' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPTIMAL':
        return 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 shadow-glow-emerald';
      case 'DEGRADED':
        return 'border-amber-500/50 bg-amber-950/20 text-amber-300 shadow-glow-amber';
      case 'BLOCKED':
      default:
        return 'border-rose-500/50 bg-rose-950/25 text-rose-300 shadow-glow-rose';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Failure Connection Map</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Interactive Dependency Graph
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe how upstream outages propagate across nodes and test how contingency guardrails sever the cascade.
          </p>
        </div>

        <button
          onClick={onTriggerRetest}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
          <span>APPLY FIX & RETEST</span>
        </button>
      </div>

      {/* Fault Injection Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Interactive Fault Triggers (Click to Inject or Clear)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {activeFailures.length} of 4 Faults Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FAILURE_MODES.map((mode) => {
            const active = activeFailures.includes(mode.id);
            return (
              <button
                key={mode.id}
                onClick={() => toggleFailure(mode.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                  active
                    ? 'bg-rose-950/30 border-rose-500 text-rose-200 shadow-glow-rose'
                    : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${active ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span>{mode.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {active ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Dependency Graph */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Cascade Visualization Pipeline</h3>
            <p className="text-xs text-slate-400">Green = Resilient | Amber = Degraded Fallback | Red = Blocked</p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Degraded (Recovered)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Halted (Blocked)</span>
            </div>
          </div>
        </div>

        {/* Tree Graph Layout */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Layer 1: Infrastructure Root (Internet Connection) */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-xl border text-center max-w-sm w-full transition-all ${
              isInternetDown 
                ? 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-glow-rose' 
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            }`}>
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                {isInternetDown ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                <span>WAN Venue Internet Infrastructure</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {isInternetDown ? 'STATUS: DOWN (Offline Mode Triggered)' : 'STATUS: CONNECTED (Full Bandwidth)'}
              </p>
            </div>
          </div>

          {/* Connection Arrows from Infrastructure to Middle Stages */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-indigo-700" />
          </div>

          {/* Layer 2: Intermediate Dependent Nodes (Portal, OTP, QR, Staff) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflow.components.slice(0, 4).map((comp) => {
              const state = getNodeState(comp.id);
              const isSelected = selectedNode?.id === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedNode(comp)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    getStatusColor(state.status)
                  } ${isSelected ? 'ring-2 ring-indigo-400 scale-[1.02]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-navy-950/60 px-2 py-0.5 rounded">
                      Stage {comp.stepNumber}
                    </span>
                    {state.status === 'OPTIMAL' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : state.status === 'DEGRADED' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{comp.name}</h4>
                    <p className="text-[11px] mt-1 line-clamp-2">{state.text}</p>
                  </div>

                  <div className="pt-2 border-t border-navy-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Dependencies:</span>
                    <span className="font-mono text-slate-300">{comp.dependencies.length || 'Independent'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connector Down to Final Gate Entry */}
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-700 to-emerald-500" />
          </div>

          {/* Layer 3: Final Process Outcome (Event Gate Entry) */}
          <div className="flex justify-center">
            {(() => {
              const entryComp = workflow.components[4] || { id: 'comp_entry', name: 'Turnstile & Event Entry', stepNumber: 5 };
              const entryState = getNodeState('comp_entry');

              return (
                <div className={`p-4 rounded-xl border text-center max-w-md w-full transition-all ${
                  getStatusColor(entryState.status)
                }`}>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                    {entryState.status === 'OPTIMAL' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : entryState.status === 'DEGRADED' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="text-white">Stage 5: Final Process Outcome (Turnstile & Event Entry)</span>
                  </div>
                  <p className="text-xs font-medium mt-1">
                    {entryState.text}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {entryState.status === 'OPTIMAL'
                      ? '500 attendees admitted smoothly at nominal speed.'
                      : entryState.status === 'DEGRADED'
                      ? 'Admitting attendees through offline manual roster and standby volunteers.'
                      : 'Event gate bottlenecked! Attendees queuing indefinitely.'}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Explanatory Contingency Callout */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">How Contingencies Change the Graph:</span>{' '}
          Enabling <b>Offline Registration Records</b> allows Stage 1 to operate in degraded mode when the internet fails. However, offline operations require <b>Trained Staff</b> to physically inspect names. If staff is absent and no backup coordinator is on call, the node turns red again!
        </div>
      </div>
    </div>
  );
}
