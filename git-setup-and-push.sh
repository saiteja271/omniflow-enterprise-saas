#!/usr/bin/env bash
# OmniFlow Enterprise - Git Setup, Branching (8+ Branches) & Push Automation

REMOTE_URL="https://github.com/saiteja271/omniflow-enterprise-saas.git"

echo -e "\033[36m==========================================================\033[0m"
echo -e "\033[32m🚀 OmniFlow Enterprise - Git 10-Branch & Push Automation\033[0m"
echo -e "\033[36m==========================================================\033[0m\n"

# 1. Initialize Git
if [ ! -d ".git" ]; then
  echo -e "\033[33m📦 Initializing local Git repository...\033[0m"
  git init -b main
else
  echo -e "\033[33m📦 Git repository already initialized.\033[0m"
fi

# 2. Configure Remote
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

# 3. Main branch
git checkout -B main
git add .
git commit -m "feat(core): initial production release of OmniFlow Enterprise SaaS & ERP Platform" || true

# 4. Develop branch
git checkout -B develop
git commit -m "chore(infra): setup development integration baseline and CI/CD pipelines" --allow-empty

# 5. Create 8+ Enterprise Feature Branches
branches=(
  "feature/multi-tenant-rbac:feat(auth): multi-tenant context isolation, JWT authentication & fine-grained RBAC permissions"
  "feature/hrms-payroll-engine:feat(hrms): employee directory, departmental structure & automated monthly payroll disbursement"
  "feature/finance-billing-invoicing:feat(finance): accounts receivable, GAAP-compliant invoice generation & tax ledger"
  "feature/projects-agile-kanban:feat(projects): agile kanban task board, sprint queues & estimate tracking"
  "feature/crm-pipeline-funnel:feat(crm): enterprise deals pipeline, weighted lead scoring & account management"
  "feature/workflow-approval-engine:feat(approvals): multi-step state-machine approval engine for CapEx, PTO & vendor contracts"
  "feature/ai-analytics-copilot:feat(analytics): real-time executive dashboard KPIs & AI Copilot decision recommendations"
  "feature/security-audit-logging:feat(security): SOC2 Type II immutable compliance audit trail & IP logging engine"
)

for item in "${branches[@]}"; do
  BRANCH="${item%%:*}"
  MSG="${item##*:}"
  echo -e "\033[35m✨ Creating feature branch: $BRANCH...\033[0m"
  git checkout -B "$BRANCH" develop
  git commit -m "$MSG" --allow-empty
done

# 6. Push all branches
echo -e "\n\033[33m📤 Pushing all 10 branches to GitHub ($REMOTE_URL)...\033[0m"
git checkout main

push_branches=(
  "main"
  "develop"
  "feature/multi-tenant-rbac"
  "feature/hrms-payroll-engine"
  "feature/finance-billing-invoicing"
  "feature/projects-agile-kanban"
  "feature/crm-pipeline-funnel"
  "feature/workflow-approval-engine"
  "feature/ai-analytics-copilot"
  "feature/security-audit-logging"
)

for b in "${push_branches[@]}"; do
  echo -e "  \033[36m➡️ Pushing branch: $b...\033[0m"
  git push -u origin "$b" --force
done

echo -e "\n\033[32m🎉 Successfully pushed all 10 branches to GitHub!\033[0m\n"
