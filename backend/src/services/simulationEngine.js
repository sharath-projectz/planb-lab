/**
 * PLANB LAB - Deterministic Simulation Engine
 * Core Logic for Failure Cascades, Conditional Probabilities, and Contingency Retesting
 */

// 4 Standard Failure Modes
export const FAILURE_MODES = [
  { id: 'internet_outage', name: 'Internet Outage', baseProb: 0.20, category: 'Infrastructure' },
  { id: 'otp_unavailable', name: 'OTP Service Unavailable', baseProb: 0.15, category: 'Third-Party Service' },
  { id: 'qr_scanner_down', name: 'QR Scanner Unavailable', baseProb: 0.10, category: 'Hardware' },
  { id: 'staff_unavailable', name: 'Trained Staff Member Unavailable', baseProb: 0.08, category: 'Personnel' }
];

// Available Contingencies with Explicit Activation & Requirement Conditions
export const CONTINGENCIES = [
  {
    id: 'offline_records',
    name: 'Offline Registration Records (Encrypted Cache)',
    description: 'Pre-downloaded encrypted attendee roll-sheet stored locally on check-in tablets.',
    addresses: ['internet_outage'],
    requires: ['staff_available'], // Requires staff to operate manual search
    degradedMode: true, // Takes slightly longer per attendee
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
    name: 'Backup QR Verification (Local Cryptographic Scanner)',
    description: 'Handheld battery-operated backup QR scanner with offline public-key validation.',
    addresses: ['qr_scanner_down'],
    requires: [], // Does not require internet, only standard staff
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

// Default College Event Registration Workflow
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
      dependencies: [], // Downstream dependent on all prior steps succeeding
      canFallback: false,
      allowedFallbacks: []
    }
  ]
};

/**
 * Generate all 2^N - 1 non-empty combinations of failure conditions
 * For 4 items: exactly 15 combinations.
 */
export function generateFailureCombinations(modes = FAILURE_MODES) {
  const result = [];
  const n = modes.length;
  const totalCombinations = (1 << n) - 1; // 2^n - 1

  for (let i = 1; i <= totalCombinations; i++) {
    const combo = [];
    for (let j = 0; j < n; j++) {
      if ((i & (1 << j)) !== 0) {
        combo.push(modes[j]);
      }
    }
    result.push({
      id: `combo_${i}`,
      combinationIndex: i,
      activeFailures: combo.map(m => m.id),
      activeFailureNames: combo.map(m => m.name),
      failureCount: combo.length
    });
  }

  // Sort by failure count ascending for intuitive display
  return result.sort((a, b) => a.failureCount - b.failureCount);
}

/**
 * Deterministic Simulation of a single scenario against workflow and active contingencies
 */
