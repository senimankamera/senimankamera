"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBookingAction } from "../actions/create-booking.action";
import { getBookedDatesWithInfoAction } from "../actions/get-booked-dates-with-info.action";
import { cancelPendingBookingAction } from "../actions/cancel-pending-booking.action";
import { CreateBookingSchema } from "../schemas/create-booking.schema";
import { AlertCircle, CheckCircle2, Check, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Wizard steps components
import { StepPilihPaket } from "./step-pilih-paket";
import { StepPilihTanggal } from "./step-pilih-tanggal";
import { StepDataPemesan } from "./step-data-pemesan";
import { StepPembayaran } from "./step-pembayaran";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
  description: string | null;
  bookingType?: string;
}

interface PackageItem {
  id: string;
  name: string;
  categoryId: string;
  category?: CategoryItem | null;
  price: number;
  features: string[];
  description: string | null;
  sessionDuration: number | null;
}

interface BookedDateInfo {
  date: string;
  eventName: string;
  clientName: string;
  status: string;
}

interface BookingFormProps {
  initialPackages: PackageItem[];
  categories: CategoryItem[];
  bookedDatesInfo: BookedDateInfo[];
}

export function BookingForm({ initialPackages, categories, bookedDatesInfo }: BookingFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState(1);

  // Form Inputs
  const [packageType, setPackageType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [notes, setNotes] = useState("");

  // States
  const [bookedDates, setBookedDates] = useState<BookedDateInfo[]>(bookedDatesInfo || []);
  const [selectedCategoryBookingType, setSelectedCategoryBookingType] = useState("DATE_ONLY");
  const [selectedSessionDuration, setSelectedSessionDuration] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<{
    id: string;
    dpAmount: number | null;
    totalAmount: number | null;
  } | null>(null);
  const [activeSnapToken, setActiveSnapToken] = useState("");
  const [activeSnapUrl, setActiveSnapUrl] = useState("");

  // Terms & Conditions States
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);

  // Helper to calculate end time based on session duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    if (!startTime) return "";
    const [hours, mins] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + durationMinutes);
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  // Fetch updated booked dates client-side
  useEffect(() => {
    async function loadBookedDates() {
      const response = await getBookedDatesWithInfoAction();
      if (response.success && response.data) {
        setBookedDates(response.data);
      }
    }
    loadBookedDates();
  }, []);

  // Dynamically load Midtrans Snap JS SDK
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-_k7eRgttHZuqM1mq";
    const isSandbox = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== "true";
    const snapScriptUrl = isSandbox
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js";

    // Add script tag to body
    const script = document.createElement("script");
    script.src = snapScriptUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Pre-fill packageType from query param
  useEffect(() => {
    const pkg = searchParams.get("package");
    const categoryId = searchParams.get("categoryId");
    if (pkg) {
      const matched = initialPackages.find(
        (p) => p.name.toLowerCase() === pkg.toLowerCase() && (!categoryId || p.categoryId === categoryId)
      );
      if (matched) {
        setPackageType(matched.name);
        setSelectedCategoryId(matched.categoryId);
        
        // Set category properties so step 2 calendar loads correctly
        const cat = categories.find((c) => c.id === matched.categoryId);
        if (cat) {
          setSelectedCategoryBookingType(cat.bookingType || "DATE_ONLY");
          setSelectedSessionDuration(matched.sessionDuration || null);
          
          if (cat.bookingType === "TIME_BASED") {
            setEventName((prev) => (prev === "" ? "Foto Studio Session" : prev));
            setEventLocation((prev) => (prev === "" ? "Studio" : prev));
          }
        }
      }
    }
  }, [searchParams, initialPackages, categories]);

  // Find selected package object to get price details
  const selectedPackageObj = initialPackages.find(
    (p) => p.name === packageType && (!selectedCategoryId || p.categoryId === selectedCategoryId)
  );
  const packagePrice = selectedPackageObj?.price || 0;

  const handleNext = () => {
    setServerError(null);
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setServerError(null);
    if (createdBooking?.id) {
      handleCancelPayment();
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleCancelPayment = async () => {
    if (!createdBooking?.id) return;

    setServerError(null);
    startTransition(async () => {
      const response = await cancelPendingBookingAction(createdBooking.id);
      if (response.success) {
        setActiveSnapToken("");
        setActiveSnapUrl("");
        setCreatedBooking(null);
      } else {
        setServerError(response.error || "Gagal membatalkan pembayaran sebelumnya. Silakan coba kembali.");
      }
    });
  };

  const handleOpenTermsModal = async () => {
    if (activeSnapToken) {
      handleSubmitBooking();
      return;
    }

    setIsLoadingTerms(true);
    setServerError(null);
    try {
      const { getTermsContentAction } = await import("../actions/get-terms-content.action");
      const res = await getTermsContentAction(selectedCategoryBookingType);
      if (res.success && res.data) {
        setTermsContent(res.data);
        setIsTermsModalOpen(true);
      } else {
        setServerError(res.error || "Gagal memuat Syarat & Ketentuan.");
      }
    } catch (err) {
      console.error(err);
      setServerError("Gagal memuat Syarat & Ketentuan.");
    } finally {
      setIsLoadingTerms(false);
    }
  };

  const handleConfirmTerms = () => {
    setIsTermsModalOpen(false);
    handleSubmitBooking();
  };

  const handleSubmitBooking = async () => {
    setServerError(null);

    // If we already have a snap token, just re-launch payment popup
    if (activeSnapToken) {
      if ((window as any).snap) {
        (window as any).snap.pay(activeSnapToken, {
          onSuccess: function (result: any) {
            setCurrentStep(5);
          },
          onPending: function (result: any) {
            setServerError("Pembayaran Anda sedang tertunda. Silakan selesaikan transfer bank Anda, atau klik tombol 'Bayar Sekarang' di bawah untuk membuka kembali detail instruksi pembayaran.");
          },
          onError: function (result: any) {
            setServerError("Pembayaran gagal. Silakan coba kembali.");
          },
          onClose: function () {
            setServerError("Pembayaran belum diselesaikan. Anda dapat mencoba kembali dengan mengklik tombol di bawah.");
          },
        });
      } else if (activeSnapUrl) {
        window.location.href = activeSnapUrl;
      }
      return;
    }

    const isTimeBased = selectedCategoryBookingType === "TIME_BASED";
    const finalEventTime = eventTime;
    const finalEventName = eventName || (isTimeBased ? "Foto Studio Session" : "");
    const finalEventLocation = eventLocation || (isTimeBased ? "Studio" : "");

    const formData = {
      fullName,
      email,
      phoneNumber,
      packageType,
      bookingDate,
      eventTime: finalEventTime,
      eventName: finalEventName,
      eventLocation: finalEventLocation,
      notes,
      paymentType: "dp" as const,
      sessionStartTime: isTimeBased ? eventTime : undefined,
      categoryId: selectedCategoryId,
    };

    // Client-side validation using Zod
    const validation = CreateBookingSchema.safeParse(formData);
    if (!validation.success) {
      setServerError(
        validation.error.issues[0]?.message || "Gagal memvalidasi formulir."
      );
      return;
    }

    startTransition(async () => {
      const response = await createBookingAction(validation.data);
      if (response.success && response.data) {
        const bookingData = response.data;
        const snapToken = bookingData.snapToken;
        const snapUrl = bookingData.snapUrl;

        // Save states for potential retry
        setCreatedBooking({
          id: bookingData.id,
          dpAmount: bookingData.dpAmount,
          totalAmount: bookingData.totalAmount,
        });
        setActiveSnapToken(snapToken || "");
        setActiveSnapUrl(snapUrl || "");

        // If Midtrans Snap is loaded, trigger the checkout modal popup
        if (snapToken && (window as any).snap) {
          (window as any).snap.pay(snapToken, {
            onSuccess: function (result: any) {
              setCurrentStep(5);
            },
            onPending: function (result: any) {
              setServerError("Pembayaran Anda sedang tertunda. Silakan selesaikan transfer bank Anda, atau klik tombol 'Bayar Sekarang' di bawah untuk membuka kembali detail instruksi pembayaran.");
            },
            onError: function (result: any) {
              setServerError("Pembayaran gagal. Silakan coba kembali.");
            },
            onClose: function () {
              setServerError("Pembayaran belum diselesaikan. Anda dapat mencoba kembali dengan mengklik tombol di bawah.");
            },
          });
        } else if (snapUrl) {
          // Fallback redirect if script not fully loaded
          window.location.href = snapUrl;
        } else {
          setCurrentStep(5);
        }
      } else {
        setServerError(response.error || "Gagal mengirim pesanan booking.");
      }
    });
  };

  const steps = [
    { step: 1, label: "Paket" },
    { step: 2, label: "Jadwal" },
    { step: 3, label: "Pemesan" },
    { step: 4, label: "Pembayaran" },
    { step: 5, label: "Konfirmasi" },
  ];

  // Render Step 5 (Konfirmasi Sukses)
  if (currentStep === 5 && createdBooking) {
    const waText = encodeURIComponent(
      "Halo Kak, saya sudah melakukan booking dan pembayaran DP untuk acara saya. Mohon dibantu untuk proses konfirmasi booking. Terima kasih."
    );
    const waUrl = `https://wa.me/6285721598190?text=${waText}`;

    return (
      <div className="w-full max-w-xl mx-auto px-6 py-12 border border-border/40 bg-card text-center flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
        <CheckCircle2 className="w-16 h-16 text-green-700 mb-6 stroke-1 animate-pulse" />
        <h2 className="font-serif text-3xl text-primary mb-3 font-medium">Pemesanan Berhasil</h2>
        
        <p className="font-sans text-xs text-secondary font-light mb-8 max-w-sm leading-relaxed">
          Pemesanan Anda telah tercatat dengan status <span className="font-semibold text-yellow-600">Menunggu Persetujuan</span>. Silakan hubungi kami untuk mempercepat proses konfirmasi booking.
        </p>

        {/* Invoice Summary Card */}
        <div className="w-full border border-border/40 bg-muted/20 p-6 text-left mb-8 font-sans text-xs space-y-3">
          <div className="flex justify-between border-b border-border/20 pb-2.5">
            <span className="text-secondary font-semibold uppercase tracking-wider text-[10px]">Detail</span>
            <span className="text-primary font-bold">Sesi {packageType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Nama Klien:</span>
            <span className="text-primary font-medium">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Nama Acara:</span>
            <span className="text-primary font-medium">{eventName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Tanggal Sesi:</span>
            <span className="text-primary font-medium">
              {new Date(bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Waktu & Lokasi:</span>
            <span className="text-primary font-medium text-right max-w-[200px] truncate" title={eventLocation}>
              {selectedCategoryBookingType === "TIME_BASED" && selectedSessionDuration
                ? `${eventTime} – ${calculateEndTime(eventTime, selectedSessionDuration)}`
                : eventTime} WIB - {selectedCategoryBookingType === "TIME_BASED" ? "Studio" : eventLocation}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-dashed border-border/30">
            <span className="text-secondary">Total Biaya:</span>
            <span className="text-primary font-medium">{"Rp. " + (createdBooking.totalAmount || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 font-bold text-primary border-t border-border/30">
            <span>
              {selectedCategoryBookingType === "TIME_BASED"
                ? "Uang Muka (DP Flat):"
                : "Uang Muka (DP 20%):"}
            </span>
            <span>{"Rp. " + (createdBooking.dpAmount || 0).toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button 
            onClick={() => window.open(waUrl, "_blank")}
            className="rounded-none font-sans text-xs uppercase tracking-widest py-6 text-white bg-primary hover:opacity-90 w-full flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            Hubungi via WhatsApp
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => router.push("/portfolio")}
              variant="outline"
              className="rounded-none font-sans text-[10px] uppercase tracking-widest py-4 border-border text-primary hover:bg-neutral-100 flex-1 cursor-pointer"
            >
              Lihat Portofolio
            </Button>
            <Button 
              onClick={() => router.push("/")}
              variant="ghost"
              className="rounded-none font-sans text-[10px] uppercase tracking-widest py-4 text-secondary hover:text-primary flex-1 cursor-pointer"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto border border-border/40 bg-card p-6 md:p-10 relative">
      {/* Stepper Progress */}
      <div className="mb-10 max-w-lg mx-auto">
        <div className="flex items-center justify-between relative">
          {steps.map((s) => {
            const isCompleted = currentStep > s.step;
            const isActive = currentStep === s.step;
            return (
              <div key={s.step} className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={cn(
                    "w-7 h-7 rounded-none flex items-center justify-center text-xs font-sans font-bold border transition-all duration-300",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "bg-card border-primary text-primary ring-2 ring-primary/20"
                      : "bg-card border-border text-secondary"
                  )}
                >
                  {isCompleted ? "✓" : s.step}
                </div>
                <span
                  className={cn(
                    "text-[9px] uppercase tracking-wider font-bold mt-2 text-center hidden sm:block",
                    isActive ? "text-primary font-bold" : "text-secondary font-light"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
          {/* Background Progress Line */}
          <div className="absolute top-[13px] left-0 right-0 h-[1px] bg-border z-0" />
        </div>
      </div>

      {serverError && (
        <div className={cn(
          "mb-6 p-4 font-sans text-xs flex items-center gap-2.5 border",
          serverError.includes("tertunda")
            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300"
            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300"
        )}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Steps Content wrapper */}
      <div className="animate-[fadeIn_0.3s_ease-out]">
        {currentStep === 1 && (
          <StepPilihPaket
            initialPackages={initialPackages}
            categories={categories}
            selectedPackageName={packageType}
            selectedCategoryId={selectedCategoryId}
            onSelectPackage={setPackageType}
            onCategoryChange={(categoryId, bookingType, sessionDuration) => {
              setSelectedCategoryId(categoryId);
              setSelectedCategoryBookingType(bookingType);
              setSelectedSessionDuration(sessionDuration);
              if (bookingType === "TIME_BASED") {
                setEventName((prev) => prev === "" ? "Foto Studio Session" : prev);
                setEventLocation((prev) => (prev === "" ? "Studio" : prev));
              }
            }}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <StepPilihTanggal
            bookedDates={bookedDates}
            selectedDate={bookingDate}
            selectedTime={eventTime}
            onSelectDate={setBookingDate}
            onSelectTime={setEventTime}
            bookingType={selectedCategoryBookingType}
            sessionDuration={selectedSessionDuration}
            packageName={packageType}
            categoryName={selectedPackageObj?.category?.label || selectedPackageObj?.category?.name}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <StepDataPemesan
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            eventName={eventName}
            eventLocation={eventLocation}
            notes={notes}
            onChangeFields={(fields) => {
              if (fields.fullName !== undefined) setFullName(fields.fullName);
              if (fields.email !== undefined) setEmail(fields.email);
              if (fields.phoneNumber !== undefined) setPhoneNumber(fields.phoneNumber);
              if (fields.eventName !== undefined) setEventName(fields.eventName);
              if (fields.eventLocation !== undefined) setEventLocation(fields.eventLocation);
              if (fields.notes !== undefined) setNotes(fields.notes);
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <StepPembayaran
            packageName={packageType}
            packagePrice={packagePrice}
            bookingDate={bookingDate}
            eventTime={
              selectedCategoryBookingType === "TIME_BASED" && selectedSessionDuration
                ? `${eventTime} – ${calculateEndTime(eventTime, selectedSessionDuration)}`
                : eventTime
            }
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            eventName={eventName}
            eventLocation={eventLocation}
            notes={notes}
            isPending={isPending || isLoadingTerms}
            bookingType={selectedCategoryBookingType}
            onSubmit={handleOpenTermsModal}
            onBack={handleBack}
            isPayRetry={!!activeSnapToken}
            onCancelPayment={handleCancelPayment}
          />
        )}
      </div>

      {/* Terms & Conditions Modal Overlay */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-card border border-border/40 w-full max-w-lg p-6 md:p-8 space-y-6 rounded-none relative shadow-2xl max-h-[90vh] flex flex-col font-sans text-xs">
            <h3 className="font-serif text-lg text-primary font-semibold border-b border-border/20 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary animate-pulse" />
              Syarat & Ketentuan Pemesanan
            </h3>

            {/* Scrollable Terms Content */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-[150px] max-h-[350px] border border-border/20 bg-muted/10 p-4 font-sans text-xs text-secondary whitespace-pre-wrap leading-relaxed rounded-none select-none">
              {termsContent}
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4.5 w-4.5 rounded-none border-border accent-primary cursor-pointer"
              />
              <span className="text-secondary leading-normal">
                Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang berlaku untuk sesi pemesanan ini.
              </span>
            </label>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTermsModalOpen(false);
                  setHasAcceptedTerms(false);
                }}
                disabled={isPending}
                className="font-sans text-xs uppercase tracking-widest py-4 px-6 rounded-none border-border flex-1 order-2 sm:order-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmTerms}
                disabled={!hasAcceptedTerms || isPending}
                className="font-sans text-xs uppercase tracking-widest py-4 px-8 rounded-none font-bold text-white bg-primary hover:opacity-90 flex-1 order-1 sm:order-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Lanjut ke Pembayaran"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
