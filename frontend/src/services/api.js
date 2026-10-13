/**
 * PLANB LAB - API Client & Resilient Service Layer
 * Directly interfaces with Express backend with automatic graceful offline simulation fallback.
 */

const API_BASE = '/api';

export const FAILURE_MODES = [
  { id: 'internet_outage', name: 'Internet Outage', baseProb: 0.20, category: 'Infrastructure', desc: 'Complete loss of WAN connectivity at venue.' },
  { id: 'otp_unavailable', name: 'OTP Service Unavailable', baseProb: 0.15, category: 'Third-Party Service', desc: 'SMS aggregator gateway delay or downtime.' },
  { id: 'qr_scanner_down', name: 'QR Scanner Unavailable', baseProb: 0.10, category: 'Hardware', desc: 'Optical barcode sensor jam or driver failure.' },
  { id: 'staff_unavailable', name: 'Trained Staff Member Unavailable', baseProb: 0.08, category: 'Personnel', desc: 'Volunteer or check-in desk lead absent.' }
];

export const CONTINGENCIES = [
  {
    id: 'offline_records',
    name: 'Offline Registration Records (Encrypted Cache)',
    description: 'Pre-downloaded encrypted attendee roll-sheet stored locally on check-in tablets.',
    addresses: ['internet_outage'],
    requires: ['staff_available'],
    degradedMode: true,
    statusImpact: 'DEGRADED_SUCCESS'
  },
  {
    id: 'alternative_id_check',
    name: 'Alternative Physical ID Verification',
    description: 'Manual verification using government/college photo ID and printed master roster.',
    addresses: ['otp_unavailable', 'internet_outage'],
    requires: ['staff_available'],
    degradedMode: true,
    statusImpact: 'DEGRADED_SUCCESS'
  },
  {
    id: 'backup_qr_procedure',
    name: 'Backup QR Verification (Local Scanner)',
    description: 'Handheld battery-operated backup QR scanner with offline public-key validation.',
    addresses: ['qr_scanner_down'],
    requires: [],
    degradedMode: false,
    statusImpact: 'SUCCESS'
  },
  {
    id: 'backup_staff_oncall',
    name: 'Backup Trained Staff Member (On-Call Roster)',
    description: 'Designated standby coordinator trained in check-in protocols and incident handling.',
    addresses: ['staff_unavailable'],
    requires: [],
    degradedMode: false,
    statusImpact: 'SUCCESS'
  }
];

export const DEFAULT_WORKFLOW = {
  id: 'college_event_reg',
  name: 'College Fest Registration & Gate Entry',
  category: 'Event Operations',
  description: '500-student check-in pipeline requiring internet connectivity, SMS/Email OTP validation, digital QR ticket scanning, photo identity verification, and gate access.',
  components: [
    {
      id: 'comp_reg',
      stepNumber: 1,
      name: 'Online Registration Portal',
      description: 'Attendee accesses web portal to retrieve attendee profile and ticket token.',
      failureProb: 0.20,
      dependencies: ['internet_outage'],
      canFallback: true,
      allowedFallbacks: ['offline_records']
    },
    {
      id: 'comp_otp',
      stepNumber: 2,
      name: 'OTP Verification Gateway',
      description: 'SMS/Email gateway sends 6-digit confirmation PIN for identity authentication.',
      failureProb: 0.15,
      dependencies: ['internet_outage', 'otp_unavailable'],
      canFallback: true,
      allowedFallbacks: ['alternative_id_check']
    },
    {
      id: 'comp_qr',
      stepNumber: 3,
      name: 'QR Ticket Scanning Station',
      description: 'Optical scanner reads high-density 2D barcode on attendee smartphone.',
      failureProb: 0.10,
      dependencies: ['qr_scanner_down'],
      canFallback: true,
      allowedFallbacks: ['backup_qr_procedure']
    },
    {
      id: 'comp_id_verify',
      stepNumber: 4,
      name: 'Identity Verification Desk',
      description: 'Staff member matches scanned badge credential with photo roll & physical ID.',
      failureProb: 0.08,
      dependencies: ['staff_unavailable'],
      canFallback: true,
      allowedFallbacks: ['alternative_id_check', 'backup_staff_oncall']
    },
    {
      id: 'comp_entry',
      stepNumber: 5,
      name: 'Turnstile & Event Entry',
      description: 'Physical gate unlocks, credentials printed or wristband issued.',
      failureProb: 0.05,
      dependencies: [],
      canFallback: false,
      allowedFallbacks: []
    }
  ]
};

// Generate 15 combinations client-side as well
export function getCombinations() {
  const result = [];
  const n = FAILURE_MODES.length;
  for (let i = 1; i < (1 << n); i++) {
    const active = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) active.push(FAILURE_MODES[j].id);
    }
    result.push({
      id: `combo_${i}`,
      combinationIndex: i,
      activeFailures: active,
      activeFailureNames: active.map(id => FAILURE_MODES.find(m => m.id === id)?.name),
      failureCount: active.length
    });
  }
  return result.sort((a, b) => a.failureCount - b.failureCount);
}

