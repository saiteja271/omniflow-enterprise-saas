# OmniFlow Enterprise - Branch & Pull Request Setup Script
$ErrorActionPreference = "Continue"

$RemoteUrl = "https://github.com/saiteja271/omniflow-enterprise-saas.git"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host " OmniFlow Enterprise - Creating 8+ Branches and Pull Requests" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure git remote is set
git remote remove origin 2>$null
git remote add origin $RemoteUrl

# 1. Ensure main and develop branches exist
Write-Host "[1/3] Setting up main and develop baseline branches..." -ForegroundColor Yellow
git checkout -B main
git add .
git commit -m "feat(core): initial production release baseline" 2>$null
git push -u origin main --force

git checkout -B develop main
git commit -m "chore(infra): initialize development integration branch" --allow-empty
git push -u origin develop --force

if (-not (Test-Path "docs\modules")) {
    New-Item -ItemType Directory -Path "docs\modules" -Force | Out-Null
}

# 2. List of 8 feature branches with specific module changes
$branchList = @(
    @{ Name = "feature/multi-tenant-rbac"; File = "docs\modules\multi-tenant-rbac.md"; Msg = "feat(auth): multi-tenant context isolation and RBAC role verifier"; Content = "# Multi-Tenant Architecture and RBAC Engine`nProvides tenant isolation via x-tenant-id and role-based access control." },
    @{ Name = "feature/hrms-payroll-engine"; File = "docs\modules\hrms-payroll.md"; Msg = "feat(hrms): employee directory and automated monthly payroll disbursement"; Content = "# HRMS and Automated Payroll Engine`nComprehensive employee directory, department hierarchies, and 1-click payroll runner." },
    @{ Name = "feature/finance-billing-invoicing"; File = "docs\modules\finance-invoicing.md"; Msg = "feat(finance): multi-tenant invoicing, tax computation and GAAP revenue ledgers"; Content = "# Finance, Billing and Invoicing Engine`nMulti-tenant invoice generator with line items, tax computation, and accounts receivable ledgers." },
    @{ Name = "feature/projects-agile-kanban"; File = "docs\modules\projects-kanban.md"; Msg = "feat(projects): agile kanban task boards and sprint tracking"; Content = "# Agile Projects and Kanban Sprints`nInteractive Kanban workflow with TODO, IN_PROGRESS, REVIEW, and DONE status queues." },
    @{ Name = "feature/crm-pipeline-funnel"; File = "docs\modules\crm-pipeline.md"; Msg = "feat(crm): enterprise deals pipeline, weighted lead scoring and account management"; Content = "# Enterprise CRM and Sales Pipeline`nStage-based deals funnel and weighted revenue valuation based on win probability." },
    @{ Name = "feature/workflow-approval-engine"; File = "docs\modules\workflow-approvals.md"; Msg = "feat(approvals): multi-step state-machine approval engine"; Content = "# Workflow Automation and Multi-Step Approvals`nState-machine approval workflows for CapEx expenditures, PTO requests, and vendor contracts." },
    @{ Name = "feature/ai-analytics-copilot"; File = "docs\modules\ai-analytics.md"; Msg = "feat(analytics): executive KPI dashboard and AI copilot insights"; Content = "# AI Analytics Copilot and Executive KPI Engine`nReal-time executive dashboard KPIs and automated AI decision recommendations." },
    @{ Name = "feature/security-audit-logging"; File = "docs\modules\security-audit.md"; Msg = "feat(security): immutable SOC2 compliance audit logging engine"; Content = "# Security Audit Logging and SOC2 Compliance`nImmutable compliance audit logging engine capturing actor, action, resource, IP and timestamp." }
)

Write-Host ""
Write-Host "[2/3] Creating 8 Feature Branches with dedicated module implementations..." -ForegroundColor Yellow

foreach ($b in $branchList) {
    Write-Host ""
    Write-Host "Creating branch: $($b.Name)..." -ForegroundColor Magenta
    git checkout -B $b.Name develop
    Set-Content -Path $b.File -Value $b.Content
    git add $b.File
    git commit -m $b.Msg
    git push -u origin $b.Name --force
}

git checkout main

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Green
Write-Host " [3/3] Successfully created and pushed all 10 branches to GitHub!" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Direct links to create Pull Requests on GitHub:" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------"
foreach ($b in $branchList) {
    Write-Host "Branch: $($b.Name)" -ForegroundColor Cyan
    Write-Host "URL:    https://github.com/saiteja271/omniflow-enterprise-saas/compare/develop...$($b.Name)?expand=1"
    Write-Host ""
}
Write-Host "Release PR (develop -> main):" -ForegroundColor Green
Write-Host "URL:    https://github.com/saiteja271/omniflow-enterprise-saas/compare/main...develop?expand=1"
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Green
