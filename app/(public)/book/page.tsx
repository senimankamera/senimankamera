import { BookingForm } from "@/src/modules/booking/components/booking-form";
import { Suspense } from "react";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";

export const revalidate = 0; // Dynamic route

async function BookingFormContainer() {
  const packageRepository = new PackageRepository();
  const bookingRepository = new BookingRepository();
  const categoryRepository = new CategoryRepository();

  const [packages, bookedDatesInfo, categories] = await Promise.all([
    packageRepository.findAll(),
    bookingRepository.getBookingsCalendarInfo(),
    categoryRepository.findAll(),
  ]);

  const plainPackages = packages.map((p: any) => ({
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      label: p.category.label,
      description: p.category.description,
      bookingType: p.category.bookingType,
    } : null,
    price: p.price,
    features: p.features,
    description: p.description,
    sessionDuration: p.sessionDuration,
  }));

  const plainCategories = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    label: c.label,
    description: c.description,
    bookingType: c.bookingType,
  }));

  return (
    <BookingForm
      initialPackages={plainPackages}
      categories={plainCategories}
      bookedDatesInfo={bookedDatesInfo}
    />
  );
}

export default function BookPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-20">
      <Suspense fallback={
        <div className="w-full max-w-xl mx-auto border border-border/40 p-8 md:p-12 text-center text-secondary font-sans text-xs">
          Memuat formulir pemesanan...
        </div>
      }>
        <BookingFormContainer />
      </Suspense>
    </div>
  );
}
