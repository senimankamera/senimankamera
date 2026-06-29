import { z } from "zod";

export const BookingTrackingSchema = z.object({
  bookingId: z.string().trim().min(1, { message: "ID Pesanan (Booking ID) wajib diisi." }),
  email: z.string().trim().email({ message: "Format email tidak valid." }),
});

export type BookingTrackingInput = z.infer<typeof BookingTrackingSchema>;
