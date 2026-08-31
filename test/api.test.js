/**
 * Automated Verification & Health Test Suite for OmniFlow Enterprise
 */

const http = require('http');
const server = require('../server/server');

const TEST_PORT = 3001;

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n=========================================');
  console.log('🧪 Starting OmniFlow Enterprise Test Suite');
  console.log('=========================================\n');

  // Start test instance
  const testServer = http.createServer(server.listeners('request')[0]);
  await new Promise(r => testServer.listen(TEST_PORT, r));

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
      failed++;
    }
  }

  try {
    await test('System Health Endpoint (/api/health)', async () => {
      const res = await makeRequest('/api/health');
      if (res.status !== 200 || res.data.status !== 'UP') throw new Error('Health check failed');
    });

    await test('Executive Dashboard Analytics (/api/analytics/dashboard)', async () => {
      const res = await makeRequest('/api/analytics/dashboard');
      if (res.status !== 200 || !res.data.kpis || !res.data.aiInsights) throw new Error('Invalid dashboard schema');
    });

    await test('HRMS Employee Directory (/api/hrms/employees)', async () => {
      const res = await makeRequest('/api/hrms/employees');
      if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) throw new Error('Employees list failed');
    });

    await test('HRMS Payroll Execution (/api/hrms/payroll/run)', async () => {
      const res = await makeRequest('/api/hrms/payroll/run', 'POST');
      if (res.status !== 200 || res.data.status !== 'DISBURSED') throw new Error('Payroll disbursement failed');
    });

    await test('Finance Invoices & Accounts Receivable (/api/finance/invoices)', async () => {
      const res = await makeRequest('/api/finance/invoices');
      if (res.status !== 200 || !Array.isArray(res.data)) throw new Error('Invoices retrieval failed');
    });

    await test('Project Management & Kanban Tasks (/api/tasks)', async () => {
      const res = await makeRequest('/api/tasks');
      if (res.status !== 200 || !Array.isArray(res.data)) throw new Error('Tasks retrieval failed');
    });

    await test('Workflow Approval State Machine (/api/approvals)', async () => {
      const res = await makeRequest('/api/approvals');
      if (res.status !== 200 || !Array.isArray(res.data)) throw new Error('Approvals retrieval failed');
    });

    await test('Enterprise Security Audit Logs (/api/audit-logs)', async () => {
      const res = await makeRequest('/api/audit-logs');
      if (res.status !== 200 || !Array.isArray(res.data)) throw new Error('Audit logs retrieval failed');
    });

    console.log('\n=========================================');
    console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('=========================================\n');
  } finally {
    testServer.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

if (require.main === module) {
  runTests();
}
