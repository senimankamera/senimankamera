import { z } from "zod";

export const CreateBookingSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap harus diisi minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(8, "Nomor WhatsApp wajib diisi"),
  instagram: z.string().min(1, "Instagram wajib diisi"),
  packageType: z.string().min(1, "Silakan pilih tipe paket"),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Jadwal tanggal tidak valid",
  }),
  eventTime: z.string().optional().or(z.literal("")),
  eventName: z.string().optional().or(z.literal("")),
  eventLocation: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentType: z.enum(["dp"]),
  sessionStartTime: z.string().optional(),
  sessionEndTime: z.string().optional(),
  categoryId: z.string().optional(),
});

export type CreateBookingInputType = z.infer<typeof CreateBookingSchema>;
