# Seniman Kamera Web Platform

Web application and studio management platform for **Seniman Kamera** (Photography & Videography Studio), built with **Next.js 15/16 App Router**, **React 19**, **Prisma ORM**, **Tailwind CSS v4**, and **PostgreSQL**.

---

## 📚 Documentation Map (Diataxis)

This repository's documentation is organized using the **Diataxis Framework** located in [`docs/`](docs/README.md):

- **[Documentation Index & Map](docs/README.md)**: Master documentation index.
- **[Architecture Decision Records (ADRs)](docs/adr/001-clean-architecture-and-feature-driven.md)**:
  - [ADR 001: Clean Architecture & Feature-Driven Structure](docs/adr/001-clean-architecture-and-feature-driven.md)
  - [ADR 002: UI Governance & Component Hierarchy](docs/adr/002-ui-governance-and-component-hierarchy.md)
  - [ADR 003: Payment Gateway & Webhook Security](docs/adr/003-payment-gateway-and-webhook-security.md)
  - [ADR 004: Secret Isolation & Environment Validation](docs/adr/004-secret-isolation-and-environment-validation.md)
  - [ADR 005: Team Git Workflow & Deployment](docs/adr/005-team-git-workflow-and-deployment.md)
- **[Canonical Reference](docs/reference/domain-glossary.md)**:
  - [Domain Glossary](docs/reference/domain-glossary.md): Canonical terminology and status state machines.
  - [Architecture Conventions](docs/reference/architecture-conventions.md): Detailed layer contracts and folder layout.
- **[How-To Guides](docs/how-to/local-development.md)**:
  - [Local Development Guide](docs/how-to/local-development.md): Environment setup, PostgreSQL, Prisma, and DOKU sandbox.
  - [Adding a Feature](docs/how-to/adding-a-feature.md): Step-by-step checklist for building vertical slices.
  - [Issue & PR Workflow](docs/how-to/issue-and-pr-workflow.md): Branching strategy, conventional commits, and PR standards.
- **[Master Issues Backlog](MASTER_ISSUES_AUDIT.md)**: Prioritized technical debt and improvement roadmap.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Synchronize database schema & generate Prisma client
npx prisma db push
npx prisma generate

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Architecture Philosophy

The project follows:
- **Feature-Driven Architecture** (`src/modules/<feature>/...`)
- **Clean Architecture Principles** (`Page -> Action -> Use Case -> Repository -> Prisma -> PostgreSQL`)
- **1 File = 1 Responsibility**
- **Server Component First** (`export default async function Page()`)
- **Prisma access restricted strictly to repositories**
