# Issue and Pull Request Workflow

This guide establishes the collaboration and contribution workflow for Seniman Kamera.

---

## 🧭 Workflow Principles

1. **Issue-Driven Development:** Every commit and pull request must correspond to an active GitHub Issue from the backlog (see [Master Issues Audit](../../MASTER_ISSUES_AUDIT.md)).
2. **Dedicated Branch Isolation:** Never commit directly to `main`. Every unit of work must reside on an isolated branch.
3. **Linear Git History:** All Pull Requests are merged using **Squash and Merge** to maintain a clean, atomic commit timeline on `main`.

---

## 🛠️ Step-by-Step Lifecycle

### Step 1: Pick an Issue & Review Acceptance Criteria
Locate your assigned issue number and read the technical requirements in the issue description or [Master Issues Audit](../../MASTER_ISSUES_AUDIT.md).

### Step 2: Sync with Latest Main & Create Branch
```bash
# 1. Fetch latest changes from remote
git checkout main
git pull origin main

# 2. Create isolated feature branch
git checkout -b <type>/issue-<number>-<feature-slug>
```

**Branch Naming Format:**
- `fix/issue-12-middleware-proxy`
- `fix/issue-13-doku-signature-bypass`
- `refactor/issue-15-src-structure`
- `feat/issue-18-client-email-notification`
- `feat/issue-19-balance-payment`

### Step 3: Implement Following Clean Architecture
- Follow the sequence: Schema -> Repository -> Use-Case -> Action -> Component.
- Observe file size limits and single responsibility rules.
- Write unit tests for business logic edge cases.

### Step 4: Run Local Verification Checks
All checks must pass with zero errors before pushing:
```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Next.js Production Build
npm run build
```

### Step 5: Stage and Commit (Conventional Commits)
Write commit messages in English using the Conventional Commits format:
```bash
git add .
git commit -m "<type>(<scope>): <short imperative description>"
```
*Examples:*
- `fix(security): resolve Next.js middleware inactivity due to proxy.ts`
- `feat(payment): implement online balance payment on order tracking page`
- `docs(devops): guard seed.ts against production execution and document .env.example`

### Step 6: Push Branch & Open Pull Request
Push your branch to GitHub and create the PR:
```bash
# 1. Push branch to remote
git push -u origin <type>/issue-<number>-<feature-slug>

# 2. Create PR with GitHub CLI
gh pr create \
  --title "<type>(<scope>): <title>" \
  --body "Closes #<number>

## Summary of Changes
- Detailed bullet points of modifications made.
- Architectural verification confirmed." \
  --base main
```

### Step 7: Review, CI Gates & Squash Merge
1. Wait for automated CI status checks to pass on GitHub.
2. Request a review from the repository owner.
3. Once approved, merge using **Squash and Merge**.