export function simulateScenario({
  activeFailures = [],
  enabledContingencies = [],
  workflow = DEFAULT_WORKFLOW
}) {
  const activeFailureSet = new Set(activeFailures);
  const enabledContingencySet = new Set(enabledContingencies);

  const initialFailures = FAILURE_MODES.filter(m => activeFailureSet.has(m.id)).map(m => m.name);
  const affectedComponents = [];
  const propagationPath = [];
  const successfulSteps = [];
  const degradedSteps = [];
  const blockedSteps = [];
  const explanations = [];
  const appliedFixes = [];

  // Determine availability of personnel
  const staffDown = activeFailureSet.has('staff_unavailable');
  const backupStaffEnabled = enabledContingencySet.has('backup_staff_oncall');
  const staffEffectiveAvailable = !staffDown || backupStaffEnabled;

  if (staffDown && backupStaffEnabled) {
    appliedFixes.push('Backup Trained Staff Activated to replace missing coordinator');
  }

  // Process workflow sequentially
  let pipelineHalted = false;
  let haltReason = '';

  for (const comp of workflow.components) {
    if (pipelineHalted) {
      blockedSteps.push({
        id: comp.id,
        name: comp.name,
        stepNumber: comp.stepNumber,
        status: 'CASCADED_BLOCKED',
        reason: `Blocked due to upstream failure at prior step: ${haltReason}`
      });
      continue;
    }

    // Check if this component has direct dependency failures
    const triggeredDependencies = comp.dependencies.filter(dep => activeFailureSet.has(dep));

    if (triggeredDependencies.length === 0) {
      // No active failure directly hits this component
      successfulSteps.push({
        id: comp.id,
        name: comp.name,
        stepNumber: comp.stepNumber,
        status: 'OPTIMAL_SUCCESS',
        details: 'Operated normally with zero degradation.'
      });
      continue;
    }

    // Direct failure triggered! Check if contingency is configured and conditions are met
    affectedComponents.push(comp.name);
    propagationPath.push({
      component: comp.name,
      triggeredBy: triggeredDependencies
    });

    let recoveredByContingency = false;
    let fallbackDegraded = false;
    let fallbackExplanation = '';

    for (const contId of comp.allowedFallbacks) {
      if (enabledContingencySet.has(contId)) {
        const contingencyDef = CONTINGENCIES.find(c => c.id === contId);
        
        // Check activation prerequisites (e.g. offline records REQUIRES staff available)
        let prereqsMet = true;
        if (contingencyDef?.requires?.includes('staff_available') && !staffEffectiveAvailable) {
          prereqsMet = false;
          fallbackExplanation = `${contingencyDef.name} configured, but failed to activate because staff is unavailable!`;
        }

        if (prereqsMet) {
          recoveredByContingency = true;
          fallbackDegraded = contingencyDef.degradedMode;
          appliedFixes.push(`${contingencyDef.name} mitigated failure on ${comp.name}`);
          fallbackExplanation = `Recovered via ${contingencyDef.name}${fallbackDegraded ? ' (degraded/manual operation)' : ''}.`;
          break;
        }
      }
    }

    if (recoveredByContingency) {
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
        explanations.push(`${comp.name}: Fully restored by backup hardware/procedure.`);
      }
    } else {
      // Failed and no valid fallback active!
      pipelineHalted = true;
      haltReason = comp.name;
      const errorMsg = fallbackExplanation || `Direct failure triggered by: ${triggeredDependencies.join(', ')} with no active fallback.`;
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

  // Determine final outcome
  let finalOutcome = 'SUCCESS';
  if (blockedSteps.length > 0) {
    finalOutcome = 'BLOCKED_FAILURE';
  } else if (degradedSteps.length > 0) {
    finalOutcome = 'DEGRADED_SUCCESS';
  }

  return {
    activeFailures,
    initialFailures,
    finalOutcome, // 'SUCCESS' | 'DEGRADED_SUCCESS' | 'BLOCKED_FAILURE'
    isHandled: finalOutcome !== 'BLOCKED_FAILURE',
    affectedComponents,
    propagationPath,
    successfulSteps,
    degradedSteps,
    blockedSteps,
    appliedFixes,
    explanations,
    summaryText: finalOutcome === 'SUCCESS'
      ? 'Workflow completed with optimal throughput.'
      : finalOutcome === 'DEGRADED_SUCCESS'
      ? `Workflow completed under degraded mode (${degradedSteps.length} step(s) manual/delayed).`
      : `Workflow broken at ${haltReason}. Process halted.`
  };
}

/**
 * Run all 15 scenarios systematically
 */
export function runComprehensiveSimulationSuite({
  enabledContingencies = [],
  workflow = DEFAULT_WORKFLOW,
  limit = 15
}) {
  const allCombos = generateFailureCombinations().slice(0, limit);
  const scenarioResults = allCombos.map(combo => {
    const outcome = simulateScenario({
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

  const handledRate = total > 0 ? (handled / total) : 0;
  const handledPercentage = Math.round(handledRate * 100);

  // Overall Plan Health classification
  let planHealth = 'High Risk';
  if (handledPercentage >= 80) {
    planHealth = 'Looks Resilient';
  } else if (handledPercentage >= 45) {
    planHealth = 'Needs Attention';
  }

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

/**
 * Compare Baseline results against Retested results (Apply Fix & Retest)
 */
export function compareSimulations(baselineResult, retestResult) {
  const baselineMap = new Map(baselineResult.scenarioResults.map(s => [s.combinationId, s]));
  const recoveredScenarios = [];
  const stillFailingScenarios = [];
  const unchangedSuccessful = [];

  for (const retestScenario of retestResult.scenarioResults) {
    const baseScenario = baselineMap.get(retestScenario.combinationId);
    if (!baseScenario) continue;

    const baseHandled = baseScenario.isHandled;
    const retestHandled = retestScenario.isHandled;

    if (!baseHandled && retestHandled) {
      recoveredScenarios.push({
        combinationId: retestScenario.combinationId,
        activeFailureNames: retestScenario.activeFailureNames,
        baselineOutcome: baseScenario.finalOutcome,
        retestOutcome: retestScenario.finalOutcome,
        appliedFixes: retestScenario.appliedFixes,
        explanation: `Recovered: previously halted at ${baseScenario.blockedSteps[0]?.name || 'upstream'}, now mitigated via ${retestScenario.appliedFixes.join('; ')}.`
      });
    } else if (!retestHandled) {
      stillFailingScenarios.push({
        combinationId: retestScenario.combinationId,
        activeFailureNames: retestScenario.activeFailureNames,
        blockedAt: retestScenario.blockedSteps[0]?.name || 'Unknown',
        reason: retestScenario.blockedSteps[0]?.reason || 'Unmitigated failure cascade.'
      });
    } else {
      unchangedSuccessful.push(retestScenario.combinationId);
    }
  }

  const baselinePercent = baselineResult.handledPercentage;
  const retestPercent = retestResult.handledPercentage;
  const absoluteGain = retestPercent - baselinePercent;

  return {
    baselineHandledPercentage: baselinePercent,
    retestHandledPercentage: retestPercent,
    absoluteGain,
    baselineHandledCount: baselineResult.scenariosHandledSuccessfully,
    retestHandledCount: retestResult.scenariosHandledSuccessfully,
    totalScenarios: baselineResult.totalScenariosTested,
    recoveredCount: recoveredScenarios.length,
    stillFailingCount: stillFailingScenarios.length,
    recoveredScenarios,
    stillFailingScenarios,
    healthBefore: baselineResult.planHealth,
    healthAfter: retestResult.planHealth
  };
}

/**
 * Mathematical Probability Calculations (Explicit & Transparent)
 * Clearly distinguishes:
 * 1. P(individual component failure)
 * 2. P(B | A) conditional probability
 * 3. P(A and B) = P(A) * P(B | A)
 * 4. Fraction of tested scenarios that failed (deterministic scenario coverage)
 */
export function calculateProbabilityMetrics(components = DEFAULT_WORKFLOW.components) {
  // Configured component failure estimates
  const componentMetrics = components.map(c => {
    const pIndividual = c.failureProb;
    return {
      id: c.id,
      name: c.name,
      configuredEstimate: pIndividual,
      configuredPercentage: Math.round(pIndividual * 100),
      label: 'Configured Assumption',
      // Note: Historical estimate is null because no historical empirical sensor data exists
      historicalEstimate: null,
      explanation: `User-configured assumption: ${(pIndividual * 100).toFixed(0)}% base failure chance.`
    };
  });

  // Example Conditional Probability for demonstration (Internet Outage -> OTP Failure)
  // Let A = Internet Outage (P(A) = 0.20)
  // Given Internet Outage, P(OTP Failure | Internet Outage) = 0.95
  // Joint P(A and B) = 0.20 * 0.95 = 0.19
  const internetP = 0.20;
  const otpConditionalGivenInternet = 0.95;
  const jointInternetAndOtp = internetP * otpConditionalGivenInternet;

  // Let C = QR Scanner Hardware Down (independent of Internet, P(C) = 0.10)
  // If independent, P(Internet and QR) = 0.20 * 0.10 = 0.02
  const qrHardwareP = 0.10;
  const jointInternetAndQrIndependent = internetP * qrHardwareP;

  return {
    components: componentMetrics,
    highestRiskComponents: [...componentMetrics].sort((a, b) => b.configuredEstimate - a.configuredEstimate).slice(0, 3),
    conditionalAnalysis: {
      eventA: { name: 'Internet Outage', probability: internetP },
      eventB: { name: 'OTP Verification Failure', probabilityGivenA: otpConditionalGivenInternet },
      jointProbability: Number(jointInternetAndOtp.toFixed(4)),
      formula: 'P(Internet ∩ OTP) = P(Internet) × P(OTP | Internet)',
      explanation: 'Since OTP verification transmits credentials over the public network, internet failure directly induces 95% likelihood of OTP failure.'
    },
    independentAnalysis: {
      eventA: { name: 'Internet Outage', probability: internetP },
      eventB: { name: 'QR Scanner Hardware Jam', probability: qrHardwareP },
      jointProbability: Number(jointInternetAndQrIndependent.toFixed(4)),
      formula: 'P(Internet ∩ QR Jam) = P(Internet) × P(QR Jam) [Independent]',
      explanation: 'Hardware optical lens jam is physically independent of external network availability.'
    }
  };
}
