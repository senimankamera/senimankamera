import { NextRequest } from "next/server";
import crypto from "crypto";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { UpdateBookingStatusUseCase } from "@/src/modules/booking/use-cases/update-booking-status.use-case";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-yUtpU3q5y6s8Wj5I-V9P9JzX";
    const signatureSource = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureSource)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.warn("Unauthorized signature from Midtrans webhook:", signature_key);
      return Response.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    console.log(`Processing Midtrans webhook for Order ID: ${order_id}, Status: ${transaction_status}`);

    const bookingRepository = new BookingRepository();
    const calendarRepository = new CalendarRepository();
    const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(
      bookingRepository,
      calendarRepository
    );

    // Midtrans transaction status handling
    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        console.log(`Payment challenged for Order ID: ${order_id}`);
      } else if (fraud_status === "accept") {
        await updateBookingStatusUseCase.execute(order_id, "APPROVED");
        console.log(`Payment captured and approved for Order ID: ${order_id}`);
      }
    } else if (transaction_status === "settlement") {
      await updateBookingStatusUseCase.execute(order_id, "APPROVED");
      console.log(`Payment settled and approved for Order ID: ${order_id}`);
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      await updateBookingStatusUseCase.execute(order_id, "CANCELLED");
      console.log(`Payment cancelled/denied/expired for Order ID: ${order_id}`);
    } else if (transaction_status === "pending") {
      console.log(`Payment pending for Order ID: ${order_id}`);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error processing Midtrans webhook:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