// Client-side deterministic simulation
export function runClientSimulation({ activeFailures = [], enabledContingencies = [], workflow = DEFAULT_WORKFLOW }) {
  const activeFailureSet = new Set(activeFailures);
  const enabledContSet = new Set(enabledContingencies);

  const affectedComponents = [];
  const propagationPath = [];
  const successfulSteps = [];
  const degradedSteps = [];
  const blockedSteps = [];
  const appliedFixes = [];
  const explanations = [];

  const staffDown = activeFailureSet.has('staff_unavailable');
  const backupStaffEnabled = enabledContSet.has('backup_staff_oncall');
  const staffEffectiveAvailable = !staffDown || backupStaffEnabled;

  if (staffDown && backupStaffEnabled) {
    appliedFixes.push('Backup Trained Staff Activated to replace missing coordinator');
  }

  let pipelineHalted = false;
  let haltReason = '';

  for (const comp of workflow.components) {
    if (pipelineHalted) {
      blockedSteps.push({
        id: comp.id,
        name: comp.name,
        stepNumber: comp.stepNumber,
        status: 'CASCADED_BLOCKED',
        reason: `Blocked due to upstream failure at ${haltReason}`
      });
      continue;
    }

    const triggeredDependencies = comp.dependencies.filter(dep => activeFailureSet.has(dep));

    if (triggeredDependencies.length === 0) {
      successfulSteps.push({
        id: comp.id,
        name: comp.name,
        stepNumber: comp.stepNumber,
        status: 'OPTIMAL_SUCCESS',
        details: 'Operated normally with zero degradation.'
      });
      continue;
    }

    affectedComponents.push(comp.name);
    propagationPath.push({ component: comp.name, triggeredBy: triggeredDependencies });

    let recovered = false;
    let fallbackDegraded = false;
    let fallbackExplanation = '';

    for (const contId of comp.allowedFallbacks) {
      if (enabledContSet.has(contId)) {
        const contDef = CONTINGENCIES.find(c => c.id === contId);
        let prereqsMet = true;
        if (contDef?.requires?.includes('staff_available') && !staffEffectiveAvailable) {
          prereqsMet = false;
          fallbackExplanation = `${contDef.name} configured, but cannot run because staff is unavailable!`;
        }

        if (prereqsMet) {
          recovered = true;
          fallbackDegraded = contDef.degradedMode;
          appliedFixes.push(`${contDef.name} mitigated failure on ${comp.name}`);
          fallbackExplanation = `Recovered via ${contDef.name}${fallbackDegraded ? ' (degraded/manual operation)' : ''}.`;
          break;
        }
      }
    }

    if (recovered) {
      if (fallbackDegraded) {
        degradedSteps.push({
          id: comp.id,
          name: comp.name,
          stepNumber: comp.stepNumber,
          status: 'DEGRADED_SUCCESS',
          reason: fallbackExplanation
        });
        explanations.push(`${comp.name}: Recovered with fallback contingency (${fallbackExplanation})`);
      } else {
        successfulSteps.push({
          id: comp.id,
          name: comp.name,
          stepNumber: comp.stepNumber,
          status: 'RECOVERED_SUCCESS',
          details: fallbackExplanation
        });
        explanations.push(`${comp.name}: Fully restored by backup procedure.`);
      }
    } else {
      pipelineHalted = true;
      haltReason = comp.name;
      const errorMsg = fallbackExplanation || `Triggered by ${triggeredDependencies.join(', ')} without active fallback.`;
      blockedSteps.push({
        id: comp.id,
        name: comp.name,
        stepNumber: comp.stepNumber,
        status: 'BLOCKED',
        reason: errorMsg
      });
      explanations.push(`${comp.name} FAILED: ${errorMsg}`);
    }
  }

  let finalOutcome = 'SUCCESS';
  if (blockedSteps.length > 0) finalOutcome = 'BLOCKED_FAILURE';
  else if (degradedSteps.length > 0) finalOutcome = 'DEGRADED_SUCCESS';

  return {
    activeFailures,
    finalOutcome,
    isHandled: finalOutcome !== 'BLOCKED_FAILURE',
    affectedComponents,
    propagationPath,
    successfulSteps,
    degradedSteps,
    blockedSteps,
    appliedFixes,
    explanations
  };
}

