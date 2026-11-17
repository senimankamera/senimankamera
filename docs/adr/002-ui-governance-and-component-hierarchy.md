# ADR 002: UI Governance and Component Hierarchy

## Status

Accepted

## Context

In complex Next.js booking and studio management applications, client-side rendering bloat is a frequent pitfall. Placing `"use client"` at the top of page files or container components cascades down the render tree, forcing unnecessary JavaScript bundles to the browser. This degrades mobile First Contentful Paint (FCP) and Time to Interactive (TTI), particularly for clients booking photography sessions from mobile devices.

Additionally, arbitrary Tailwind styling (e.g. ad-hoc hex values `bg-[#1a1a1a]`) and raw unstyled HTML form elements create inconsistent user experiences and accessibility issues.

## Decision

We establish strict UI governance and component hierarchy standards:

### 1. Server Component First
- App Router pages (`src/app/**/page.tsx`) must default to Server Components (`export default async function Page()`).
- Pages serve purely as composition layers: they load data via use-cases/actions, compose UI containers, and handle route/search parameters.
- Target page size: **≤ 150 lines**.

### 2. Client Component Boundary Isolation
- Use `"use client"` only when strictly necessary:
  - Local state management (`useState`, `useReducer`).
  - Browser/DOM APIs and event listeners (`window`, `localStorage`, `onClick`).
  - Interactive widgets (e.g., calendar date pickers, time slot selectors, image uploaders, modal dialogs).
- Push `"use client"` to the outermost leaf components in the tree. Never convert entire pages or large layout containers into Client Components.

### 3. Component Hierarchy and Sizing
Components are divided into two distinct categories:
- **Shared Primitives (`src/common/components/` & `components/ui/`):** Generic, reusable, domain-agnostic UI elements (buttons, inputs, dialogs, cards, toast).
- **Feature Presentation (`src/modules/<feature>/components/`):** Domain-specific presentational views (e.g., `booking-calendar.tsx`, `package-card.tsx`, `client-details-form.tsx`).
- Target component size: **≤ 200 lines**. Monolithic components must be decomposed into focused subcomponents.

### 4. UI Library & Styling Governance
- Standardize on `shadcn/ui` components built with Tailwind CSS v4 semantic tokens.
- Raw HTML interactive controls (`<button>`, `<input>`, `<select>`, `<textarea>`) should use styled shadcn primitives.
- Mobile Booking Primary CTAs: Floating booking buttons and schedule checkout bars must have large, comfortable touch targets (`min-h-[44px]` or `size="lg"`).

### 5. Separation of Concerns
- Components must NEVER import Prisma directly.
- Components must NEVER contain direct database queries or raw external payment calls.
- User input submission must flow through Server Actions or controlled event handlers.

## Consequences

### Positive
- **Optimal Web Vitals:** Minimized client-side JavaScript bundle sizes result in fast page loads on mobile networks.
- **Consistent UX/UI:** Unified styling across studio landing, booking flow, client tracking, and admin dashboard.
- **Maintainability:** Small, single-responsibility UI components are easily testable with Storybook/Vitest and simple to refactor.

### Constraints & Trade-offs
- Developers must deliberately design component boundaries and plan prop serialization between Server and Client Components.
