# ADR 005: Team Git Workflow and Deployment

## Status

Accepted

## Context

Seniman Kamera relies on multiple collaborators and AI coding agents working concurrently across various features (booking flow, payment gateway, gallery CMS, and calendar scheduling). Direct commits to `main` or chaotic branch naming lead to merge conflicts, untracked regressions, and broken production deployments on Vercel.

To ensure stability, code quality, and a clean linear git history, we require a standardized team workflow and deployment gate policy.

## Decision

We establish strict Git and deployment standards:

### 1. Dedicated Feature Branch Isolation
- Direct commits and pushes to `main` are **strictly prohibited**.
- Every unit of work must correspond to an assigned issue and be executed on an isolated branch created from latest `main`.
- **Branch Naming Standard:**
  ```text
  <type>/issue-<number>-<feature-slug>
  ```
  Permitted types:
  - `feat/`: New feature or business capability
  - `fix/`: Bug fix or security vulnerability patch
  - `refactor/`: Architectural re-organization without altering user-facing behavior
  - `docs/`: Documentation, environment templates, or runbooks
  - `test/`: Automated test suites and testing fixtures

  *Examples:*
  - `fix/issue-12-middleware-proxy`
  - `fix/issue-13-doku-signature-bypass`
  - `refactor/issue-15-src-structure`
  - `feat/issue-19-balance-payment`

### 2. Conventional Commits Standard
All git commit messages must adhere to the Conventional Commits format in English:
```text
<type>(<scope>): <short imperative description>
```
*Examples:*
- `fix(security): resolve Next.js middleware inactivity due to proxy.ts`
- `feat(payment): implement online balance payment on order tracking page`
- `refactor(database): encapsulate direct Prisma queries into booking repository`

### 3. Pull Request & Linear Merge Strategy
- All code changes must enter `main` exclusively through GitHub Pull Requests.
- PR titles must follow Conventional Commits and reference the closed issue in the body (`Closes #<number>`).
- Merging to `main` is restricted to **Squash and Merge** only. Merge commits and rebase merges are disabled to preserve a clean, atomic linear commit history on `main`.

### 4. CI Quality Gates
Before any PR can be merged to `main`, all automated quality checks must pass:
1. `npm run lint` (ESLint checks)
2. `npx tsc --noEmit` (TypeScript type checking)
3. `npm run build` (Next.js production build verification)
4. Automated unit tests (Vitest)

### 5. Vercel Deployment Lifecycle
- Feature branches generate preview deployments for testing and review.
- Production deployment is triggered automatically and exclusively when a PR is squash-merged into `main`.

## Consequences

### Positive
- **Rock-Solid Main Branch:** Production is always in a deployable, verified state.
- **Traceability:** Every commit on `main` is linked to an exact GitHub issue and Pull Request.
- **Conflict Prevention:** Isolated branches prevent concurrent agent/developer work from stomping over shared code.

### Constraints & Trade-offs
- Developers and AI agents cannot push quick hotfixes directly to `main`; all changes must flow through branch creation, check verification, and PR.
