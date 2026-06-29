import { BookingPendingView } from "@/src/modules/booking/components/booking-pending-view";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    order_id?: string;
    payment_url?: string;
  }>;
}

export default async function BookingPendingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.order_id;
  const paymentUrl = resolvedParams.payment_url;

  if (!orderId) {
    redirect("/services");
  }

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center pt-16">
      <BookingPendingView orderId={orderId} paymentUrl={paymentUrl} />
    </div>
  );
}
