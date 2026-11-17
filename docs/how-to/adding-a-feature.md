# Adding a Feature Slice

This guide provides a comprehensive step-by-step checklist for building a new feature slice in Seniman Kamera following **Clean Architecture** and **Feature-Driven Design**.

---

## 📋 Vertical Slice Implementation Checklist

### 1. Identify Domain & Structure
Determine which domain module owns the feature in `src/modules/` (e.g. `booking`, `gallery`, `customer`, `admin-management`). If creating a new domain, initialize the standard folder anatomy:
```bash
mkdir -p src/modules/<feature>/{actions,use-cases,repositories,schemas,components,types}
```

### 2. Database Schema & Repository Layer
If your feature requires new tables or columns:
- [ ] Update `prisma/schema.prisma`.
- [ ] Run `npx prisma db push` and `npx prisma generate`.
- [ ] Create or update the repository in `src/modules/<feature>/repositories/<entity>.repository.ts`:
  ```typescript
  import { prisma } from "@/src/infrastructure/prisma/client";

  export class BookingRepository {
    async findById(id: string) {
      return prisma.booking.findUnique({ where: { id } });
    }
  }
  ```
- *Rule Check:* **Prisma is ONLY called inside repositories.**

### 3. Zod Input Schema
Define the request and input validation schema:
- [ ] Create `src/modules/<feature>/schemas/<verb>-<entity>.schema.ts`.
  ```typescript
  import { z } from "zod";

  export const CreateBookingSchema = z.object({
    clientId: z.string().uuid(),
    packageType: z.string().min(1),
    bookingDate: z.coerce.date(),
  });

  export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
  ```

### 4. Pure Domain Use Case
Implement the business rules and state transitions:
- [ ] Create `src/modules/<feature>/use-cases/<verb>-<entity>.use-case.ts`.
  ```typescript
  import { BookingRepository } from "../repositories/booking.repository";
  import { CreateBookingInput } from "../schemas/create-booking.schema";

  export class CreateBookingUseCase {
    constructor(private readonly bookingRepo = new BookingRepository()) {}

    async execute(input: CreateBookingInput) {
      // 1. Validate domain invariants (e.g., check slot availability)
      // 2. Persist state via repository
      // 3. Return clean domain result
    }
  }
  ```
- *Rule Check:* **1 use case per file, framework-independent, expose `execute()`.**

### 5. Server Action Orchestration
Create the network entry point for frontend forms:
- [ ] Create `src/modules/<feature>/actions/<verb>-<entity>.action.ts`.
  ```typescript
  "use server";

  import { revalidatePath } from "next/cache";
  import { CreateBookingSchema } from "../schemas/create-booking.schema";
  import { CreateBookingUseCase } from "../use-cases/create-booking.use-case";

  const useCase = new CreateBookingUseCase();

  export async function createBookingAction(formData: unknown) {
    const parsed = CreateBookingSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Validation failed", issues: parsed.error.issues };
    }

    try {
      const data = await useCase.execute(parsed.data);
      revalidatePath("/admin/bookings");
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to create booking" };
    }
  }
  ```
- *Rule Check:* **`"use server"` at top, exactly 1 action per file, zero direct Prisma access.**

### 6. Presentation Components
Build UI presentational components using `shadcn/ui` primitives:
- [ ] Create `src/modules/<feature>/components/<entity>-form.tsx`.
- [ ] Use `"use client"` only in leaf components handling user interaction or state.
- [ ] Keep components under **200 lines**.

### 7. App Router Page Composition
Assemble the page inside `src/app/`:
- [ ] Default to Server Component (`export default async function Page()`).
- [ ] Fetch initial data via use-case or repository, render presentation components.
- [ ] Keep page under **150 lines**.

### 8. Verification & Tests
- [ ] Write unit tests for your use-case with Vitest in `tests/`.
- [ ] Run full mechanical checks:
  ```bash
  npx tsc --noEmit
  npm run lint
  npm run build
  ```
