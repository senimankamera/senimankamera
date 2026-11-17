# Domain Glossary

This glossary establishes canonical terminology in **US English (`en-US`)** and maps corresponding Indonesian business terms for the **Seniman Kamera** studio platform.

All contributors, code identifiers, database columns, API responses, and AI agents must adhere strictly to these terms.

---

## 📸 Core Entities

| Term | Indonesian Term | Category | Description | Canonical Identifier |
| :--- | :--- | :--- | :--- | :--- |
| **Client** | Klien / Pelanggan | Customer | Registered or guest customer booking a photography or videography session. | `Client` / `clients` |
| **Booking** | Reservasi / Pesanan | Booking | Confirmed booking reservation for a photo/video shoot with date, package, and location. | `Booking` / `bookings` |
| **Booking Draft** | Draft Reservasi | Booking | Temporary pre-checkout reservation held during user checkout with a 20-minute TTL. | `BookingDraft` / `booking_drafts` |
| **Category** | Kategori Layanan | Catalog | High-level service classification (e.g., Wedding, Prewedding, Portrait, Studio). | `Category` / `categories` |
| **Package** | Paket Layanan | Catalog | Specific service package offering (e.g., Gold, Platinum) with duration, price, and features. | `Package` / `packages` |
| **Calendar Slot** | Slot Kalender | Scheduling | Date/time reservation block preventing double bookings for a specific calendar date. | `CalendarSlot` / `calendar_slots` |
| **Payment Transaction**| Transaksi Pembayaran | Payment | Ledger record documenting incoming payment (Down Payment or Balance Payment). | `PaymentTransaction` |
| **Down Payment (DP)** | Uang Muka (DP) | Payment | Initial deposit payment (e.g. 50% or fixed nominal) required to lock the calendar slot. | `dpAmount` / `"DP"` |
| **Balance Payment** | Pelunasan | Payment | Remaining payment balance required prior to the shoot or release of deliverables. | `balanceAmount` / `"BALANCE"` |
| **Deliverables** | Hasil Foto & Video | Delivery | Final edited photos, raw archives, and cinematic videos delivered via secure cloud link. | `deliverables` / `driveUrl` |
| **Gallery** | Galeri Portofolio | Showcase | Public showcase of past photography projects categorized by sub-category. | `Gallery` / `galleries` |
| **Testimonial** | Ulasan / Testimoni | Showcase | Customer review and rating displayed on the landing page. | `Testimonial` / `testimonials` |
| **Site Settings** | Pengaturan Situs | Configuration | Dynamic key-value studio settings (DOKU credentials, Telegram chat IDs, contacts). | `SiteSettings` / `site_settings` |
| **Admin Profile** | Profil Admin | Administration | Staff backoffice profile authenticated via Supabase Auth with granular role access. | `AdminProfile` / `admin_profiles` |

---

## 🔄 Booking & Scheduling Types

The studio supports two distinct category booking types:

1. **`DATE_ONLY` (Full Day / Event-Based):**
   - Typically used for Weddings, Engagements, or large events.
   - Locks the entire calendar day for that booking.
   - `sessionStartTime` and `sessionEndTime` are optional or full-day.

2. **`TIME_BASED` (Hourly / Studio Sessions):**
   - Used for Studio Portraits, Graduation, Maternity, or Product Shoots.
   - Fixed slot duration calculated from `Package.sessionDuration` (e.g. 60 or 120 minutes).
   - Requires explicit `sessionStartTime` and `sessionEndTime` (format `HH:mm`).

---

## 📊 Status Lifecycle & State Machine

### 1. Booking Status Transitions (`status`)

```text
[Customer Draft]
       │
       ▼ (Submits Form)
   PENDING ──(Payment Failed / Expired)──► CANCELLED
       │
       ▼ (DP / Full Payment Confirmed)
   APPROVED
       │
       ▼ (Studio Crew Dispatched & Event Executed)
   COMPLETED
```

- **`PENDING`:** Booking created, awaiting payment gateway confirmation or manual admin review.
- **`APPROVED`:** Initial payment verified; shoot schedule is officially confirmed on studio calendar.
- **`COMPLETED`:** Photo/video session finished and deliverables handed over to client.
- **`CANCELLED`:** Reservation expired without payment, cancelled by client, or rejected by admin.

### 2. Payment Status Transitions (`paymentStatus`)

```text
   PENDING
      │
      ├──► DP_PAID (Down payment received, balance remaining)
      │       │
      │       ▼ (Client completes remaining payment)
      │     LUNAS / PAID (Fully paid)
      │
      └──► LUNAS / PAID (100% full payment upfront)
```

- **`PENDING`:** No payment verified yet.
- **`DP_PAID`:** Down Payment (50%) confirmed via DOKU webhook or manual transfer. Calendar slot locked.
- **`LUNAS` / `PAID`:** 100% of the package price has been settled. Deliverables can be released.
- **`REFUNDED`:** Payment returned to client due to agreed cancellation.

### 3. Calendar Slot Status (`CalendarSlot.status`)

- **`PENDING`:** Temporary hold during checkout.
- **`APPROVED`:** Booked via DP or client confirmation.
- **`LUNAS`:** Fully paid booking.
- **`ManualBlock`:** Blocked by studio admin for studio maintenance, holidays, or private shoot.
- **`ManualBooking`:** Reserved manually by admin on behalf of an offline client.
- **`CANCELLED`:** Freed up for new bookings.

---

## 🛡️ Administrative Roles (`AdminRole`)

Backoffice staff accounts are divided into 3 distinct roles:

1. **`SUPER_ADMIN`:** Full access to studio settings, DOKU configuration, admin user management, pricing, and financial ledgers.
2. **`ADMIN_PESANAN`:** Manages client bookings, calendar scheduling, manual payments, and deliverable links.
3. **`ADMIN_CMS`:** Manages landing page content, testimonials, and gallery portfolio uploads.
