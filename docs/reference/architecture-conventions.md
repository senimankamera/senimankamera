# Architecture Conventions

This reference document defines standard architectural patterns, directory structures, layer contracts, and coding conventions for the Seniman Kamera platform.

---

## 📁 Repository Directory Layout

The codebase strictly follows the **`src/` First Layout**:

```text
src/
├── app/                               # Next.js 15/16 App Router routing & composition
│   ├── (public)/                      # Public routes (landing, gallery, booking flow)
│   ├── (admin)/                       # Protected backoffice dashboard routes
│   ├── api/                           # Route handlers (DOKU webhooks, cron jobs)
│   ├── globals.css                    # Tailwind CSS v4 variables & design tokens
│   └── layout.tsx                     # Root HTML layout
├── modules/                           # Feature Driven Domain Modules
│   ├── booking/                       # Booking creation, checkout, draft, calendar slot
│   ├── customer/                      # Client profiles and order history
│   ├── gallery/                       # Showcase portfolio, categories, image assets
│   ├── auth/                          # Supabase authentication and staff session
│   └── admin-management/              # Admin profiles, staff permissions, site settings
├── common/                            # Cross-domain reusable primitives
│   ├── components/                    # Generic UI atoms and compound components
│   ├── hooks/                         # Reusable client hooks (e.g. use-debounce)
│   ├── utils/                         # Pure utility functions (formatting, dates)
│   └── constants/                     # Shared constants (app-wide configuration)
└── infrastructure/                    # External infrastructure adapters
    ├── prisma/                        # Prisma client instance (`client.ts`)
    ├── doku/                          # DOKU payment gateway SDK adapter (`doku.service.ts`)
    ├── telegram/                      # Telegram notification bot client (`telegram.service.ts`)
    └── supabase/                      # Supabase server, client, and admin instances
```

---

## 🧩 Standard Feature Module Anatomy

Every domain feature inside `src/modules/<feature>/` must adhere to this uniform structure:

```text
src/modules/<feature>/
├── actions/                           # Server Actions (1 action per file)
│   ├── create-<entity>.action.ts
│   └── update-<entity>.action.ts
├── use-cases/                         # Pure business logic (1 use-case per file)
│   ├── create-<entity>.use-case.ts
│   └── update-<entity>.use-case.ts
├── repositories/                      # Persistence layer (Prisma queries)
│   └── <entity>.repository.ts
├── services/                          # External domain integrations (optional)
│   └── <entity>-export.service.ts
├── schemas/                           # Zod validation schemas
│   └── create-<entity>.schema.ts
├── components/                        # Feature-specific UI components
│   ├── <entity>-form.tsx
│   └── <entity>-card.tsx
├── hooks/                             # Feature-specific client hooks
├── types/                             # Domain TypeScript interfaces
└── index.ts                           # Public module barrel exports
```

---

## 📜 Layer Contracts & Responsibilities

### 1. App Router Page (`src/app/**/page.tsx`)
- **Responsibility:** Route definition, loading data, composing UI containers.
- **Rules:**
  - Must default to Server Components (`export default async function Page()`).
  - Must NEVER contain direct Prisma queries (`prisma.*`).
  - Must NEVER contain business validation logic.
  - Target size: **≤ 150 lines**.

### 2. Server Action (`src/modules/<feature>/actions/*.action.ts`)
- **Responsibility:** Network entry point for client forms/buttons. Parses input, validates with Zod, invokes use-case, and handles revalidation (`revalidatePath`).
- **Rules:**
  - Must begin with `"use server";`.
  - Must have exactly 1 action per file.
  - Must return a structured response:
    ```typescript
    export type ActionResponse<T> =
      | { success: true; data: T }
      | { success: false; error: string; issues?: z.ZodIssue[] };
    ```
  - Must NEVER query Prisma directly.
  - Target size: **≤ 100 lines**.

### 3. Use Case (`src/modules/<feature>/use-cases/*.use-case.ts`)
- **Responsibility:** Pure domain business logic and invariant validation.
- **Rules:**
  - Must expose an `execute()` method.
  - 1 use-case per file.
  - Must remain framework-agnostic (no Next.js request/response dependencies).
  - Interacts with the database exclusively via injected or instantiated repositories.
  - Target size: **≤ 150 lines**.

### 4. Repository (`src/modules/<feature>/repositories/*.repository.ts`)
- **Responsibility:** Database queries and persistence logic via Prisma.
- **Rules:**
  - This is the **ONLY** layer allowed to import `prisma` from `@/src/infrastructure/prisma/client`.
  - Must NOT contain UI formatting or business calculation logic.
  - Target size: **≤ 150 lines**.

---

## 🔤 Naming Conventions

All files and directories must use **`kebab-case`**:

| Component / Layer | Format | Example |
| :--- | :--- | :--- |
| **Server Action** | `<verb>-<subject>.action.ts` | `create-booking.action.ts` |
| **Use Case** | `<verb>-<subject>.use-case.ts` | `create-booking.use-case.ts` |
| **Repository** | `<subject>.repository.ts` | `booking.repository.ts` |
| **Zod Schema** | `<verb>-<subject>.schema.ts` | `create-booking.schema.ts` |
| **UI Component** | `<subject>-<role>.tsx` | `booking-summary-card.tsx` |
| **Hook** | `use-<description>.ts` | `use-booking-calendar.ts` |

Avoid PascalCase, camelCase, or uppercase filenames (e.g. `CreateBooking.ts`, `bookingService.ts`).

---

## 📏 File Size Guidelines

| File Type | Recommended Limit | Action When Exceeded |
| :--- | :--- | :--- |
| **Page** (`page.tsx`) | ≤ 150 lines | Extract sections into feature components |
| **Component** (`*.tsx`) | ≤ 200 lines | Decompose into smaller focused subcomponents |
| **Use Case** (`*.use-case.ts`) | ≤ 150 lines | Split sub-workflows into helper domain services |
| **Repository** (`*.repository.ts`)| ≤ 150 lines | Split by sub-entity (e.g. `booking-draft.repository.ts`) |
| **Action** (`*.action.ts`) | ≤ 100 lines | Delegate logic to use-case |
