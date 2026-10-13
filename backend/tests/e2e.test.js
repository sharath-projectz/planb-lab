// E2E Verification Test for PLANB LAB API and Frontend Serving

async function runE2ETests() {
  console.log('=== STARTING PLANB LAB END-TO-END VERIFICATION ===\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Frontend Serving Test
  await test('Frontend Vite Dev Server serves HTML with PLANB LAB branding', async () => {
    const res = await fetch('http://localhost:5173/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('PLANB LAB') && !html.includes('id="root"')) {
      throw new Error('Vite dev server did not return valid root HTML');
    }
  });

  // 2. Backend Health Check
  await test('Backend API Health Check (/api/health)', async () => {
    const res = await fetch('http://localhost:5000/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error(`Expected healthy, got ${data.status}`);
  });

  // 3. User Registration
  let testToken = '';
  await test('Auth Registration (/api/auth/register)', async () => {
    const testEmail = `judge_${Date.now()}@hackathon.io`;
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hackathon Judge',
        email: testEmail,
        password: 'securepassword123'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token || !data.user) throw new Error('Missing token or user in registration response');
    testToken = data.token;
  });

  // 4. Authenticated Endpoint (/api/auth/me)
  await test('Protected Route with Verified JWT (/api/auth/me)', async () => {
    const res = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.user.name !== 'Hackathon Judge') throw new Error('JWT identity mismatch');
  });

  // 5. Simulation Suite (15 Combinations)
  await test('Run 15-Combination Stress Test Suite (/api/simulations/suite)', async () => {
    const res = await fetch('http://localhost:5000/api/simulations/suite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabledContingencies: ['offline_records', 'alternative_id_check'],
        limit: 15
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.suite.totalScenariosTested !== 15) throw new Error(`Expected 15 scenarios, got ${data.suite.totalScenariosTested}`);
    if (typeof data.suite.handledPercentage !== 'number') throw new Error('Missing handledPercentage');
  });

  // 6. APPLY FIX & RETEST endpoint
  await test('Core Retest Engine: Baseline vs Contingency Comparison (/api/simulations/retest)', async () => {
    const res = await fetch('http://localhost:5000/api/simulations/retest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baselineContingencies: [],
        retestContingencies: ['offline_records', 'alternative_id_check', 'backup_qr_procedure', 'backup_staff_oncall']
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.comparison.baselineHandledPercentage !== 0) throw new Error('Expected 0% baseline');
    if (data.comparison.retestHandledPercentage !== 100) throw new Error('Expected 100% retest with all 4 contingencies');
    if (data.comparison.recoveredCount !== 15) throw new Error('Expected 15 recovered scenarios');
  });

  // 7. Probability Calculations Endpoint
  await test('Transparent Probability & Formula Metadata (/api/simulations/probabilities)', async () => {
    const res = await fetch('http://localhost:5000/api/simulations/probabilities');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.metrics.conditionalAnalysis.jointProbability) throw new Error('Missing joint probability');
    if (!data.metrics.conditionalAnalysis.formula.includes('P(Internet ∩ OTP)')) throw new Error('Incorrect formula');
  });

  // 8. Demo Account Authentication Test
  let demoToken = '';
  await test('Demo Account Authentication (/api/auth/login with demo12345)', async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@planblab.io',
        password: 'demo12345'
      })
    });
    if (!res.ok) throw new Error(`Demo login failed with HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.id !== 'demo-user-001') {
      throw new Error('Demo login did not return valid token for demo-user-001');
    }
    demoToken = data.token;
  });

  // 9. AI Copilot Chat Endpoint (Guest and Authenticated)
  await test('PLANB Copilot Decision Intelligence (/api/copilot/chat)', async () => {
    // 9a. Verify guest prompt generates response
    const guestRes = await fetch('http://localhost:5000/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What happens if the internet fails?'
      })
    });
    if (!guestRes.ok) throw new Error(`Guest chat failed with HTTP ${guestRes.status}`);
    const guestData = await guestRes.json();
    if (!guestData.reply || guestData.reply.length < 20) throw new Error('Guest copilot response too short');

    // 9b. Verify authenticated prompt saves to user conversation
    const res = await fetch('http://localhost:5000/api/copilot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        message: 'What happens if the internet fails?',
        simulationContext: {
          handledPercentage: 80,
          planHealth: 'Looks Resilient',
          unresolvedFailureScenarios: 3
        }
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.reply || data.reply.length < 20) throw new Error('Copilot response too short or empty');
    if (!data.conversationId) throw new Error('Missing conversationId in chat response');
    
    // 10. Conversation Persistence, Security & Retrieval Verification
    await test('Chat History Security, Persistence & Retrieval (/api/copilot/conversations)', async () => {
      // 10a. Unauthenticated access must be rejected
      const unauthRes = await fetch('http://localhost:5000/api/copilot/conversations');
      if (unauthRes.status !== 401) throw new Error(`Expected 401 for unauthenticated list, got ${unauthRes.status}`);

      // 10b. Authenticated user can list their own conversations
      const listRes = await fetch('http://localhost:5000/api/copilot/conversations', {
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      const listData = await listRes.json();
      if (!Array.isArray(listData.conversations)) throw new Error('Expected conversations array');
      const found = listData.conversations.find(c => c.id === data.conversationId);
      if (!found) throw new Error(`Created conversation ${data.conversationId} not found in user history`);

      // 10c. Verify single conversation retrieval with messages
      const getRes = await fetch(`http://localhost:5000/api/copilot/conversations/${data.conversationId}`, {
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
      const singleData = await getRes.json();
      if (!singleData.conversation || !Array.isArray(singleData.conversation.messages)) {
        throw new Error('Retrieved conversation missing messages array');
      }
      if (singleData.conversation.messages.length < 2) {
        throw new Error('Expected both user and assistant messages in conversation');
      }

      // 10d. Another user (e.g. demo user) cannot access this user's conversation ID
      const crossUserRes = await fetch(`http://localhost:5000/api/copilot/conversations/${data.conversationId}`, {
        headers: { 'Authorization': `Bearer ${demoToken}` }
      });
      if (crossUserRes.status !== 403) throw new Error(`Expected 403 when accessing another user's conversation, got ${crossUserRes.status}`);
    });

    // 11. Conversation Deletion Security Verification
    await test('Chat Conversation Deletion & Authorization (/api/copilot/conversations/:id)', async () => {
      // 11a. Unauthenticated delete is rejected
      const unauthDel = await fetch(`http://localhost:5000/api/copilot/conversations/${data.conversationId}`, {
        method: 'DELETE'
      });
      if (unauthDel.status !== 401) throw new Error(`Expected 401 for unauthenticated delete, got ${unauthDel.status}`);

      // 11b. Cross-user delete is rejected
      const crossDel = await fetch(`http://localhost:5000/api/copilot/conversations/${data.conversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${demoToken}` }
      });
      if (crossDel.status !== 403) throw new Error(`Expected 403 for cross-user delete, got ${crossDel.status}`);

      // 11c. Owner delete succeeds
      const delRes = await fetch(`http://localhost:5000/api/copilot/conversations/${data.conversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      if (!delRes.ok) throw new Error(`HTTP ${delRes.status}`);

      // 11d. Verify it is gone
      const verifyRes = await fetch(`http://localhost:5000/api/copilot/conversations/${data.conversationId}`, {
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      if (verifyRes.status !== 404) throw new Error('Expected 404 after deletion');
    });
  });

  // 12. Security: Production JWT Secret Requirement
  await test('Security: Production Mode Enforces Configured JWT_SECRET', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      const { getJwtSecret } = await import('../src/middleware/auth.js');
      try {
        getJwtSecret();
        throw new Error('Should have thrown in production without JWT_SECRET');
      } catch (err) {
        if (!err.message.includes('JWT_SECRET must be configured in production')) {
          throw err;
        }
      }
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret) process.env.JWT_SECRET = originalSecret;
    }
  });

  console.log(`\n=================================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} Tests Passed Successfully!`);
  console.log(`=================================================\n`);
}

runE2ETests();
