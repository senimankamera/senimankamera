# ADR 001: Clean Architecture and Feature-Driven Structure

## Status

Accepted

## Context

As Next.js applications grow, codebases frequently suffer from architectural erosion:
1. **Direct Prisma Queries in UI & Actions:** Server components and server actions querying Prisma directly result in tight coupling, duplicated queries, and untestable business logic.
2. **Spaghetti Service Files:** Consolidating unrelated functions into generic services (e.g., `booking.service.ts` managing creation, cancellation, status updates, emails, and payments) creates unmaintainable monolithic files.
3. **Layer Blurring:** Mixing data validation, database queries, and external API requests directly inside App Router route handlers or pages makes auditing and refactoring risky.

To ensure Seniman Kamera remains scalable, maintainable, testable, and AI-friendly, we require strict architectural boundaries.

## Decision

We enforce **Feature-Driven Architecture**, **Use-Case Driven Business Logic**, and **Clean Architecture Principles** across the entire application:

### 1. Directory Structure: Feature First
All domain logic resides in `src/modules/<feature>/`. Organizing code by technical layer globally (such as `src/services/` or `src/repositories/`) is forbidden.

Each feature follows the standard layout:
```text
src/modules/<feature>/
├── actions/         # Server Actions (input parsing & use-case invocation)
├── use-cases/       # Pure business logic (1 use-case per file)
├── repositories/    # Database queries & Prisma persistence
├── services/        # Third-party integrations (isolated)
├── schemas/         # Zod schemas (source of truth for validation)
├── components/      # Feature-specific UI components
├── hooks/           # Feature-specific client hooks
├── types/           # Domain TypeScript types
└── index.ts         # Public feature API exports
```

### 2. The 1 File = 1 Responsibility Rule
Every file must have a single, clearly explainable purpose:
- One use-case per file (`create-booking.use-case.ts`, `cancel-booking.use-case.ts`).
- One repository per file (`booking.repository.ts`, `client.repository.ts`).
- One action per file (`create-booking.action.ts`).
- One schema per file (`create-booking.schema.ts`).

### 3. Strict Unidirectional Dependency Flow
Data flow is strictly unidirectional:
```text
Page / Route Handler
        ↓
  Server Action
        ↓
    Use Case
        ↓
   Repository
        ↓
     Prisma
        ↓
    PostgreSQL
```

### 4. Prisma Access Isolation
Direct access to Prisma (`prisma.*` or `db.*`) is **strictly restricted to `repositories/`**.
- Calling Prisma directly inside `app/**`, `components/**`, `actions/**`, `route.ts`, or `hooks/**` is strictly forbidden.

### 5. Framework-Independent Use-Cases
Use-case classes or functions must expose an `execute()` method, validate domain invariants, and remain decoupled from Next.js request/response mechanics.

## Consequences

### Positive
- **Predictable & Modular:** Code for a feature is colocated, making features easy to reason about, modify, or delete.
- **Testable:** Business logic in use-cases can be unit-tested with Vitest in isolation by mocking repositories.
- **AI-Agent Reliability:** Strict separation of layers provides deterministic patterns that prevent AI coding agents from generating tangled logic.

### Constraints & Trade-offs
- Requires more files per feature compared to rapid prototyping.
- Developers must follow the sequence: Schema -> Repository -> Use-Case -> Action -> Component. Skipping layers is prohibited.
