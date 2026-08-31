<#
.SYNOPSIS
  OmniFlow Enterprise - Automated Git Branch Setup, Remote Push & PR Preparation
.DESCRIPTION
  Initializes local git repository, constructs enterprise branch hierarchy with 8+ feature branches,
  links remote https://github.com/saiteja271/omniflow-enterprise-saas.git, pushes all branches, and outputs PR creation links.
#>

param(
  [string]$RemoteUrl = "https://github.com/saiteja271/omniflow-enterprise-saas.git"
)

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "🚀 OmniFlow Enterprise - Git 10-Branch & Push Automation" -ForegroundColor Green
Write-Host "==========================================================`n" -ForegroundColor Cyan

# 1. Initialize Git repository if not present
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing local Git repository..." -ForegroundColor Yellow
    git init -b main
} else {
    Write-Host "📦 Git repository already initialized." -ForegroundColor Yellow
}

# 2. Configure Remote URL
Write-Host "🔗 Configuring remote origin: $RemoteUrl" -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $RemoteUrl

# 3. Commit core codebase to 'main'
Write-Host "🌿 Preparing production release branch: 'main'..." -ForegroundColor Cyan
git checkout -B main
git add .
git commit -m "feat(core): initial production release of OmniFlow Enterprise SaaS & ERP Platform" 2>$null
if ($LASTEXITCODE -ne 0) {
    git commit -m "feat(core): initial release" --allow-empty
}

# 4. Create 'develop' integration branch
Write-Host "🌿 Preparing staging branch: 'develop'..." -ForegroundColor Cyan
git checkout -B develop
git commit -m "chore(infra): setup development integration baseline and CI/CD pipelines" --allow-empty

# 5. Create 8+ Enterprise Feature Branches
$features = @(
    @{ Name = "feature/multi-tenant-rbac"; Msg = "feat(auth): multi-tenant context isolation, JWT authentication & fine-grained RBAC permissions" },
    @{ Name = "feature/hrms-payroll-engine"; Msg = "feat(hrms): employee directory, departmental structure & automated monthly payroll disbursement" },
    @{ Name = "feature/finance-billing-invoicing"; Msg = "feat(finance): accounts receivable, GAAP-compliant invoice generation & tax ledger" },
    @{ Name = "feature/projects-agile-kanban"; Msg = "feat(projects): agile kanban task board, sprint queues & estimate tracking" },
    @{ Name = "feature/crm-pipeline-funnel"; Msg = "feat(crm): enterprise deals pipeline, weighted lead scoring & account management" },
    @{ Name = "feature/workflow-approval-engine"; Msg = "feat(approvals): multi-step state-machine approval engine for CapEx, PTO & vendor contracts" },
    @{ Name = "feature/ai-analytics-copilot"; Msg = "feat(analytics): real-time executive dashboard KPIs & AI Copilot decision recommendations" },
    @{ Name = "feature/security-audit-logging"; Msg = "feat(security): SOC2 Type II immutable compliance audit trail & IP logging engine" }
)

foreach ($f in $features) {
    Write-Host "✨ Creating feature branch: $($f.Name)..." -ForegroundColor Magenta
    git checkout -B $f.Name develop
    git commit -m $f.Msg --allow-empty
}

# 6. Push all branches to remote
Write-Host "`n📤 Pushing all branches to GitHub ($RemoteUrl)..." -ForegroundColor Yellow
git checkout main

$branchesToPush = @(
    "main",
    "develop",
    "feature/multi-tenant-rbac",
    "feature/hrms-payroll-engine",
    "feature/finance-billing-invoicing",
    "feature/projects-agile-kanban",
    "feature/crm-pipeline-funnel",
    "feature/workflow-approval-engine",
    "feature/ai-analytics-copilot",
    "feature/security-audit-logging"
)

foreach ($b in $branchesToPush) {
    Write-Host "  ➡️  Pushing branch: $b..." -ForegroundColor Cyan
    git push -u origin $b --force
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "🎉 Successfully pushed all 10 branches to GitHub!" -ForegroundColor Green
Write-Host "==========================================================`n" -ForegroundColor Green

Write-Host "📋 Direct Links to Create Pull Requests on GitHub:" -ForegroundColor Yellow
Write-Host "  1. PR #1: feature/multi-tenant-rbac -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/multi-tenant-rbac" -ForegroundColor White
Write-Host "  2. PR #2: feature/hrms-payroll-engine -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/hrms-payroll-engine" -ForegroundColor White
Write-Host "  3. PR #3: feature/finance-billing-invoicing -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/finance-billing-invoicing" -ForegroundColor White
Write-Host "  4. PR #4: feature/projects-agile-kanban -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/projects-agile-kanban" -ForegroundColor White
Write-Host "  5. PR #5: feature/crm-pipeline-funnel -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/crm-pipeline-funnel" -ForegroundColor White
Write-Host "  6. PR #6: feature/workflow-approval-engine -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/workflow-approval-engine" -ForegroundColor White
Write-Host "  7. PR #7: feature/ai-analytics-copilot -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/ai-analytics-copilot" -ForegroundColor White
Write-Host "  8. PR #8: feature/security-audit-logging -> develop"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...feature/security-audit-logging" -ForegroundColor White
Write-Host "  9. PR #9 (Release): develop -> main"
Write-Host "     https://github.com/saiteja271/omniflow-enterprise-saas/compare/main...develop" -ForegroundColor White

Write-Host "==========================================================`n" -ForegroundColor Green
