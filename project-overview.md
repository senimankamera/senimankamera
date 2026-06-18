# Seniman Kamera — Project Overview

> Platform manajemen studio fotografi profesional yang menggabungkan portofolio publik, sistem booking klien, dan panel admin terintegrasi.

---

## Deskripsi Singkat

**Seniman Kamera** adalah aplikasi web full-stack untuk studio fotografi bergaya editorial. Aplikasi ini memiliki dua sisi utama:

- **Sisi Publik** — Landing page, portofolio galeri, dan halaman booking untuk calon klien.
- **Sisi Admin** — Dashboard manajemen lengkap untuk mengelola booking, kalender, galeri, paket harga, dan kategori layanan.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Base UI |
| Database ORM | Prisma 7 |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Payment | Midtrans (Snap) |
| Notifikasi | Telegram Bot API |
| File Upload | Supabase Storage + Sharp (image processing) |
| Drag & Drop | dnd-kit |
| Table | TanStack Table v8 |
| Charts | Recharts |
| Form Validation | Zod v4 |
| Toast Notification | Sonner |
| Export Data | xlsx |

---

## Struktur Direktori

```
senimankamera/
├── app/                        # Next.js App Router (routes & pages)
│   ├── (public)/               # Route group publik (tanpa auth)
│   │   ├── page.tsx            # Landing page / Homepage
│   │   ├── portfolio/          # Halaman galeri portofolio
│   │   ├── services/           # Halaman layanan & paket harga
│   │   └── book/               # Halaman form booking klien
│   ├── admin/                  # Route panel admin (butuh auth)
│   │   ├── page.tsx            # Dashboard ringkasan
│   │   ├── bookings/           # Manajemen daftar booking
│   │   ├── calendar/           # Kalender jadwal sesi foto
│   │   ├── recap/              # Rekap & ekspor data booking
│   │   ├── galleries/          # Manajemen galeri foto/video
│   │   ├── packages/           # Manajemen paket layanan
│   │   └── categories/         # Manajemen kategori
│   ├── login/                  # Halaman login admin
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global CSS
│
├── src/
│   ├── modules/                # Domain-driven feature modules
│   │   ├── auth/               # Autentikasi (login, logout)
│   │   ├── booking/            # Fitur booking (CRUD, status, jadwal)
│   │   ├── gallery/            # Fitur galeri (upload, reorder, delete)
│   │   └── calendar/           # Fitur kalender & blokir tanggal
│   └── infrastructure/         # Integrasi layanan eksternal
│       ├── prisma/             # Prisma client instance
│       ├── supabase/           # Supabase client (server & browser)
│       ├── midtrans/           # Integrasi payment gateway Midtrans
│       └── telegram/           # Notifikasi via Telegram Bot
│
├── components/                 # Shared UI components
│   ├── ui/                     # shadcn/ui component library
│   ├── admin-sidebar.tsx       # Navigasi sidebar panel admin
│   ├── header.tsx              # Header publik
│   ├── footer.tsx              # Footer publik
│   ├── login-form.tsx          # Form login
│   ├── modal-provider.tsx      # Global modal provider
│   └── session-timeout.tsx     # Penanganan sesi kedaluwarsa
│
├── prisma/
│   ├── schema.prisma           # Skema database
│   ├── seed.ts                 # Data seed awal
│   └── migrations/             # Riwayat migrasi database
│
├── lib/                        # Utility functions
├── hooks/                      # Custom React hooks
├── public/                     # Static assets (logo, gambar)
└── next.config.ts              # Konfigurasi Next.js
```

---

## Arsitektur Module

Setiap feature module di `src/modules/` mengikuti pola layered architecture:

```
src/modules/<feature>/
├── actions/        # Next.js Server Actions (entry point dari UI)
├── use-cases/      # Business logic (orkestrasi antar layer)
├── repositories/   # Akses database via Prisma
├── schemas/        # Validasi input dengan Zod
└── components/     # React components spesifik modul
```

---

## Database Models

