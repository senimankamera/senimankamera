# MASTER ISSUES AUDIT & ROADMAP PERBAIKAN
## Seniman Kamera Studio Web Application

> Dokumen ini adalah acuan kerja (master backlog) komprehensif berdasarkan hasil audit menyeluruh terhadap arsitektur, keamanan, database, logika bisnis, dan pengalaman pengguna (UX).
> Terakhir diperbarui: 17 November 2026.

---

## 📊 Matriks Prioritas Masalah & Format Branch

| Issue | Target Branch | Labels | Ringkasan Isu | Status |
| :---: | :--- | :--- | :--- | :---: |
| [#12](https://github.com/senimankamera/senimankamera/issues/12) | `fix/issue-12-middleware-proxy` | `bug`, `security` | `fix(security): resolve Next.js middleware inactivity due to proxy.ts` | 🔴 Open |
| [#13](https://github.com/senimankamera/senimankamera/issues/13) | `fix/issue-13-doku-signature-bypass` | `bug`, `security`, `payment` | `fix(security): eliminate webhook signature bypass in notification route` | 🔴 Open |
| [#14](https://github.com/senimankamera/senimankamera/issues/14) | `fix/issue-14-cron-auth-protection` | `bug`, `security`, `devops` | `fix(security): enforce authentication on cron cleanup-drafts and keep-alive endpoints` | 🔴 Open |
| [#15](https://github.com/senimankamera/senimankamera/issues/15) | `refactor/issue-15-src-structure` | `enhancement`, `architecture` | `refactor(architecture): reorganize codebase to src/ first directory structure` | 🔴 Open |
| [#16](https://github.com/senimankamera/senimankamera/issues/16) | `refactor/issue-16-prisma-repositories` | `enhancement`, `architecture`, `database` | `refactor(architecture): encapsulate direct Prisma queries into repository layers` | 🔴 Open |
| [#17](https://github.com/senimankamera/senimankamera/issues/17) | `refactor/issue-17-atomic-server-actions` | `enhancement`, `architecture` | `refactor(architecture): enforce 1 file 1 responsibility rule on server actions` | 🔴 Open |
| [#18](https://github.com/senimankamera/senimankamera/issues/18) | `feat/issue-18-client-email-notifications` | `enhancement`, `notification`, `booking` | `feat(notification): implement automated client booking confirmation and invoice emails` | 🔴 Open |
| [#19](https://github.com/senimankamera/senimankamera/issues/19) | `feat/issue-19-balance-payment` | `enhancement`, `payment`, `booking` | `feat(payment): implement online balance payment on order tracking page` | 🔴 Open |
| [#20](https://github.com/senimankamera/senimankamera/issues/20) | `feat/issue-20-deliverables-link` | `enhancement`, `deliverables`, `booking` | `feat(deliverables): add photo and video deliverables link in admin and tracking page` | 🔴 Open |
| [#21](https://github.com/senimankamera/senimankamera/issues/21) | `fix/issue-21-telegram-deduplication` | `bug`, `notification`, `booking` | `fix(notification): prevent duplicate Telegram notifications in serverless environment` | 🔴 Open |
| [#22](https://github.com/senimankamera/senimankamera/issues/22) | `refactor/issue-22-component-decomposition` | `enhancement`, `ui`, `architecture` | `refactor(ui): decompose monolithic client components into focused subcomponents` | 🔴 Open |
| [#23](https://github.com/senimankamera/senimankamera/issues/23) | `fix/issue-23-success-polling-fallback` | `bug`, `ui`, `booking` | `fix(ui): replace inline script polling on success page and add booking error fallback` | 🔴 Open |
| [#24](https://github.com/senimankamera/senimankamera/issues/24) | `refactor/issue-24-enums-and-schema-cleanup` | `enhancement`, `database`, `payment` | `refactor(database): introduce Prisma enums for booking status and clean up legacy snap fields` | 🔴 Open |
| [#25](https://github.com/senimankamera/senimankamera/issues/25) | `docs/issue-25-seed-protection-env-example` | `documentation`, `devops`, `database` | `docs(devops): guard seed.ts against production execution and document .env.example` | 🔴 Open |
| [#26](https://github.com/senimankamera/senimankamera/issues/26) | `feat/issue-26-seo-and-error-boundaries` | `enhancement`, `seo`, `ui` | `feat(seo): fix html lang attribute, add error boundaries, sitemap, and robots.txt` | 🔴 Open |
| [#27](https://github.com/senimankamera/senimankamera/issues/27) | `test/issue-27-vitest-suite` | `enhancement`, `testing`, `booking` | `test(booking): set up Vitest test suite for booking schedule and payment calculation` | 🔴 Open |

---

## 🔴 P0 — Kritis & Keamanan (Harus Segera Diselesaikan)

### <a id="issue-01"></a>ISSUE-01: Next.js Middleware Tidak Aktif Akibat Penamaan `proxy.ts`
- **Kategori:** Keamanan / Infrastruktur
- **Tingkat Keparahan:** 🚨 **P0 — Kritis**
- **File Terdampak:** `proxy.ts`, `src/infrastructure/supabase/middleware.ts`
- **Deskripsi Masalah:**
  File middleware saat ini disimpan sebagai `proxy.ts` di root proyek dengan export function `proxy(request)`. Next.js **hanya mengenali** file bernama `middleware.ts` (atau `src/middleware.ts`) dengan export function bernama `middleware`. Akibatnya, `proxy.ts` **diabaikan sepenuhnya oleh Next.js**.
- **Dampak:**
  1. Token sesi Supabase pengguna tidak diperbarui secara otomatis di edge, memicu sesi putus acak (stale token).
  2. Lapisan proteksi rute admin di edge tidak berjalan.
- **Rekomendasi Solusi:**
  1. Ubah nama `proxy.ts` menjadi `middleware.ts` (atau letakkan di `src/middleware.ts`).
  2. Ganti nama fungsi export menjadi:
     ```typescript
     import { type NextRequest } from "next/server";
     import { updateSession } from "@/src/infrastructure/supabase/middleware";

     export async function middleware(request: NextRequest) {
       return await updateSession(request);
     }
     ```
- **Acceptance Criteria:**
  - [ ] File `proxy.ts` dihapus dan digantikan oleh `middleware.ts` / `src/middleware.ts`.
  - [ ] Request ke rute `/admin` tanpa cookie sesi otomatis diarahkan (redirect) ke `/login` langsung di tingkat middleware.

---

### <a id="issue-02"></a>ISSUE-02: Celah Fatal Bypass Signature Webhook DOKU di Endpoint Notifikasi
- **Kategori:** Keamanan Pembayaran
- **Tingkat Keparahan:** 🚨 **P0 — Kritis**
- **File Terdampak:** `app/api/payment/notification/route.ts` (baris 37–44)
- **Deskripsi Masalah:**
  Terdapat logika bypass signature berikut:
  ```typescript
  if (!isValid && orderId) {
    const draft = await bookingDraftRepository.findDraftById(orderId);
    if (draft) {
      console.log(`DOKU Webhook signature mismatch fallback: Draft valid ditemukan untuk Invoice ${orderId}. Memproses request...`);
      isValid = true; // ⚠️ CELAH KEAMANAN VULNERABLE
    }
  }
  ```
- **Dampak:**
  Penyerang mana pun dapat mengirimkan POST request dengan payload JSON buatan berisi `{"transaction": {"status": "SUCCESS"}, "order": {"invoice_number": "<id_draft>"}}` tanpa signature HMAC yang valid. Booking akan otomatis disahkan menjadi LUNAS/DP TERBAYAR tanpa transfer dana asli.
- **Rekomendasi Solusi:**
  1. Hapus blok fallback `if (!isValid && orderId)` tersebut.
  2. Pastikan di environment production (`process.env.NODE_ENV === "production"`), kegagalan verifikasi signature wajib menghasilkan response `401 Unauthorized`.
  3. Validasi keaslian string to sign dan header DOKU secara konsisten.
- **Acceptance Criteria:**
  - [ ] Webhook menolak keras semua request dengan signature HMAC yang salah atau hilang dengan status HTTP 401.
  - [ ] Pengujian simulasi pembayaran tetap berjalan mulus melalui DOKU Sandbox tanpa bypass.

---

### <a id="issue-03"></a>ISSUE-03: Celah Autentikasi Publik pada Endpoint Cron Job
- **Kategori:** Keamanan / API
- **Tingkat Keparahan:** 🚨 **P0 — Kritis**
- **File Terdampak:**
  - `app/api/cron/cleanup-drafts/route.ts` (baris 13)
  - `app/api/cron/keep-alive/route.ts` (baris 15)
- **Deskripsi Masalah:**
  Validasi header otorisasi menggunakan:
  ```typescript
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && token !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```
  Jika `CRON_SECRET` belum diisi di environment, `if (cronSecret && ...)` bernilai `false`. Akibatnya, endpoint lolos tanpa autentikasi sama sekali.
- **Dampak:**
  Publik atau crawler bot dapat menembak endpoint pembersihan draft dan keep-alive tanpa hambatan.
- **Rekomendasi Solusi:**
  Ubah validasi agar mewajibkan rahasia cron ada dan cocok:
  ```typescript
  if (!cronSecret || token !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```
- **Acceptance Criteria:**
  - [ ] Endpoint merespons 401 jika `CRON_SECRET` tidak ada atau token tidak sesuai.

---

## 🟠 P1 — Arsitektur, Bisnis & Reliabilitas (Prioritas Tinggi)

### <a id="issue-04"></a>ISSUE-04: Penataan Struktur Folder Root ke Standar `src/` First (AGENTS.md)
- **Kategori:** Arsitektur Perangkat Lunak
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:** `./app`, `./components`, `./hooks`, `./lib`, `tsconfig.json`
- **Deskripsi Masalah:**
  Dokumen panduan arsitektur ([AGENTS.md](file:///home/alazhar14/Projects/senimankamera/AGENTS.md)) mewajibkan struktur:
  ```txt
  src/
  ├── app/
  ├── modules/
  ├── common/
  ├── infrastructure/
  └── types/
  ```
  Saat ini folder `app/`, `components/`, `hooks/`, dan `lib/` berada di root proyek.
- **Rekomendasi Solusi:**
  1. Pindahkan `./app` ke `src/app/`.
  2. Pindahkan shared UI `./components/ui` ke `src/common/components/ui`.
  3. Pindahkan utility `./lib` ke `src/common/utils` dan `./hooks` ke `src/common/hooks`.
  4. Perbarui path mapping pada `tsconfig.json` (`"@/*": ["./*"]` disesuaikan atau diarahkan ke `src/`).
- **Acceptance Criteria:**
  - [ ] Tidak ada lagi folder implementasi kode di root selain `src/`, `public/`, dan `prisma/`.
  - [ ] Build Next.js (`npm run build`) berjalan bersih tanpa broken import.

---

### <a id="issue-05"></a>ISSUE-05: Pelanggaran Akses Langsung Prisma di Luar Repository Layer
- **Kategori:** Clean Architecture
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:**
  - `app/(public)/page.tsx` (`prisma.gallery.findMany`)
  - `app/admin/calendar/page.tsx` (`prisma.calendarSlot.findMany`, `prisma.booking.findMany`)
  - `app/api/cron/keep-alive/route.ts` (`prisma.$queryRaw`)
  - `src/modules/booking/actions/package-admin.action.ts` (`prisma.package.findUnique`)
  - `src/modules/booking/actions/get-public-calendar.action.ts` (`prisma.calendarSlot.findMany`)
  - `src/modules/booking/use-cases/update-booking-status.use-case.ts` (`prisma.paymentTransaction.upsert`)
  - `src/modules/booking/use-cases/confirm-booking-from-draft.use-case.ts` (`prisma.client.upsert`)
- **Deskripsi Masalah:**
  Aturan arsitektur melarang keras pemanggilan Prisma di dalam `page.tsx`, `action.ts`, `route.ts`, dan `use-case.ts`. Seluruh query Prisma wajib dibungkus dalam kelas **Repository**.
- **Rekomendasi Solusi:**
  1. Tambahkan method repository yang relevan (misal `GalleryRepository.findHomepageGalleries()`, `CalendarRepository.findAllSlots()`, `SystemRepository.pingDatabase()`).
  2. Gantikan pemanggilan langsung Prisma dengan pemanggilan method repository.
- **Acceptance Criteria:**
  - [ ] Audit `grep -rn "prisma\." app/ src/modules/*/actions src/modules/*/components` menghasilkan 0 baris pelanggaran.

---

### <a id="issue-06"></a>ISSUE-06: Pelanggaran Prinsip 1 File = 1 Responsibility pada Server Actions
- **Kategori:** Maintainability
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:**
  - `src/modules/auth/actions/login.action.ts` (berisi `loginAction` dan `logoutAction`)
  - `src/modules/booking/actions/package-admin.action.ts` (berisi 4 aksi admin paket)
  - `src/modules/booking/actions/category-admin.action.ts` (berisi banyak aksi admin kategori)
  - `src/modules/gallery/actions/gallery-admin.action.ts`
  - `src/modules/customer/actions/customer.action.ts`
- **Deskripsi Masalah:**
  Standar proyek mewajibkan *1 File = 1 Action*. Penggabungan beberapa aksi dalam satu file menyulitkan pelacakan dependensi dan optimasi bundle Next.js.
- **Rekomendasi Solusi:**
  Pecah file gabungan menjadi aksi atomik:
  - `create-package.action.ts`, `update-package.action.ts`, `delete-package.action.ts`, `reorder-packages.action.ts`
  - `logout.action.ts` dipisahkan dari `login.action.ts`
- **Acceptance Criteria:**
  - [ ] Setiap file action hanya meng-export tepat 1 server action.

---

### <a id="issue-07"></a>ISSUE-07: Ketiadaan Notifikasi Konfirmasi Otomatis ke Klien (Email / WhatsApp)
- **Kategori:** Pengalaman Pelanggan (Customer Experience)
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:** `app/api/payment/notification/route.ts`, `src/infrastructure`
- **Deskripsi Masalah:**
  Ketika pembayaran DP berhasil, notifikasi saat ini hanya dikirimkan ke Telegram internal studio. Pemesan/klien sama sekali tidak menerima bukti pembayaran resmi via email atau notifikasi WhatsApp otomatis.
- **Rekomendasi Solusi:**
  1. Buat infrastructure service baru: `src/infrastructure/mail/mail.service.ts` (menggunakan Resend atau Nodemailer) dan/atau `whatsapp.service.ts` (Fonnte/Waba).
  2. Kirimkan email konfirmasi berformat HTML rapi yang memuat:
     - Nomor Tracking / Order ID
     - Ringkasan Paket & Tanggal Acara
     - Jumlah DP yang telah dibayar & sisa pembayaran
     - Link menuju halaman pelacakan `/track?order_id=...&email=...`
- **Acceptance Criteria:**
  - [ ] Klien menerima email konfirmasi seketika setelah pembayaran DP sukses terverifikasi.

---

### <a id="issue-08"></a>ISSUE-08: Belum Ada Fitur Pembayaran Pelunasan Sisa (Online Full Payment)
- **Kategori:** Fitur Bisnis
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:** `src/modules/booking/components/booking-tracker.tsx`, `src/modules/booking/actions`
- **Deskripsi Masalah:**
  Pada sistem saat ini, DOKU hanya digunakan saat DP. Ketika status pesanan sudah APPROVED dan memasuki tahap "Pelunasan Sisa", tidak ada tombol atau API untuk menghasilkan invoice pelunasan sisa tagihan secara online.
- **Rekomendasi Solusi:**
  1. Buat use-case dan action baru: `initiate-balance-payment.use-case.ts` & `initiate-balance-payment.action.ts`.
  2. Generate sesi DOKU baru untuk nominal sisa: `totalAmount - dpAmount` dengan invoice berformat `INV-{id}-FINAL`.
  3. Tampilkan tombol *"Bayar Sisa Tagihan (Pelunasan)"* pada komponen `BookingTracker` jika status pesanan adalah `APPROVED` dan sisa belum terbayar.
- **Acceptance Criteria:**
  - [ ] Klien dapat melunasi tagihan secara online melalui halaman tracking.
  - [ ] Pembayaran pelunasan otomatis mengubah status booking menjadi `LUNAS`.

---

### <a id="issue-09"></a>ISSUE-09: Ketiadaan Fitur Input & Akses Link Hasil Karya (Deliverables Link)
- **Kategori:** Fitur Bisnis
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:** `prisma/schema.prisma`, `app/admin/bookings/bookings-client.tsx`, `src/modules/booking/components/booking-tracker.tsx`
- **Deskripsi Masalah:**
  Tahap akhir dari studio foto adalah penyerahan hasil foto & video. Di halaman tracking terdapat step *"Penyerahan Hasil: Seluruh karya foto & video hasil kurasi diserahkan"*, namun sistem tidak memiliki kolom maupun fitur bagi fotografer/admin untuk menyematkan link Google Drive / Cloud Gallery hasil foto.
- **Rekomendasi Solusi:**
  1. Tambahkan kolom pada tabel `Booking`:
     ```prisma
     deliverablesUrl String?  // Link Google Drive / Client Gallery
     deliveredAt     DateTime?
     ```
  2. Berikan input field di modal detail admin dashboard agar tim fotografer bisa memasukkan link galeri foto klien.
  3. Tampilkan tombol *"Akses Galeri & Unduh Foto"* di halaman `/track` bagi klien ketika status telah LUNAS dan link telah diisi.
- **Acceptance Criteria:**
  - [ ] Admin dapat menyimpan link galeri hasil foto pada pesanan.
  - [ ] Klien dapat langsung membuka link tersebut dari halaman tracking resmi.

---

### <a id="issue-10"></a>ISSUE-10: Duplikasi Notifikasi Telegram Akibat In-Memory State di Serverless
- **Kategori:** Reliabilitas
- **Tingkat Keparahan:** 🟠 **P1 — Tinggi**
- **File Terdampak:** `src/modules/booking/actions/get-booking-by-id.action.ts` (baris 7 & 61)
- **Deskripsi Masalah:**
  Pencegahan duplikasi pesan Telegram pada halaman sukses saat ini mengandalkan:
  `const activeTelegramSentSet = new Set<string>();` di memori modul.
  Di lingkungan serverless (seperti Vercel), setiap function instance / cold start memiliki memori terisolasi. Jika webhook dan halaman sukses berjalan di instance berbeda, Telegram akan mengirim pesan 2 kali.
- **Rekomendasi Solusi:**
  1. Tambahkan kolom database:
     `isTelegramNotified Boolean @default(false)` pada model `Booking`.
  2. Hanya kirim notifikasi Telegram jika `isTelegramNotified === false`, lalu update kolom menjadi `true` dalam transaksi database.
- **Acceptance Criteria:**
  - [ ] Notifikasi Telegram hanya terkirim tepat 1 kali untuk setiap pemesanan.

---

## 🟡 P2 — Pembersihan Kode, UX, Database & SEO (Prioritas Sedang)

### <a id="issue-11"></a>ISSUE-11: Pemecahan Komponen Raksasa Monolitik (> 500 – 1.400 Baris)
- **Kategori:** Code Quality / Maintenance
- **Tingkat Keparahan:** 🟡 **P2 — Sedang**
- **File Terdampak:**
  - `app/admin/calendar/calendar-client.tsx` (1.469 baris)
  - `app/admin/bookings/bookings-client.tsx` (967 baris)
  - `src/modules/booking/components/package-manager.tsx` (781 baris)
  - `app/admin/history/history-client.tsx` (697 baris)
  - `src/modules/admin-management/components/admin-manager.tsx` (690 baris)
- **Deskripsi Masalah:**
  Ukuran komponen klien sangat besar, melanggar batas maksimal AGENTS.md (≤ 200 baris per file). Ini menyebabkan re-render berat dan sulit dirawat.
- **Rekomendasi Solusi:**
  Pecah menjadi sub-komponen terisolasi:
  - Ekstrak dialog modal ke `reschedule-modal.tsx`, `booking-detail-modal.tsx`, `cancel-confirm-modal.tsx`.
  - Ekstrak tabel dan filter toolbar ke komponen tersendiri.
- **Acceptance Criteria:**
  - [ ] Masing-masing file komponen baru berada di bawah 200–250 baris dengan tanggung jawab tunggal.

---

### <a id="issue-12"></a>ISSUE-12: Polling Kasar Halaman Sukses & Blank Screen Form Booking Saat Error
- **Kategori:** Frontend & UX
- **Tingkat Keparahan:** 🟡 **P2 — Sedang**
- **File Terdampak:** `app/(public)/book/success/page.tsx`, `app/(public)/book/page.tsx`
- **Deskripsi Masalah:**
  1. Halaman sukses menggunakan inline `<script dangerouslySetInnerHTML>` dengan `window.location.reload()` setiap 3 detik. Pendekatan ini kasar, boros request, dan rentan blokir CSP.
  2. Halaman `/book` me-return `null` jika paket kosong atau database error, menampilkan layar putih kosong ke pengunjung.
- **Rekomendasi Solusi:**
  1. Ubah polling di halaman sukses menjadi React client component yang melakukan server action polling atau SWR tanpa me-reload seluruh halaman.
  2. Buat komponen fallback visual yang elegan di `/book` jika database bermasalah, dilengkapi tombol *"Muat Ulang Halaman"*.
- **Acceptance Criteria:**
  - [ ] Tidak ada raw script polling reload di DOM.
  - [ ] Form booking menampilkan status error informatif jika data gagal diambil.

---

### <a id="issue-13"></a>ISSUE-13: Standarisasi Enum Status Booking & Pembersihan Residu Midtrans
- **Kategori:** Database & Prisma Schema
- **Tingkat Keparahan:** 🟡 **P2 — Sedang**
- **File Terdampak:** `prisma/schema.prisma`
- **Deskripsi Masalah:**
  1. `Booking.status` dan `Booking.paymentStatus` bertipe `String` bebas, sehingga rawan inkonsistensi (`PENDING`, `Pending`, `Confirmed`, `APPROVED`, `LUNAS`).
  2. Nama kolom masih mengusung nama Midtrans (`snapToken`, `snapUrl`) meskipun sudah migrasi ke DOKU Hosted Checkout.
- **Rekomendasi Solusi:**
  1. Buat Prisma Enum:
     ```prisma
     enum BookingStatus {
       PENDING
       APPROVED
       REJECTED
       CANCELLED
       LUNAS
     }

     enum PaymentStatus {
       PENDING
       DP_PAID
       PAID
       FAILED
       REFUNDED
     }
     ```
  2. Ganti nama kolom `snapToken` dan `snapUrl` menjadi `paymentToken` dan `paymentUrl`.
- **Acceptance Criteria:**
  - [ ] Prisma migration berhasil dijalankan dan seluruh kode sinkron dengan enum baru.

---

### <a id="issue-14"></a>ISSUE-14: Proteksi Skrip `seed.ts` dari Wipe Production & Pengadaan `.env.example`
- **Kategori:** DevOps & Database
- **Tingkat Keparahan:** 🟡 **P2 — Sedang**
- **File Terdampak:** `prisma/seed.ts`, `.env.example`
- **Deskripsi Masalah:**
  1. `prisma/seed.ts` mengeksekusi `await prisma.booking.deleteMany({})` secara agresif. Jika terpicu di production, seluruh data transaksi terhapus seketika.
  2. Tidak ada file `.env.example` sebagai referensi environment variables.
- **Rekomendasi Solusi:**
  1. Pasang guard di awal `prisma/seed.ts`:
     ```typescript
     if (process.env.NODE_ENV === "production") {
       throw new Error("Seeding database diblokir di environment production demi keamanan data!");
     }
     ```
  2. Buat file `.env.example` yang mencantumkan seluruh variabel environment yang dibutuhkan.
- **Acceptance Criteria:**
  - [ ] `seed.ts` gagal dengan aman jika dijalankan di production.
  - [ ] File `.env.example` tersedia di root proyek.

---

### <a id="issue-15"></a>ISSUE-15: Atribut `lang="id"`, Halaman Error Boundary (`error.tsx`, `not-found.tsx`), & SEO
- **Kategori:** SEO & Aksesibilitas
- **Tingkat Keparahan:** 🟡 **P2 — Sedang**
- **File Terdampak:** `app/layout.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/sitemap.ts`, `app/robots.ts`
- **Deskripsi Masalah:**
  1. `app/layout.tsx` menggunakan `<html lang="en">`, padahal seluruh website berbahasa Indonesia.
  2. Tidak ada file penanganan Next.js khusus: `not-found.tsx` (404), `error.tsx` (500 Error Boundary), dan `loading.tsx`.
  3. Belum ada `sitemap.ts` dan `robots.ts` untuk memblokir bot mengindeks rute internal `/admin`.
- **Rekomendasi Solusi:**
  1. Ganti `lang="en"` menjadi `lang="id"`.
  2. Buat halaman editorial kustom untuk `not-found.tsx` dan `error.tsx`.
  3. Implementasikan `robots.ts` yang melarang crawler mengindeks `/admin/*` dan `/book/success*`.
  4. Implementasikan dynamic `sitemap.ts` yang mencakup `/`, `/services`, `/portfolio`, `/schedule`, `/pricing`, `/testimonials`, `/contact`.
- **Acceptance Criteria:**
  - [ ] Halaman 404 dan 500 memiliki desain konsisten monokrom editorial studio.
  - [ ] `sitemap.xml` dan `robots.txt` dapat diakses di browser.

---

## 🟢 P3 — Kualitas Kode & Pengujian (Prioritas Rendah)

### <a id="issue-16"></a>ISSUE-16: Pengadaan Testing Suite (Vitest) untuk Business Logic Use-Cases
- **Kategori:** Testing / QA
- **Tingkat Keparahan:** 🟢 **P3 — Rendah**
- **File Terdampak:** Root config, `src/modules/**/__tests__`
- **Deskripsi Masalah:**
  Saat ini proyek memiliki 0% automated test coverage. Perubahan logika bentrok jadwal, rescheduling, dan perhitungan DP rawan menimbulkan bug regresi yang tidak terdeteksi sebelum rilis.
- **Rekomendasi Solusi:**
  1. Pasang Vitest: `npm install -D vitest @vitejs/plugin-react`.
  2. Tulis unit test untuk use-cases penting:
     - `create-booking.use-case.test.ts`
     - `reschedule-booking.use-case.test.ts`
     - `booking-overlap.test.ts`
- **Acceptance Criteria:**
  - [ ] Perintah `npm run test` berjalan dan lulus untuk use-case kritis.

---

*Dokumen ini dapat digunakan sebagai referensi sprint atau dipecah menjadi GitHub Issues resmi.*
