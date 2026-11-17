# Documentation Standard

This standard defines the mandatory rules for authoring, updating, and verifying documentation across the Seniman Kamera platform.

---

## 1. Diataxis Classification

All project documentation must be organized into one of the four Diataxis quadrants to ensure clarity of intent:

1. **Standards & Governance (`docs/standards/`):**
   - Rules, engineering policies, and architectural standards that all contributors and AI agents must comply with.
2. **Architecture Decision Records (`docs/adr/`):**
   - Formal, numbered technical decision records (`00N-<slug>.md`) capturing problems, alternatives, decisions, and consequences.
3. **Reference (`docs/reference/`):**
   - Canonical, descriptive technical knowledge: domain glossaries, data models, API schemas, and architecture conventions.
4. **How-To Guides (`docs/how-to/`):**
   - Goal-oriented, step-by-step procedural runbooks (e.g. local setup, creating a new feature slice, running tests).

---

## 2. Architecture Decision Records (ADRs)

Every major architectural decision, tech stack selection, or security policy must be documented as an ADR.

### File Naming Convention
```text
docs/adr/00N-<kebab-case-slug>.md
```
*Example: `docs/adr/003-payment-gateway-and-webhook-security.md`*

### Mandatory Structure
Every ADR must contain the following four sections:

```markdown
# ADR 00N: <Title>

## Status
Proposed | Accepted | Superseded | Deprecated

## Context
Explains the technical context, current problems, business motivations, and trade-offs of alternatives considered.

## Decision
Detailed technical decision, implementation guidelines, architectural patterns, and library selections.

## Consequences
Downstream impacts, positive outcomes, constraints introduced, and compliance obligations.
```

---

## 3. Language & Vocabulary Consistency

- **Technical Documentation & Code:** Written in **US English (`en-US`)** to ensure universal readability for developer tooling, linters, and AI agents.
- **Domain Business Terms:** When documenting studio business workflows, use the canonical terms defined in [`docs/reference/domain-glossary.md`](../reference/domain-glossary.md) (e.g., *Down Payment / DP*, *Balance Payment*, *Booking Draft*, *Calendar Slot*, *Deliverables*).
- Never invent synonymous or informal terms in technical docs (e.g., avoid mixing *order*, *transaction*, *down payment*, and *pelunasan* haphazardly).

---

## 4. Technical Accuracy & Link Integrity

1. **Source of Truth Alignment:**
   - Any Prisma schema reference must match the models defined in [`prisma/schema.prisma`](../../prisma/schema.prisma).
   - Any directory structure reference must align with `src/modules/` and `src/app/`.
2. **Relative Link Integrity:**
   - All markdown links within the `docs/` tree must be relative and point to existing files. Broken relative links violate repo quality standards.
3. **Verification Before Merging:**
   - When updating code that alters architectural rules, the corresponding ADR or reference document must be updated in the same pull request.
