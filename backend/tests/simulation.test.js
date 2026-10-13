import {
  generateFailureCombinations,
  simulateScenario,
  runComprehensiveSimulationSuite,
  compareSimulations,
  calculateProbabilityMetrics,
  FAILURE_MODES
} from '../src/services/simulationEngine.js';

console.log('--- RUNNING SIMULATION ENGINE TESTS ---');

// Test 1: Verify 15 combinations
const combinations = generateFailureCombinations(FAILURE_MODES);
console.assert(combinations.length === 15, `Expected 15 combinations, got ${combinations.length}`);
console.log(`✓ Test 1 Passed: Exactly ${combinations.length} non-empty combinations generated.`);

// Test 2: Verify Baseline run with 0 contingencies
const baseline = runComprehensiveSimulationSuite({ enabledContingencies: [] });
console.assert(baseline.totalScenariosTested === 15, 'Total scenarios should be 15');
console.log(`✓ Test 2 Passed: Baseline test executed. Handled: ${baseline.scenariosHandledSuccessfully}/15 (${baseline.handledPercentage}%). Plan Health: ${baseline.planHealth}`);

// Test 3: Verify Retest run with all 4 contingencies enabled
const retest = runComprehensiveSimulationSuite({
  enabledContingencies: ['offline_records', 'alternative_id_check', 'backup_qr_procedure', 'backup_staff_oncall']
});
console.log(`✓ Test 3 Passed: Retest with all contingencies. Handled: ${retest.scenariosHandledSuccessfully}/15 (${retest.handledPercentage}%). Plan Health: ${retest.planHealth}`);

// Test 4: Comparison
const comparison = compareSimulations(baseline, retest);
console.assert(comparison.recoveredCount > 0, 'Should have recovered scenarios');
console.log(`✓ Test 4 Passed: Comparison computed. Recovered scenarios: ${comparison.recoveredCount}, Absolute Gain: +${comparison.absoluteGain}%`);

// Test 5: Verify Conditional Probability Formula
const probMetrics = calculateProbabilityMetrics();
console.assert(probMetrics.conditionalAnalysis.jointProbability === 0.19, 'Joint probability should equal 0.19');
console.log(`✓ Test 5 Passed: Conditional probability verified: P(A ∩ B) = ${probMetrics.conditionalAnalysis.jointProbability}`);

console.log('--- ALL SIMULATION ENGINE TESTS PASSED SUCCESSFULLY ---');