export function runClientSuite({ enabledContingencies = [], workflow = DEFAULT_WORKFLOW }) {
  const combos = getCombinations();
  const scenarioResults = combos.map(combo => {
    const outcome = runClientSimulation({
      activeFailures: combo.activeFailures,
      enabledContingencies,
      workflow
    });
    return {
      combinationId: combo.id,
      failureCount: combo.failureCount,
      activeFailures: combo.activeFailures,
      activeFailureNames: combo.activeFailureNames,
      ...outcome
    };
  });

  const total = scenarioResults.length;
  const successful = scenarioResults.filter(r => r.finalOutcome === 'SUCCESS').length;
  const degraded = scenarioResults.filter(r => r.finalOutcome === 'DEGRADED_SUCCESS').length;
  const handled = successful + degraded;
  const blocked = scenarioResults.filter(r => r.finalOutcome === 'BLOCKED_FAILURE').length;
  const handledPercentage = Math.round((handled / total) * 100);

  let planHealth = 'High Risk';
  if (handledPercentage >= 80) planHealth = 'Looks Resilient';
  else if (handledPercentage >= 45) planHealth = 'Needs Attention';

  return {
    totalScenariosTested: total,
    successfulScenarios: successful,
    degradedScenarios: degraded,
    scenariosHandledSuccessfully: handled,
    unresolvedFailureScenarios: blocked,
    handledPercentage,
    planHealth,
    enabledContingencies,
    scenarioResults
  };
}

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return { status: 'client-offline-mode', version: '1.0.0', database: 'local', geminiAi: 'local-heuristic' };
  },

  async runRetest({ baselineContingencies = [], retestContingencies = [], workflow = DEFAULT_WORKFLOW }) {
    try {
      const res = await fetch(`${API_BASE}/simulations/retest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          baselineContingencies,
          retestContingencies
        })
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback client-side calculation
    const baseline = runClientSuite({ enabledContingencies: baselineContingencies, workflow });
    const retest = runClientSuite({ enabledContingencies: retestContingencies, workflow });

    const baselineMap = new Map(baseline.scenarioResults.map(s => [s.combinationId, s]));
    const recoveredScenarios = [];
    const stillFailingScenarios = [];

    for (const r of retest.scenarioResults) {
      const b = baselineMap.get(r.combinationId);
      if (b && !b.isHandled && r.isHandled) {
        recoveredScenarios.push({
          combinationId: r.combinationId,
          activeFailureNames: r.activeFailureNames,
          baselineOutcome: b.finalOutcome,
          retestOutcome: r.finalOutcome,
          appliedFixes: r.appliedFixes,
          explanation: `Recovered: previously halted at ${b.blockedSteps[0]?.name || 'gate'}, now mitigated via ${r.appliedFixes.join('; ')}.`
        });
      } else if (!r.isHandled) {
        stillFailingScenarios.push({
          combinationId: r.combinationId,
          activeFailureNames: r.activeFailureNames,
          blockedAt: r.blockedSteps[0]?.name || 'Unknown',
          reason: r.blockedSteps[0]?.reason || 'Unmitigated failure.'
        });
      }
    }

    return {
      baseline,
      retest,
      comparison: {
        baselineHandledPercentage: baseline.handledPercentage,
        retestHandledPercentage: retest.handledPercentage,
        absoluteGain: retest.handledPercentage - baseline.handledPercentage,
        baselineHandledCount: baseline.scenariosHandledSuccessfully,
        retestHandledCount: retest.scenariosHandledSuccessfully,
        totalScenarios: baseline.totalScenariosTested,
        recoveredCount: recoveredScenarios.length,
        stillFailingCount: stillFailingScenarios.length,
        recoveredScenarios,
        stillFailingScenarios,
        healthBefore: baseline.planHealth,
        healthAfter: retest.planHealth
      }
    };
  },

  async askCopilot({ message, workflowState, simulationContext, conversationId }) {
    try {
      const res = await fetch(`${API_BASE}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          workflowState,
          simulationContext,
          conversationId,
          workflowId: workflowState?.id
        })
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback response generator
    const query = message.toLowerCase();
    let reply = `### **PLANB Decision Intelligence Copilot**\n\n- **Analyzed Plan:** ${workflowState?.name || 'College Fest Registration'}\n- **Current Handled Rate:** ${simulationContext?.handledPercentage ?? 0}%\n- **Plan Health:** ${simulationContext?.planHealth ?? 'High Risk'}\n\n`;

    if (query.includes('internet')) {
      reply += `**Internet Outage Cascade:**\nWhen internet drops, Step 1 (Portal) and Step 2 (OTP) are instantly severed. Enabling **Offline Registration Records** recovers check-in throughput *if* staff are on duty.`;
    } else if (query.includes('improve first') || query.includes('priority')) {
      reply += `**Priority 1:** Enable **Offline Registration Records (Encrypted Cache)** to insulate against network drops.\n**Priority 2:** Add **Backup Trained Staff** so offline roll-call can actually be operated.\n\nClick **"APPLY FIX & RETEST"** to verify outcome gain.`;
    } else {
      reply += `Under the current configuration with ${simulationContext?.unresolvedFailureScenarios || 15} failing scenarios, single points of failure exist at network-dependent entry points. Enabling contingency backups will recover up to 100% of tested stress scenarios.`;
    }

    return {
      reply,
      mode: 'client-offline-heuristic',
      notice: 'Operating in client-side decision mode.'
    };
  }
};
