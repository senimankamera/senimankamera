# ADR 004: Secret Isolation and Environment Validation

## Status

Accepted

## Context

Hardcoded configuration secrets, scattered `process.env` references, and missing environment variables represent severe security and operational hazards:
1. **Silent Production Failures:** If a critical variable like `DOKU_SECRET_KEY` or `TELEGRAM_BOT_TOKEN` is missing or misspelled in Vercel settings, errors only surface at runtime when a customer attempts checkout.
2. **Credential Leaks:** Accidentally committing `.env` or `.env.local` files to Git exposes database passwords and Supabase service role keys.
3. **Database Corruption:** Running seed scripts (`seed.ts`) indiscriminately in a production environment can wipe or overwrite real client bookings and calendar data.

## Decision

We enforce centralized environment validation, secret isolation, and script safeguards:

### 1. Centralized Environment Schema
- All runtime and build-time environment variables must be declared and validated using a centralized schema (e.g. `src/infrastructure/env.ts` or `@t3-oss/env-nextjs`).
- Variable parsing must run on application initialization. If any required variable is missing or malformed, the application must **fail fast at startup** with explicit diagnostic error messages.

### 2. Prohibition of Raw `process.env`
- Accessing `process.env.VARIABLE_NAME` directly inside pages, components, use-cases, or repositories is strictly forbidden.
- All code must import typed, validated variables from the centralized environment export:
  ```typescript
  // Allowed:
  import { env } from "@/src/infrastructure/env";
  const apiKey = env.DOKU_CLIENT_ID;

  // Forbidden:
  const apiKey = process.env.DOKU_CLIENT_ID;
  ```

### 3. Git Secret Isolation & `.env.example` Governance
- `.gitignore` must ignore all `.env*` files with the single exception of `!.env.example`.
- `.env.example` is the single source of truth for all required keys.
- **Zero Real Secrets in Git:** `.env.example` must contain placeholder or documentation dummy values only (e.g., `DOKU_SECRET_KEY=your_doku_secret_key_here`). Committing real secrets to `.env.example` is strictly banned.

### 4. Production Seed Safeguards
- Any database seeding script (e.g. `prisma/seed.ts`) must check `process.env.NODE_ENV === "production"`.
- If executed in production, the script must abort immediately unless an explicit safety flag (e.g. `ALLOW_PRODUCTION_SEED=true`) is manually provided with interactive confirmation.

## Consequences

### Positive
- **Guaranteed Configuration Integrity:** Missing environment variables are caught during build or application startup, never during customer transactions.
- **Type-Safety:** Environment variables are strictly typed (strings, numbers, URLs, enums) across the entire codebase.
- **Accident Prevention:** Production databases are safeguarded against accidental seed overwrites.

### Constraints & Trade-offs
- Whenever a new third-party service or key is introduced, developers must update both the schema definition and `.env.example`.
