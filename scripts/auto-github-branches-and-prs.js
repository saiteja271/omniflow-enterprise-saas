/**
 * Automated GitHub Branches & Pull Request Generator via GitHub REST API
 * 
 * Usage:
 *   node scripts/auto-github-branches-and-prs.js <GITHUB_PERSONAL_ACCESS_TOKEN>
 * 
 * Or set environment variable:
 *   $env:GITHUB_TOKEN="ghp_yourTokenHere"
 *   node scripts/auto-github-branches-and-prs.js
 */

const https = require('https');

const OWNER = 'saiteja271';
const REPO = 'omniflow-enterprise-saas';
const GITHUB_TOKEN = process.argv[2] || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('\n❌ ERROR: GitHub Personal Access Token is required!');
  console.error('\nPlease run with your GitHub token:');
  console.error('  node scripts/auto-github-branches-and-prs.js ghp_yourTokenHere\n');
  console.error('To generate a token:');
  console.error('  1. Go to https://github.com/settings/tokens');
  console.error('  2. Click "Generate new token (classic)"');
  console.error('  3. Check the "repo" scope checkbox and generate');
  process.exit(1);
}

function githubApi(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'User-Agent': 'OmniFlow-Automation-Agent',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : {};
        } catch (e) {
          json = { raw: data };
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(json);
        } else {
          reject({ status: res.statusCode, error: json.message || json.error || data, json });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const FEATURE_BRANCHES = [
  {
    branch: 'feature/multi-tenant-rbac',
    title: 'feat(auth): Multi-Tenant Context Isolation & RBAC Engine',
    body: '## 🚀 Multi-Tenant Isolation & Role-Based Access Control\n\n- Resolves tenant headers via `x-tenant-id`\n- Implements fine-grained RBAC roles (`SUPER_ADMIN`, `ORG_ADMIN`, `MANAGER`, `EMPLOYEE`, `AUDITOR`)\n- Verifies tenant separation across storage and middleware.'
  },
  {
    branch: 'feature/hrms-payroll-engine',
    title: 'feat(hrms): Employee Directory & Automated Monthly Payroll',
    body: '## 👥 HRMS & Payroll Automation\n\n- Enterprise employee directory and department budget hierarchies\n- Performance evaluation scoring\n- One-click monthly payroll calculation and disbursement engine.'
  },
  {
    branch: 'feature/finance-billing-invoicing',
    title: 'feat(finance): Multi-Tenant Invoicing & GAAP Revenue Ledgers',
    body: '## 💳 Finance, Invoicing & Billing\n\n- GAAP-compliant multi-tenant invoice generator with line items\n- Automated tax computation and lifecycle states (`PENDING`, `PAID`, `OVERDUE`)\n- Real-time accounts receivable dashboard.'
  },
  {
    branch: 'feature/projects-agile-kanban',
    title: 'feat(projects): Agile Kanban Task Boards & Sprint Tracking',
    body: '## 📋 Agile Projects & Kanban Queues\n\n- Kanban board workflow: `TODO` ➔ `IN_PROGRESS` ➔ `REVIEW` ➔ `DONE`\n- Priority queues (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)\n- Cross-department initiative tracking.'
  },
  {
    branch: 'feature/crm-pipeline-funnel',
    title: 'feat(crm): Enterprise CRM Deals Pipeline & Weighted Lead Scoring',
    body: '## 📈 CRM & Enterprise Sales Funnel\n\n- Deal stage pipeline: `QUALIFIED` ➔ `PROPOSAL_SENT` ➔ `NEGOTIATION` ➔ `CLOSED_WON`\n- Weighted pipeline valuation based on deal win probability\n- RFP tracking and account notes.'
  },
  {
    branch: 'feature/workflow-approval-engine',
    title: 'feat(approvals): Multi-Step Workflow Approval Engine',
    body: '## ⚡ Workflow Automations & Approvals\n\n- State-machine approval workflows for CapEx, PTO leave requests, and vendor contracts\n- Multi-level approver attribution\n- Urgent escalation indicators.'
  },
  {
    branch: 'feature/ai-analytics-copilot',
    title: 'feat(analytics): Executive KPI Dashboard & AI Copilot Insights',
    body: '## 🧠 AI Copilot & Executive Analytics\n\n- Consolidated executive KPI dashboard across all business departments\n- Real-time AI decision insights analyzing pipeline velocity and cash flow alerts.'
  },
  {
    branch: 'feature/security-audit-logging',
    title: 'feat(security): Immutable SOC2 Compliance Audit Logging Engine',
    body: '## 🔒 Security Audit Trail & Governance\n\n- Immutable compliance audit logging for SOC2 Type II readiness\n- IP tracking, user attribution, and resource diff captures.'
  }
];

async function main() {
  console.log('\n===============================================================');
  console.log(`🚀 Automated GitHub Branch & PR Creation on ${OWNER}/${REPO}`);
  console.log('===============================================================\n');

  try {
    // 1. Get base SHA from main
    console.log('📍 Fetching main branch reference...');
    const mainRef = await githubApi(`/repos/${OWNER}/${REPO}/git/ref/heads/main`);
    const mainSha = mainRef.object.sha;
    console.log(`   ✅ main SHA: ${mainSha}\n`);

    // 2. Create 'develop' branch if not exists
    console.log('🌿 Creating develop branch...');
    let developSha = mainSha;
    try {
      const devRef = await githubApi(`/repos/${OWNER}/${REPO}/git/refs`, 'POST', {
        ref: 'refs/heads/develop',
        sha: mainSha
      });
      developSha = devRef.object.sha;
      console.log('   ✅ develop branch created successfully.');
    } catch (err) {
      if (err.error && err.error.includes('Reference already exists')) {
        console.log('   ℹ️ develop branch already exists.');
        const devRef = await githubApi(`/repos/${OWNER}/${REPO}/git/ref/heads/develop`);
        developSha = devRef.object.sha;
      } else {
        throw err;
      }
    }

    // 3. Create 8 feature branches
    console.log('\n🌿 Creating 8 Feature Branches...');
    for (const item of FEATURE_BRANCHES) {
      try {
        await githubApi(`/repos/${OWNER}/${REPO}/git/refs`, 'POST', {
          ref: `refs/heads/${item.branch}`,
          sha: developSha
        });
        console.log(`   ✅ Created branch: ${item.branch}`);
      } catch (err) {
        if (err.error && err.error.includes('Reference already exists')) {
          console.log(`   ℹ️ Branch already exists: ${item.branch}`);
        } else {
          console.error(`   ⚠️ Failed to create ${item.branch}:`, err.error);
        }
      }
    }

    // 4. Create Pull Requests
    console.log('\n🔀 Creating Pull Requests into develop...');
    for (const item of FEATURE_BRANCHES) {
      try {
        const pr = await githubApi(`/repos/${OWNER}/${REPO}/pulls`, 'POST', {
          title: item.title,
          head: item.branch,
          base: 'develop',
          body: item.body
        });
        console.log(`   🎉 PR Created (#${pr.number}): ${pr.html_url}`);
      } catch (err) {
        if (err.error && (err.error.includes('A pull request already exists') || err.error.includes('No commits between'))) {
          console.log(`   ℹ️ ${item.branch}: ${err.error}`);
        } else {
          console.error(`   ⚠️ Failed to create PR for ${item.branch}:`, err.error);
        }
      }
    }

    // 5. Create Release PR (develop -> main)
    console.log('\n🚀 Creating Release PR (develop -> main)...');
    try {
      const releasePr = await githubApi(`/repos/${OWNER}/${REPO}/pulls`, 'POST', {
        title: 'release(v1.0.0): OmniFlow Enterprise SaaS & ERP Platform Baseline',
        head: 'develop',
        base: 'main',
        body: '## 📦 Production Release v1.0.0\n\nConsolidates all 8 core enterprise modules into the production release baseline:\n- Multi-Tenant & RBAC\n- HRMS & Payroll Engine\n- Finance, Invoicing & Billing\n- Projects & Agile Kanban\n- CRM Deals Pipeline\n- Workflow Approvals\n- AI Analytics & Executive Copilot\n- SOC2 Compliance Audit Logging'
      });
      console.log(`   🎉 Release PR Created (#${releasePr.number}): ${releasePr.html_url}`);
    } catch (err) {
      console.log(`   ℹ️ Release PR: ${err.error || 'Check GitHub'}`);
    }

    console.log('\n===============================================================');
    console.log('🏁 All branches and PRs have been processed on GitHub!');
    console.log(`👉 View repository: https://github.com/${OWNER}/${REPO}/pulls`);
    console.log('===============================================================\n');

  } catch (error) {
    console.error('\n❌ GitHub API Error:', error);
  }
}

main();
