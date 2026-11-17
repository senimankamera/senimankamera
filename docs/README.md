# Documentation Map

This documentation suite is organized using the **Diataxis** documentation framework to systematically separate technical knowledge by purpose: **Standards & Policies**, **Architecture Decision Records (ADRs)**, **Reference**, and **How-To Guides**.

---

## 🗺️ Documentation Structure

```text
docs/
├── README.md                                          # Documentation index & Diataxis map (this file)
├── standards/
│   └── documentation.md                               # Repository documentation standard & Diataxis governance
├── adr/                                               # Architecture Decision Records (Numbered decisions)
│   ├── 001-clean-architecture-and-feature-driven.md   # Feature-Driven Clean Architecture & 1-File-1-Responsibility
│   ├── 002-ui-governance-and-component-hierarchy.md  # shadcn/ui, Tailwind CSS v4, and Server Component First
│   ├── 003-payment-gateway-and-webhook-security.md   # DOKU HMAC security, anti-tamper, and 2-step payment lifecycle
│   ├── 004-secret-isolation-and-environment-validation.md # Environment validation, zero raw process.env, and git safety
│   └── 005-team-git-workflow-and-deployment.md        # Branch naming, Conventional Commits, and Vercel CI gates
├── reference/                                         # Canonical specifications & contracts
│   ├── domain-glossary.md                             # Canonical domain terms & status lifecycle state machine
│   └── architecture-conventions.md                    # Target folder layout, layer contracts, and dependency rules
└── how-to/                                            # Practical operational runbooks & development guides
    ├── local-development.md                           # Environment setup, PostgreSQL, Prisma, and DOKU sandbox testing
    ├── adding-a-feature.md                            # End-to-end vertical feature slice implementation checklist
    └── issue-and-pr-workflow.md                       # Issue execution, branch creation, TDD, and Pull Request workflow
```

---

## 🧭 Diataxis Quadrants

| Quadrant | Purpose | Target Audience | Location |
| :--- | :--- | :--- | :--- |
| **Standards** | Architectural rules, compliance mandates, and repo policies | Developers, AI Agents, Reviewers | [`docs/standards/`](standards/documentation.md) |
| **Architecture Decision Records (ADRs)** | Formal records of technical choices, context, trade-offs, and consequences | Technical Leads, Architects, Contributors | [`docs/adr/`](adr/001-clean-architecture-and-feature-driven.md) |
| **Reference** | Technical descriptions, domain glossary, schema contracts, and conventions | Developers, AI Agents | [`docs/reference/`](reference/domain-glossary.md) |
| **How-To Guides** | Step-by-step practical guides to solve specific operational tasks | Developers, DevOps, Contributors | [`docs/how-to/`](how-to/local-development.md) |

---

## 📋 Standards & Policies

- [Documentation Standard](standards/documentation.md): Mandatory rules for authoring documentation, Diataxis placement, ADR template, and technical accuracy.

## 🏛️ Architecture Decision Records (ADRs)

- [ADR 001: Clean Architecture and Feature-Driven Structure](adr/001-clean-architecture-and-feature-driven.md): Mandating Feature-Driven structure (`src/modules/<feature>`), 1 File = 1 Responsibility, and strict unidirectional data flow.
- [ADR 002: UI Governance and Component Hierarchy](adr/002-ui-governance-and-component-hierarchy.md): Standardizing `shadcn/ui` components, Tailwind CSS v4 variables, Server Component First, and client component boundary isolation.
- [ADR 003: Payment Gateway and Webhook Security](adr/003-payment-gateway-and-webhook-security.md): Strict HMAC-SHA256 signature verification, anti-bypass webhook processing, and Two-Step Payment lifecycle (DP vs Balance).
- [ADR 004: Secret Isolation and Environment Validation](adr/004-secret-isolation-and-environment-validation.md): Encapsulating environment variables, banning raw `process.env` in business logic, and `.env.example` sanitization.
- [ADR 005: Team Git Workflow and Deployment](adr/005-team-git-workflow-and-deployment.md): Issue-driven branch naming (`<type>/issue-<number>-<feature-slug>`), Conventional Commits, and branch protection.

## 📖 Canonical Reference

- [Domain Glossary](reference/domain-glossary.md): Canonical photography studio domain terminology (Client, Booking, Packages, Add-ons, CalendarSlot, DP, Balance, Deliverables) and status state machine.
- [Architecture Conventions](reference/architecture-conventions.md): Detailed directory layout, repository layer contracts, Zod schema rules, and file size limits.

## 🛠️ How-To Guides

- [Local Development Guide](how-to/local-development.md): Step-by-step setup for Node, PostgreSQL, Prisma migrations/seeding, and DOKU webhook tunneling.
- [Adding a Feature](how-to/adding-a-feature.md): Vertical slice checklist from database schema and repository to use-case, server action, UI components, and tests.
- [Issue and PR Workflow](how-to/issue-and-pr-workflow.md): Team collaboration workflow, branch conventions, and PR checklist.

---

## 🎯 Master Backlog & Roadmap

For the active issue backlog and prioritized technical debt roadmap, refer to the [Master Issues Audit](../MASTER_ISSUES_AUDIT.md).
