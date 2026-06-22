# Issue: Loophole Pemesanan (Pemesanan Pending Tersimpan Saat Pembatalan Pembayaran / Error Midtrans)

## 📌 Deskripsi Bug

Saat ini, ketika pemesan melakukan checkout di halaman booking publik:
1. **Kasus Pembatalan (Close Modal Midtrans Snap)**: Jika pengguna menutup pop-up/modal pembayaran Midtrans Snap secara sengaja, data pemesanan sudah telanjur tersimpan di database dengan status `PENDING`. Ini menyebabkan jadwal/slot kalender terblokir secara permanen oleh pesanan yang tidak dibayar.
2. **Kasus Error Server Midtrans**: Jika ada kendala koneksi ke server Midtrans (misalnya saat pengujian lokal dengan jaringan terputus), error tersebut di-catch di UseCase, tetapi proses pembuatan baris database tetap dilanjutkan. Hasilnya, booking tersimpan dengan status `PENDING` tanpa token/URL Snap yang valid.

---

## 🔍 Detail Masalah di Kode

### 1. Error Midtrans Tetap Melakukan DB Write
Di dalam file [create-booking.use-case.ts](file:///d:/Project/seniman%20kamera/senimankamera/src/modules/booking/use-cases/create-booking.use-case.ts#L122-L143):
```typescript
    try {
      snapResult = await midtransService.createSnapTransaction({
        // ... parameter
      });
    } catch (err) {
      console.error("Failed to create Midtrans Snap transaction, using fallback:", err);
      // BUG: Error ditangkap tapi kode di bawah tetap dijalankan
    }

    const data: CreateBookingInput = {
      // ...
      snapToken: snapResult.token || undefined,
      status: "PENDING",
    };

    // DB write tetap dieksekusi meskipun snapResult kosong/error
    const booking = await this.bookingRepository.createBooking(data);
```

### 2. Close / Cancel di Modal Snap Tidak Melakukan Rollback DB
Di dalam komponen klien [booking-form.tsx](file:///d:/Project/seniman%20kamera/senimankamera/src/modules/booking/components/booking-form.tsx#L302-L326):
```typescript
        if (snapToken && (window as any).snap) {
          (window as any).snap.pay(snapToken, {
            onSuccess: function (result: any) {
              router.push(`/book/success?order_id=${bookingData.id}`);
            },
            onPending: function (result: any) {
              setServerError("Pembayaran Anda sedang tertunda...");
            },
            onError: function (result: any) {
              setServerError("Pembayaran gagal. Silakan coba kembali.");
              // BUG: Tidak ada aksi rollback/penghapusan booking di DB
            },
            onClose: function () {
              setServerError("Pembayaran belum diselesaikan...");
              // BUG: Tidak ada aksi rollback/penghapusan booking di DB ketika modal ditutup
            },
          });
        }
```

---

## ⚠️ Dampak
* **Blokir Jadwal**: Slot tanggal/waktu yang sudah dipilih akan terblokir dari sistem pemesanan karena status `PENDING` dianggap memblokir tanggal di repositori (metode `isDateBooked` atau `isTimeSlotOverlapping` mengecek semua pesanan aktif). Hal ini mencegah pelanggan asli memesan jadwal tersebut.
* **Sampah Database**: Tabel `Booking` akan dipenuhi baris-baris sampah dengan status `PENDING` yang tidak akan pernah diselesaikan pembayarannya.

---

## 🛠️ Rekomendasi Solusi

### Solusi 1: Mencegah DB Write Saat Midtrans Error
Ubah [create-booking.use-case.ts](file:///d:/Project/seniman%20kamera/senimankamera/src/modules/booking/use-cases/create-booking.use-case.ts) agar **melempar error** (throw error) ketika transaksi Snap gagal dibuat. Jangan gunakan fallback kosong.
```typescript
    // Jangan catch error di sini jika ingin membatalkan booking
    const snapResult = await midtransService.createSnapTransaction({
      orderId: tempOrderId,
      grossAmount: dpAmountIdr,
      customerDetails: { ... },
      itemDetails: [ ... ],
      baseUrl,
    });
    
    // Atau jika di-catch, lempar ulang error:
    // catch (err) { throw new Error("Gagal terhubung ke sistem pembayaran Midtrans. Silakan coba lagi."); }
```

### Solusi 2: Otomatis Hapus Booking Saat Pengguna Menutup Modal / Gagal
Gunakan server action `cancelPendingBookingAction(bookingId)` yang sudah tersedia di [booking-form.tsx](file:///d:/Project/seniman%20kamera/senimankamera/src/modules/booking/components/booking-form.tsx) di dalam callback `onClose` dan `onError`:
```typescript
            onError: function (result: any) {
              setServerError("Pembayaran gagal.");
              // Panggil fungsi pembatalan otomatis
              handleCancelPayment(); 
            },
            onClose: function () {
              setServerError("Pembayaran belum diselesaikan.");
              // Panggil fungsi pembatalan otomatis jika user membatalkan
              handleCancelPayment();
            },
```

### Solusi 3: Background Cleanup Job (Opsional tapi Direkomendasikan)
Buat background cron job atau script berkala (misalnya berjalan setiap 15 menit) menggunakan Supabase Edge Functions atau pg_cron untuk menghapus booking dengan status `PENDING` yang usianya sudah lebih dari 15-30 menit. Ini akan membersihkan booking yang ditinggalkan oleh pemesan yang tiba-tiba menutup tab browser saat pembayaran berlangsung.
