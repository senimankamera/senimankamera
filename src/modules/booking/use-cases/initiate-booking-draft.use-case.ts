import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { BookingRepository } from "../repositories/booking.repository";
import { PackageRepository } from "../repositories/package.repository";
import { InitiateBookingDraftSchema, InitiateBookingDraftInputType } from "../schemas/booking-draft.schema";
import { DokuService } from "@/src/infrastructure/doku/doku.service";
import { generateBookingCode } from "@/lib/utils";
import crypto from "crypto";

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export class InitiateBookingDraftUseCase {
  constructor(
    private bookingDraftRepository: BookingDraftRepository,
    private bookingRepository: BookingRepository
  ) {}

  async execute(input: InitiateBookingDraftInputType, baseUrl?: string) {
    // Lazily clean up expired drafts
    try {
      await this.bookingDraftRepository.deleteExpiredDrafts();
    } catch (e) {
      console.error("Failed to run lazy cleanup for expired booking drafts:", e);
    }

    // Validate schema
    const parsed = InitiateBookingDraftSchema.parse(input);

    const bookingDate = new Date(parsed.bookingDate);

    // Get current date and time in Asia/Jakarta timezone
    const getJakartaTime = () => {
      const d = new Date();
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      });
      const parts = formatter.formatToParts(d);
      const year = parts.find(p => p.type === 'year')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const day = parts.find(p => p.type === 'day')?.value || '';
      const hour = parts.find(p => p.type === 'hour')?.value || '00';
      const minute = parts.find(p => p.type === 'minute')?.value || '00';
      return {
        dateStr: `${year}-${month}-${day}`, // YYYY-MM-DD
        hours: parseInt(hour, 10),
        minutes: parseInt(minute, 10)
      };
    };

    const jkTime = getJakartaTime();
    if (parsed.bookingDate === jkTime.dateStr) {
      const timeToCheck = parsed.sessionStartTime || parsed.eventTime;
      if (timeToCheck) {
        const [h, m] = timeToCheck.split(":").map(Number);
        const selectedMinutes = h * 60 + m;
        const currentMinutes = jkTime.hours * 60 + jkTime.minutes;
        if (selectedMinutes <= currentMinutes) {
          throw new Error("Waktu yang dipilih sudah terlewat hari ini. Silakan pilih waktu yang akan datang.");
        }
      }
    }

    // Get package price details
    const packageRepo = new PackageRepository();
    let targetPackage;
    if (parsed.categoryId) {
      const pkgs = await packageRepo.findByCategory(parsed.categoryId);
      targetPackage = pkgs.find((p: any) => p.name.toLowerCase() === parsed.packageType.toLowerCase());
    }
    if (!targetPackage) {
      targetPackage = await packageRepo.findByNameOrCategory(parsed.packageType);
    }

    const bookingType = targetPackage?.category?.bookingType ?? "DATE_ONLY";

    let calculatedEndTime: string | undefined = undefined;

    if (bookingType === "DATE_ONLY") {
      // Check if the date is already booked or blocked (including TIME_BASED_ACTIVE)
      const isBooked = await this.bookingRepository.isDateOccupiedForFullDay(bookingDate);
      if (isBooked) {
        throw new Error("Tanggal yang Anda pilih sudah dibooking. Silakan pilih tanggal lain.");
      }
    } else if (bookingType === "TIME_BASED") {
      // Check if the date is fully blocked (ManualBlock) or already booked by a DATE_ONLY package
      const isBlockedOrFull = await this.bookingRepository.isDateBooked(bookingDate);
      if (isBlockedOrFull) {
        throw new Error("Tanggal yang Anda pilih sudah dibooking atau diblokir. Silakan pilih tanggal lain.");
      }

      if (!parsed.sessionStartTime) {
        throw new Error("Jam mulai sesi harus ditentukan untuk kategori ini.");
      }

      const duration = targetPackage?.sessionDuration ?? 60; // Default 60 minutes
      calculatedEndTime = addMinutesToTime(parsed.sessionStartTime, duration);

      // Check if time slot is overlapping
      const isOverlapping = await this.bookingRepository.isTimeSlotOverlapping(
        bookingDate,
        parsed.sessionStartTime,
        calculatedEndTime
      );
      if (isOverlapping) {
        throw new Error("Waktu sesi yang dipilih bertabrakan dengan booking lain. Silakan pilih waktu lain.");
      }
    }

    const totalAmountIdr = targetPackage?.price || 1500000; // Default price if not found
    const DP_FLAT_TIME_BASED = 150_000;
    const dpAmountIdr =
      bookingType === "TIME_BASED" ? DP_FLAT_TIME_BASED : totalAmountIdr * 0.2;

    // Generate a booking ID (this will be the invoice_number for DOKU)
    const tempOrderId = generateBookingCode(targetPackage?.category?.code, targetPackage?.code);

    // Call DOKU Service to generate a Checkout payment URL
    const dokuService = new DokuService();
    let paymentUrl = "";

    try {
      const dokuResult = await dokuService.createCheckoutSession({
        invoiceNumber: tempOrderId,
        amount: dpAmountIdr,
        customerName: parsed.fullName,
        customerEmail: parsed.email,
        customerPhone: parsed.phoneNumber || undefined,
        itemName: `DP - ${targetPackage?.name || parsed.packageType}`,
        paymentDueMinutes: 20,
        callbackUrl: baseUrl ? `${baseUrl}/book/success?order_id=${tempOrderId}` : undefined,
      });
      paymentUrl = dokuResult.paymentUrl;
    } catch (err) {
      console.error("Failed to create DOKU Checkout session:", err);
      throw new Error("Gagal terhubung ke sistem pembayaran DOKU. Silakan coba lagi.");
    }

    // Set expiration time to 20 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    const draft = await this.bookingDraftRepository.createDraft({
      id: tempOrderId,
      fullName: parsed.fullName,
      email: parsed.email,
      phoneNumber: parsed.phoneNumber,
      instagram: parsed.instagram,
      packageType: targetPackage?.name || parsed.packageType,
      categoryId: parsed.categoryId,
      bookingDate: bookingDate,
      eventTime: bookingType === "TIME_BASED" ? parsed.sessionStartTime : parsed.eventTime,
      eventName: bookingType === "TIME_BASED" ? "Foto Studio Session" : parsed.eventName,
      eventLocation: bookingType === "TIME_BASED" ? "Studio" : parsed.eventLocation,
      notes: parsed.notes || undefined,
      sessionStartTime: parsed.sessionStartTime || undefined,
      sessionEndTime: calculatedEndTime || undefined,
      bookingType: bookingType,
      dpAmount: dpAmountIdr,
      totalAmount: totalAmountIdr,
      snapToken: undefined,          // DOKU tidak menggunakan client-side token
      snapUrl: paymentUrl || undefined, // Simpan payment.url DOKU di kolom snapUrl
      expiresAt: expiresAt,
    });

    return draft;
  }
}