| Model | Deskripsi |
|---|---|
| `Gallery` | Item galeri (foto/video) dengan metadata (kategori, sub-kategori, aspek rasio, ukuran file) |
| `Client` | Data klien yang melakukan booking |
| `Booking` | Pesanan pemotretan dengan status, tanggal acara, paket, dan info pembayaran |
| `Category` | Kategori layanan (e.g. Wedding, Prewedding, Portraits) |
| `Package` | Paket harga per kategori beserta fitur-fiturnya |
| `CalendarSlot` | Slot kalender per tanggal, terhubung ke booking |
| `PaymentTransaction` | Riwayat transaksi pembayaran (DP / FULL) |

---

## Alur Bisnis Utama

### 1. Booking oleh Klien (Website)
```
Klien mengisi form → Pilih kategori & paket → Pilih tanggal (cek kalender) 
→ Submit → Booking tersimpan (status: PENDING) → Notifikasi Telegram ke admin
→ Admin approve/reject → Klien bayar DP via Midtrans → Status update
```

### 2. Booking Manual oleh Admin
```
Admin buka halaman Booking → Tambah booking manual 
→ Isi data klien & tanggal → Tandai di kalender → Status: ManualBooking
```

### 3. Manajemen Galeri
```
Admin upload foto/video → Simpan ke Supabase Storage 
→ Metadata tersimpan di database → Drag & drop untuk reorder 
→ Tampil di halaman publik portofolio
```

---

## Halaman Publik

| Route | Deskripsi |
|---|---|
| `/` | Landing page dengan hero section, filosofi studio, dan koleksi unggulan |
| `/portfolio` | Galeri portofolio lengkap dengan filter kategori |
| `/services` | Halaman paket layanan dan harga |
| `/book` | Form booking dengan pemilihan paket dan kalender interaktif |

---

## Panel Admin

| Route | Deskripsi |
|---|---|
| `/admin` | Dashboard: statistik revenue, status booking, jadwal terdekat |
| `/admin/bookings` | Daftar semua booking dengan filter & aksi (approve, reject, reschedule) |
| `/admin/calendar` | Kalender visual jadwal pemotretan |
| `/admin/recap` | Rekap booking yang bisa diekspor ke Excel |
| `/admin/galleries` | Upload, kelola, dan reorder foto/video galeri |
| `/admin/packages` | CRUD paket layanan |
| `/admin/categories` | CRUD kategori layanan |

---

## Integrasi Eksternal

### Supabase
- **Auth**: Login admin menggunakan Supabase Auth (email + password).
- **Storage**: Penyimpanan file gambar dan video yang diupload ke galeri.
- **Database**: PostgreSQL diakses via Prisma menggunakan adapter `@prisma/adapter-pg`.

### Midtrans
- Digunakan untuk payment gateway klien (Snap).
- Mendukung pembayaran DP maupun FULL.
- Setiap transaksi dicatat di model `PaymentTransaction`.

### Telegram Bot
- Mengirim notifikasi ke admin saat ada booking baru masuk dari website.
- Menggunakan Telegram Bot API via HTTP request.

---

## Konfigurasi Environment

File `.env` diperlukan dengan variabel berikut (contoh):

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Midtrans
MIDTRANS_SERVER_KEY=...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## Menjalankan Project

```bash
# Install dependencies
npm install

# Jalankan migrasi database
npx prisma migrate dev

# (Opsional) Seed data awal
npx tsx prisma/seed.ts

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk halaman publik.  
Buka [http://localhost:3000/login](http://localhost:3000/login) untuk login ke panel admin.

---

## Catatan Penting

- **Server Actions** digunakan sebagai lapisan komunikasi antara client dan server — tidak ada API route terpisah.
- **Body size limit** untuk Server Actions di-set `100mb` untuk mendukung upload file besar.
- **`revalidate = 0`** pada halaman admin memastikan data selalu fresh dari database.
- **Session Timeout** diimplementasikan di sisi client untuk keamanan sesi admin.
- **Galeri** mendukung dua tipe media: `image` dan `video` (field `mediaType` di model `Gallery`).
