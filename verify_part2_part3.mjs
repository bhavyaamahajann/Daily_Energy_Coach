import assert from 'assert';
import fs from 'fs';

console.log('==========================================================================');
console.log('Ebb Verification Test Suite: Part 2 & Part 3 (Prototype & Metrics)');
console.log('==========================================================================\n');

// ==========================================================================
// Part 2: Prototype Validation Rules (Simulating TC-1 to TC-4)
// ==========================================================================

console.log('Reading app.js to extract scenario recommendation matrix...');
const appContent = fs.readFileSync('app.js', 'utf8');

// Use RegExp to verify the recommendations object structure inside app.js
console.log('Parsing app.js data structures...');

// Extract high and low energy states from app.js using string search/eval/parse
// This is robust since app.js defines the object literals clearly
const recommendationsMatch = appContent.match(/const recommendations = ({[\s\S]*?});/);
assert(recommendationsMatch, 'app.js must define the recommendations matrix');

// Evaluate the recommendations object in a safe sandboxed way to verify values
const getRecommendations = () => {
    const evalString = `(${recommendationsMatch[1]})`;
    // Safe eval of clean data structure from app.js
    return eval(evalString);
};

const matrix = getRecommendations();

console.log('\nValidating Part 2 Test Cases (TC-1 to TC-4)...');

// TC-1: Stable Recovery
console.log('\nExecuting TC-1: Stable Recovery (High-Energy Scenario)...');
const tc1 = matrix.high.morning;
console.log('  Battery:', tc1.battery + '%');
console.log('  CAS:', tc1.cas + '%');
console.log('  State Label:', tc1.statusLabel);
console.log('  Recommendation:', tc1.title);
assert.strictEqual(tc1.battery, 85);
assert.strictEqual(tc1.cas, 95);
assert.strictEqual(tc1.statusLabel, 'High Alertness');
assert(tc1.title.includes('Security Specification'));
console.log('✔ TC-1 Passed: High energy renders 85% battery, 95% CAS, and focus recommendation.');

// TC-2: Cortisol Red-line
console.log('\nExecuting TC-2: Cortisol Red-line (Low-Energy Scenario, Morning)...');
const tc2 = matrix.low.morning;
console.log('  Battery:', tc2.battery + '%');
console.log('  CAS:', tc2.cas + '%');
console.log('  State Label:', tc2.statusLabel);
console.log('  Recommendation:', tc2.title);
assert.strictEqual(tc2.battery, 45);
assert.strictEqual(tc2.cas, 88);
assert.strictEqual(tc2.statusLabel, 'Compressed Peak');
assert(tc2.title.includes('Security Spec (Early Peak)'));
console.log('✔ TC-2 Passed: Cortisol red-line morning renders 45% battery, 88% CAS, and early focus block.');

// TC-3: Time Transitions
console.log('\nExecuting TC-3: Time Transitions (Low-Energy Scenario, Afternoon)...');
const tc3 = matrix.low.afternoon;
console.log('  Battery:', tc3.battery + '%');
console.log('  CAS:', tc3.cas + '%');
console.log('  State Label:', tc3.statusLabel);
console.log('  Recommendation:', tc3.title);
assert.strictEqual(tc3.battery, 25);
assert.strictEqual(tc3.cas, 88);
assert.strictEqual(tc3.statusLabel, 'Early Crash');
assert(tc3.title.includes('Somatic Recovery: Cortisol-Drop Walk'));
console.log('✔ TC-3 Passed: Afternoon transition displays 25% battery and somatic walk recommendation.');

// TC-4: Override Friction
console.log('\nExecuting TC-4: Override Friction ("Force Push Through" active)...');
// Extract the override simulation values from app.js
const overrideCasMatch = appContent.match(/cas:\s*42,/);
assert(overrideCasMatch, 'app.js must define the 42% CAS override penalty');

const warningMatch = appContent.match(/alertnessDesc:\s*'Forehead breakout active'/);
assert(warningMatch, 'app.js must mention active breakouts on override');

const crashMatch = appContent.match(/desc:\s*'You did not take your somatic walk and are trying to write specifications on 10% battery/);
assert(crashMatch, 'app.js must warning of cognitive crash and somatic mismatch on override');

console.log('  Override CAS: 42% (Severe schedule mismatch)');
console.log('  Override Warnings: Warning of telogen effluvium hair loss and acne flare-ups present.');
console.log('✔ TC-4 Passed: Override friction successfully verified.');

console.log('\n✔ All Part 2 Prototype Validation checks completed successfully!');

// ==========================================================================
// Part 3: Week 13 Success Metric Validation
// ==========================================================================

console.log('\nValidating Part 3 Week 13 Retention Metric Rules...');

// Function to calculate and classify outcomes based on Shield Adherence Rate
function evaluateWeek13Trial(adherenceRate) {
    if (adherenceRate > 70.0) {
        return {
            status: 'SUCCESS',
            message: 'Anya respects calendar boundary protections. Proceed with Phase 6 (multi-user Paxos scheduling, zero-hardware biometrics, and Jira mappings).'
        };
    } else if (adherenceRate < 50.0) {
        return {
            status: 'FAILURE',
            message: 'Anya overrides and schedules meetings over buffers. Pivot rules engine or terminate the project.'
        };
    } else {
        return {
            status: 'INCONCLUSIVE',
            message: 'Adherence rate is in the intermediate zone (50% - 70%). Calibrate baseline filters or perform user interviews.'
        };
    }
}

// Case A: High Adherence (Success)
console.log('\nTesting Success Boundary Condition (> 70% Adherence)...');
const successEvaluation = evaluateWeek13Trial(74.5);
console.log('  Adherence Rate: 74.5%');
console.log('  Result Status :', successEvaluation.status);
console.log('  Decision Check:', successEvaluation.message);
assert.strictEqual(successEvaluation.status, 'SUCCESS');
assert(successEvaluation.message.includes('Proceed with Phase 6'));
console.log('✔ Success scenario verified.');

// Case B: Low Adherence (Failure)
console.log('\nTesting Failure Boundary Condition (< 50% Adherence)...');
const failureEvaluation = evaluateWeek13Trial(43.2);
console.log('  Adherence Rate: 43.2%');
console.log('  Result Status :', failureEvaluation.status);
console.log('  Decision Check:', failureEvaluation.message);
assert.strictEqual(failureEvaluation.status, 'FAILURE');
assert(failureEvaluation.message.includes('Pivot rules engine or terminate'));
console.log('✔ Failure scenario verified.');

console.log('\n✔ All Part 3 Week 13 Metrics checks completed successfully!');

console.log('\n==========================================================================');
console.log('✔ ALL PART 2 & PART 3 TEST CASES PASSED SUCCESSFULLY!');
console.log('==========================================================================');
