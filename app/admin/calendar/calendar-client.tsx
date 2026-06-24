"use client";

import { useState, useMemo, useTransition } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Lock, 
  Unlock, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  Info,
  AlertTriangle,
  X,
  CalendarDays,
  Check,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { blockDateAction } from "@/src/modules/calendar/actions/block-date.action";
import { unblockDateAction } from "@/src/modules/calendar/actions/unblock-date.action";
import { createManualBookingAction } from "@/src/modules/calendar/actions/create-manual-booking.action";
import { updateBookingStatusAction } from "@/src/modules/booking/actions/update-booking-status.action";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface Client {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  instagram: string | null;
}

interface Booking {
  id: string;
  clientId: string;
  client: Client;
  packageType: string;
  bookingDate: string;
  eventTime: string | null;
  eventName: string | null;
  eventLocation: string | null;
  notes: string | null;
  status: string;
  source: string;
}

interface CalendarSlot {
  id: string;
  date: string; // ISO
  status: string; // PendingApproval, Approved, ManualBooking, ManualBlock
  bookingId: string | null;
  booking: Booking | null;
  blockedReason: string | null;
  createdBy: string | null;
}

interface Package {
  id: string;
  name: string;
  price: number;
  categoryName?: string;
  bookingType?: string;
}

interface CalendarStats {
  activeBookings: number;
  pendingApproval: number;
  approved: number;
  bookingsThisMonth: number;
  blockedDates: number;
  cancelled: number;
}

interface TimeBasedBooking {
  id: string;
  clientId: string;
  client: Client;
  packageType: string;
  bookingDate: string;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  eventName: string | null;
  notes: string | null;
  status: string;
  source: string;
}

interface CalendarClientProps {
  initialSlots: CalendarSlot[];
  timeBasedBookings: TimeBasedBooking[];
  packages: Package[];
  stats: CalendarStats;
}

export function CalendarClient({ initialSlots, timeBasedBookings, packages, stats }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<CalendarSlot[]>(initialSlots);
  const [timeBookings, setTimeBookings] = useState<TimeBasedBooking[]>(timeBasedBookings);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [isPending, startTransition] = useTransition();
  const { confirm } = useModal();

  // Dialog states
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Manual booking form state
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    instagram: "",
    packageType: packages[0]?.name || "",
    eventTime: "10:00",
    eventName: "",
    eventLocation: "",
    notes: "",
  });
 
  const selectedPkg = useMemo(() => {
    return packages.find((p) => p.name === bookingForm.packageType);
  }, [packages, bookingForm.packageType]);

  // Helper YYYY-MM-DD
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateKey(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Prev month padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLast - i),
        isCurrentMonth: false,
        key: `prev-${prevMonthLast - i}`,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        key: `curr-${i}`,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return days;
  }, [currentDate]);

  // Find slot info for a date
  const getSlotForDate = (date: Date) => {
    const key = formatDateKey(date);
    return slots.find((s) => formatDateKey(new Date(s.date)) === key);
  };

  const selectedSlot = useMemo(() => {
    if (!selectedDate) return null;
    return slots.find((s) => formatDateKey(new Date(s.date)) === selectedDate);
  }, [selectedDate, slots]);

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return timeBookings.filter(
      (tb) => formatDateKey(new Date(tb.bookingDate)) === selectedDate
    ).sort((a, b) => (a.sessionStartTime || "").localeCompare(b.sessionStartTime || ""));
  }, [selectedDate, timeBookings]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Actions
  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !blockReason) return;

    startTransition(async () => {
      const res = await blockDateAction(selectedDate, blockReason);
      if (res.success && res.data) {
        setSlots((prev) => [...prev.filter(s => formatDateKey(new Date(s.date)) !== selectedDate), res.data]);
        setIsBlockOpen(false);
        setBlockReason("");
        toast.success("Tanggal berhasil diblokir!");
      } else {
        toast.error(res.error || "Gagal memblokir tanggal");
      }
    });
  };

  const handleUnblockDate = async () => {
    if (!selectedDate) return;
    const isConfirmed = await confirm("Apakah Anda yakin ingin membuka blokir tanggal ini?");
    if (!isConfirmed) return;

    startTransition(async () => {
      const res = await unblockDateAction(selectedDate);
      if (res.success) {
        setSlots((prev) => prev.filter(s => formatDateKey(new Date(s.date)) !== selectedDate));
        toast.success("Blokir tanggal dibuka.");
      } else {
        toast.error(res.error || "Gagal membuka blokir");
      }
    });
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    startTransition(async () => {
      const res = await createManualBookingAction({
        ...bookingForm,
        bookingDateStr: selectedDate,
      });

      if (res.success && res.data) {
        const isTimeBased = !!res.data.sessionStartTime;

        if (isTimeBased) {
          const newTimeBooking: TimeBasedBooking = {
            id: res.data.id,
            clientId: res.data.clientId,
            client: {
              fullName: bookingForm.fullName,
              email: bookingForm.email,
              phoneNumber: bookingForm.phoneNumber || null,
              instagram: bookingForm.instagram || null,
            },
            packageType: res.data.packageType,
            bookingDate: res.data.bookingDate,
            sessionStartTime: res.data.sessionStartTime,
            sessionEndTime: res.data.sessionEndTime,
            eventName: res.data.eventName,
            notes: res.data.notes,
            status: res.data.status,
            source: "manual",
          };

          setTimeBookings((prev) => [...prev, newTimeBooking]);

          // Add CalendarSlot if not already existing
          setSlots((prev) => {
            const hasSlot = prev.some(
              (s) => formatDateKey(new Date(s.date)) === formatDateKey(new Date(res.data.bookingDate))
            );
            if (!hasSlot) {
              const newSlot: CalendarSlot = {
                id: `slot-tb-${res.data.id}`,
                date: res.data.bookingDate,
                status: "TIME_BASED_ACTIVE",
                bookingId: null,
                booking: null,
                blockedReason: null,
                createdBy: "Admin",
              };
              return [...prev, newSlot];
            }
            return prev;
          });
        } else {
          // Map created booking to slot
          const newSlot: CalendarSlot = {
            id: `slot-${res.data.id}`,
            date: res.data.bookingDate,
            status: res.data.status,
            bookingId: res.data.id,
            booking: {
              id: res.data.id,
              clientId: res.data.clientId,
              client: {
                fullName: bookingForm.fullName,
                email: bookingForm.email,
                phoneNumber: bookingForm.phoneNumber || null,
                instagram: bookingForm.instagram || null,
              },
              packageType: res.data.packageType,
              bookingDate: res.data.bookingDate,
              eventTime: res.data.eventTime,
              eventName: res.data.eventName,
              eventLocation: res.data.eventLocation,
              notes: res.data.notes,
              status: res.data.status,
              source: "manual",
            },
            blockedReason: null,
            createdBy: "Admin",
          };
          setSlots((prev) => [...prev, newSlot]);
        }

        setIsBookingOpen(false);
        setBookingForm({
          fullName: "",
          email: "",
          phoneNumber: "",
          instagram: "",
          packageType: packages[0]?.name || "",
          eventTime: "10:00",
          eventName: "",
          eventLocation: "",
          notes: "",
        });
        toast.success("Manual booking berhasil dibuat!");
      } else {
        toast.error(res.error || "Gagal membuat manual booking");
      }
    });
  };

  const handleQuickStatusUpdate = async (id: string, status: string) => {
    const isConfirmed = await confirm(`Tandai booking ini sebagai ${status}?`);
    if (!isConfirmed) return;

    startTransition(async () => {
      const res = await updateBookingStatusAction(id, status);
      if (res.success && res.data) {
        // Update local slots state
        setSlots((prev) => {
          const statusUpper = status.toUpperCase();
          if (["REJECTED", "CANCELLED", "COMPLETED"].includes(statusUpper)) {
            // Non-locking status: delete the calendar slot block
            return prev.filter((s) => s.bookingId !== id);
          } else {
            // Update status
            return prev.map((s) =>
              s.bookingId === id
                ? { ...s, status: status, booking: s.booking ? { ...s.booking, status: status } : null }
                : s
            );
          }
        });

        // Update local timeBookings state
        setTimeBookings((prev) => {
          const statusUpper = status.toUpperCase();
          if (["REJECTED", "CANCELLED", "COMPLETED"].includes(statusUpper)) {
            const updated = prev.filter((tb) => tb.id !== id);
            // Check if there are any remaining active timeBookings for this date
            const targetBooking = prev.find((tb) => tb.id === id);
            if (targetBooking) {
              const dateKey = formatDateKey(new Date(targetBooking.bookingDate));
              const hasRemaining = updated.some(
                (tb) => formatDateKey(new Date(tb.bookingDate)) === dateKey
              );
              if (!hasRemaining) {
                // Remove the CalendarSlot from slots state
                setSlots((prevSlots) =>
                  prevSlots.filter(
                    (s) =>
                      !(
                        s.status === "TIME_BASED_ACTIVE" &&
                        formatDateKey(new Date(s.date)) === dateKey
                      )
                  )
                );
              }
            }
            return updated;
          } else {
            return prev.map((tb) =>
              tb.id === id ? { ...tb, status: status } : tb
            );
          }
        });

        toast.success(`Status booking berhasil diubah menjadi ${status}`);
      } else {
        toast.error(res.error || "Gagal memperbarui status");
      }
    });
  };

  // Find upcoming bookings (slots that are bookings, sorted by date asc)
  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get date-only bookings from slots
    const dateOnlyBookings = slots
      .filter((s) => s.booking && new Date(s.date) >= today)
      .map((s) => ({
        id: s.booking!.id,
        date: s.date,
        clientName: s.booking!.client.fullName,
        eventName: s.booking!.eventName || "Dokumentasi",
        packageType: s.booking!.packageType,
        eventTime: s.booking!.eventTime,
        isTimeBased: false,
      }));

    // Get time-based bookings from timeBookings
    const timeBasedItems = timeBookings
      .filter((tb) => new Date(tb.bookingDate) >= today)
      .map((tb) => ({
        id: tb.id,
        date: tb.bookingDate,
        clientName: tb.client.fullName,
        eventName: tb.eventName || "Foto Studio Session",
        packageType: tb.packageType,
        eventTime: tb.sessionStartTime,
        isTimeBased: true,
      }));

    // Combine, sort by date asc, then by eventTime asc if same date
    return [...dateOnlyBookings, ...timeBasedItems]
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return (a.eventTime || "").localeCompare(b.eventTime || "");
      })
      .slice(0, 6);
  }, [slots, timeBookings]);

  // Calendar render helpers
  const monthYearLabel = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">Kalender & Jadwal</h2>
        <p className="font-sans text-xs text-secondary font-light mt-1">
          Kelola semua ketersediaan tanggal, manual block, dan pesanan offline studio.
        </p>
      </div>

      {/* Grid Stats */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="rounded-none border-border/40 shadow-none p-4 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Sesi Aktif</span>
          <div className="font-serif text-2xl font-medium text-primary mt-1">{stats.activeBookings}</div>
        </Card>
        <Card className="rounded-none border-border/40 shadow-none p-4 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Pending Approval</span>
          <div className="font-serif text-2xl font-medium text-amber-600 mt-1">{stats.pendingApproval}</div>
        </Card>
        <Card className="rounded-none border-border/40 shadow-none p-4 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Approved</span>
          <div className="font-serif text-2xl font-medium text-emerald-600 mt-1">{stats.approved}</div>
        </Card>
        <Card className="rounded-none border-border/40 shadow-none p-4 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Bulan Ini</span>
          <div className="font-serif text-2xl font-medium text-primary mt-1">{stats.bookingsThisMonth}</div>
        </Card>
        <Card className="rounded-none border-border/40 shadow-none p-4 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Terblokir</span>
          <div className="font-serif text-2xl font-medium text-neutral-600 dark:text-neutral-400 mt-1">{stats.blockedDates}</div>
        </Card>
        <Card className="rounded-none border-border/40 shadow-none p-4 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-secondary">Dibatalkan</span>
          <div className="font-serif text-2xl font-medium text-red-500 mt-1">{stats.cancelled}</div>
        </Card>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Card (7 cols) */}
        <div className="border border-border/40 bg-card p-6 lg:col-span-8 rounded-none">
          {/* Header Calendar */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-primary font-medium capitalize">{monthYearLabel}</h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                onClick={handlePrevMonth}
                className="p-2 h-8 w-8 rounded-none border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleNextMonth}
                className="p-2 h-8 w-8 rounded-none border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2 font-sans text-[10px] uppercase tracking-wider font-bold text-secondary">
            {weekDays.map((day, idx) => (
              <div key={day} className={idx === 0 || idx === 6 ? "text-red-500" : ""}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth, key }) => {
              const formatted = formatDateKey(date);
              const slot = getSlotForDate(date);
              const isSelected = selectedDate === formatted;
              const isToday = formatted === todayStr;

              let cellClass = "bg-card border-border/40 text-primary hover:border-primary/60";
              let indicatorColor = "";

              if (slot) {
                const statusUpper = slot.status.toUpperCase();
                if (statusUpper === "MANUALBLOCK") {
                  cellClass = "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium";
                  indicatorColor = "bg-neutral-400";
                } else if (statusUpper === "PENDING" || statusUpper === "PENDINGAPPROVAL") {
                  cellClass = "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 font-semibold";
                  indicatorColor = "bg-amber-500";
                } else if (statusUpper === "APPROVED") {
                  cellClass = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-semibold";
                  indicatorColor = "bg-emerald-500";
                } else if (statusUpper === "LUNAS") {
                  cellClass = "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 font-semibold";
                  indicatorColor = "bg-blue-500";
                } else if (statusUpper === "MANUALBOOKING") {
                  cellClass = "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 font-semibold";
                  indicatorColor = "bg-blue-500";
                } else if (statusUpper === "TIME_BASED_ACTIVE") {
                  cellClass = "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/30 text-violet-800 dark:text-violet-400 font-semibold";
                  indicatorColor = "bg-violet-500";
                }
              }

              if (isSelected) {
                cellClass = "bg-primary text-primary-foreground border-primary font-bold";
              } else if (!isCurrentMonth) {
                cellClass += " opacity-40";
              }

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(formatted)}
                  className={`h-14 border text-xs font-sans rounded-none transition-all flex flex-col items-center justify-between p-2 relative ${cellClass}`}
                >
                  <div className="flex w-full items-start justify-between">
                    <span className={isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]" : ""}>
                      {date.getDate()}
                    </span>
                    {indicatorColor && (
                      <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
                    )}
                  </div>
                  {slot && (
                    <span className="text-[8px] uppercase tracking-wider font-bold truncate max-w-full block">
                      {slot.status === "ManualBlock"
                        ? "Blocked"
                        : slot.status === "TIME_BASED_ACTIVE"
                        ? (() => {
                            const count = timeBookings.filter(
                              (tb) => formatDateKey(new Date(tb.bookingDate)) === formatted
                            ).length;
                            return `${count} Sesi`;
                          })()
                        : (slot.booking?.client.fullName || "Studio")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-[10px] font-sans text-secondary border-t border-border/20 pt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-card border border-border/40 block" />
              <span>Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-200 block" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-200 block" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-100 border border-blue-200 block" />
              <span>Manual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-violet-100 border border-violet-200 block" />
              <span>Sesi Studio (Time Based)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-neutral-100 border border-neutral-200 block" />
              <span>Block Manual</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details Panel / Upcoming Schedule (4 cols) */}
        <div className="space-y-6 lg:col-span-4 w-full">
          {/* Selected Date Detail */}
          <Card className="rounded-none border-border/40 shadow-none">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-serif text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>Tanggal Terpilih</span>
              </CardTitle>
              <CardDescription className="font-sans text-xs">
                {selectedDate ? (
                  new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  }).format(new Date(selectedDate))
                ) : (
                  "Pilih tanggal di kalender"
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {selectedDate ? (
                selectedSlot?.status === "ManualBlock" ? (
                    /* MANUALLY BLOCKED VIEW */
                    <div className="space-y-4">
                      <div className="bg-neutral-50 dark:bg-neutral-900 border border-border/30 p-4 rounded-none">
                        <span className="text-[10px] uppercase font-bold text-secondary block mb-1">Status</span>
                        <div className="flex items-center gap-2 font-sans text-xs text-neutral-600 font-semibold uppercase tracking-wider">
                          <Lock className="w-4.5 h-4.5 text-neutral-500" /> Tanggal Diblokir Admin
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-secondary block">Alasan Blokir</span>
                        <p className="font-sans text-xs text-primary italic font-light">"{selectedSlot.blockedReason || "Tidak ada alasan spesifik."}"</p>
                      </div>
                      <div className="space-y-1 text-[10px] text-secondary font-sans">
                        <span>Dibuat oleh: {selectedSlot.createdBy || "Admin"}</span>
                      </div>
                      <Button
                        onClick={handleUnblockDate}
                        disabled={isPending}
                        variant="outline"
                        className="w-full rounded-none border-border text-xs uppercase tracking-wider font-semibold py-5 flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Buka Blokir Tanggal
                      </Button>
                    </div>
                  ) : (selectedSlot?.status === "TIME_BASED_ACTIVE" || selectedDateBookings.length > 0) ? (
                    /* TIME BASED LIST VIEW */
                    <div className="space-y-6">
                      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30 p-4 flex justify-between items-center rounded-none">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-violet-800 dark:text-violet-400 block">Kategori</span>
                          <span className="font-sans text-xs font-semibold uppercase tracking-wider block mt-1 text-violet-900 dark:text-violet-300">
                            Sesi Studio ({selectedDateBookings.length} Sesi)
                          </span>
                        </div>
                        <Badge className="bg-violet-600 text-white font-sans text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-none border-none">
                          Time Based
                        </Badge>
                      </div>

                      <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                        {selectedDateBookings.length === 0 ? (
                          <p className="text-center font-sans text-xs text-secondary/60 py-6 italic">
                            Tidak ada sesi aktif hari ini.
                          </p>
                        ) : (
                          selectedDateBookings.map((tb) => (
                            <div key={tb.id} className="border border-border/40 p-4 space-y-4 rounded-none bg-card/50">
                              {/* Time and Status Header */}
                              <div className="flex justify-between items-center border-b border-border/10 pb-2">
                                <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-primary">
                                  <Clock className="w-3.5 h-3.5 text-violet-600" />
                                  <span>{tb.sessionStartTime} - {tb.sessionEndTime} WIB</span>
                                </div>
                                <Badge className={`font-sans text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-none border-none ${
                                  tb.status.toUpperCase() === "PENDING"
                                    ? "bg-amber-100 text-amber-800"
                                    : tb.status.toUpperCase() === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {tb.status}
                                </Badge>
                              </div>

                              {/* Client Info */}
                              <div className="space-y-2 font-sans text-xs">
                                <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block border-b border-border/10 pb-0.5">Pemesan</span>
                                <div className="space-y-1 text-secondary">
                                  <div className="flex items-center gap-2 font-semibold text-primary">
                                    <User className="w-3.5 h-3.5 text-secondary/70" /> {tb.client.fullName}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-secondary/70" /> {tb.client.email}
                                  </div>
                                  {tb.client.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-secondary/70" /> {tb.client.phoneNumber}
                                    </div>
                                  )}
                                  {tb.client.instagram && (
                                    <div className="flex items-center gap-2">
                                      <InstagramIcon className="w-3.5 h-3.5 text-secondary/60" /> {tb.client.instagram}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Package Details */}
                              <div className="space-y-1 text-xs font-sans">
                                <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block border-b border-border/10 pb-0.5">Acara & Paket</span>
                                <span className="font-semibold text-primary block">{tb.eventName || "Foto Studio Session"}</span>
                                <span className="text-[10px] text-secondary">{tb.packageType}</span>
                                {tb.notes && (
                                  <p className="text-[11px] text-secondary/80 italic mt-1 bg-muted/30 p-2 border-l-2 border-violet-400">
                                    "{tb.notes}"
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons for this session */}
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/10">
                                {(tb.status.toUpperCase() === "PENDING" || tb.status === "PendingApproval") && (
                                  <>
                                    <Button
                                      onClick={() => handleQuickStatusUpdate(tb.id, "APPROVED")}
                                      disabled={isPending}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[9px] uppercase font-bold tracking-wider py-2 h-7 flex-1"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleQuickStatusUpdate(tb.id, "REJECTED")}
                                      disabled={isPending}
                                      variant="outline"
                                      className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-none text-[9px] uppercase font-bold tracking-wider py-2 h-7 flex-1"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {(tb.status.toUpperCase() === "APPROVED" || tb.status === "Approved" || tb.status === "ManualBooking") && (
                                  <>
                                    <Button
                                      onClick={() => handleQuickStatusUpdate(tb.id, "LUNAS")}
                                      disabled={isPending}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[9px] uppercase font-bold tracking-wider py-2 h-7 flex-1"
                                    >
                                      Lunas
                                    </Button>
                                    <Button
                                      onClick={() => handleQuickStatusUpdate(tb.id, "CANCELLED")}
                                      disabled={isPending}
                                      variant="outline"
                                      className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-none text-[9px] uppercase font-bold tracking-wider py-2 h-7 flex-1"
                                    >
                                      Batal
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => setIsBookingOpen(true)}
                          className="w-full rounded-none font-sans text-xs uppercase tracking-wider py-5 flex items-center justify-center gap-2 font-bold"
                        >
                          <Plus className="w-4 h-4" /> Buat Booking Manual
                        </Button>
                      </div>
                    </div>
                  ) : selectedSlot ? (
                    /* NORMAL SINGLE BOOKING VIEW */
                    <div className="space-y-6">
                      <div className="bg-muted/20 border border-border/30 p-4 flex justify-between items-center rounded-none">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-secondary block">Status</span>
                          <span className="font-sans text-xs font-semibold uppercase tracking-wider block mt-1">
                            {selectedSlot.status.toUpperCase() === "PENDING" || selectedSlot.status === "PendingApproval" ? "Pending" : selectedSlot.status}
                          </span>
                        </div>
                        <Badge className="bg-primary text-primary-foreground font-sans text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-none">
                          {selectedSlot.booking?.source || "website"}
                        </Badge>
                      </div>

                      {/* Detail Booking Info */}
                      {selectedSlot.booking && (
                        <div className="space-y-4 font-sans text-xs">
                          {/* Client */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block border-b border-border/10 pb-0.5">Pemesan</span>
                            <div className="space-y-1 text-secondary">
                              <div className="flex items-center gap-2 font-semibold text-primary">
                                <User className="w-3.5 h-3.5" /> {selectedSlot.booking.client.fullName}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> {selectedSlot.booking.client.email}
                              </div>
                              {selectedSlot.booking.client.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5" /> {selectedSlot.booking.client.phoneNumber}
                                </div>
                              )}
                              {selectedSlot.booking.client.instagram && (
                                <div className="flex items-center gap-2">
                                  <InstagramIcon className="w-3.5 h-3.5 text-secondary/60" /> {selectedSlot.booking.client.instagram}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Event */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block border-b border-border/10 pb-0.5">Acara</span>
                            <div>
                              <span className="font-semibold text-primary block">{selectedSlot.booking.eventName || "Dokumentasi Foto"}</span>
                              <span className="text-[10px] text-secondary">{selectedSlot.booking.packageType}</span>
                            </div>
                            {selectedSlot.booking.eventTime && (
                              <div className="flex items-center gap-1.5 text-secondary mt-1">
                                <Clock className="w-3.5 h-3.5" /> Jam {selectedSlot.booking.eventTime} WIB
                              </div>
                            )}
                            {selectedSlot.booking.eventLocation && (
                              <div className="flex items-center gap-1.5 text-secondary">
                                <MapPin className="w-3.5 h-3.5" /> {selectedSlot.booking.eventLocation}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {selectedSlot.booking && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/20">
                          {(selectedSlot.booking.status.toUpperCase() === "PENDING" || selectedSlot.booking.status === "PendingApproval") && (
                            <>
                              <Button
                                onClick={() => handleQuickStatusUpdate(selectedSlot.booking!.id, "APPROVED")}
                                disabled={isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[10px] uppercase font-bold tracking-wider py-4 flex-1"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleQuickStatusUpdate(selectedSlot.booking!.id, "REJECTED")}
                                disabled={isPending}
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-none text-[10px] uppercase font-bold tracking-wider py-4 flex-1"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {(selectedSlot.booking.status.toUpperCase() === "APPROVED" || selectedSlot.booking.status === "Approved" || selectedSlot.booking.status === "ManualBooking") && (
                            <>
                              <Button
                                onClick={() => handleQuickStatusUpdate(selectedSlot.booking!.id, "LUNAS")}
                                disabled={isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[10px] uppercase font-bold tracking-wider py-4 flex-1"
                              >
                                Lunas
                              </Button>
                              <Button
                                onClick={() => handleQuickStatusUpdate(selectedSlot.booking!.id, "CANCELLED")}
                                disabled={isPending}
                                variant="outline"
                                className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-none text-[10px] uppercase font-bold tracking-wider py-4 flex-1"
                              >
                                Batal
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* AVAILABLE DATE VIEW */
                  <div className="space-y-4">
                    <p className="font-sans text-xs text-green-600 font-semibold flex items-center gap-1.5 mb-2">
                      <Check className="w-4.5 h-4.5" /> Tanggal ini tersedia untuk pesanan.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setIsBookingOpen(true)}
                        className="w-full rounded-none font-sans text-xs uppercase tracking-wider py-5 flex items-center justify-center gap-2 font-bold"
                      >
                        <Plus className="w-4 h-4" /> Buat Booking Manual
                      </Button>
                      <Button
                        onClick={() => setIsBlockOpen(true)}
                        variant="outline"
                        className="w-full rounded-none border-border text-xs uppercase tracking-wider font-semibold py-5 flex items-center justify-center gap-2 text-secondary hover:text-primary"
                      >
                        <Lock className="w-3.5 h-3.5" /> Blokir Tanggal
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center font-sans text-xs text-secondary/60 py-6 italic">
                  Silakan pilih salah satu tanggal pada kalender untuk melihat ketersediaan & info detail.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Schedule Panel */}
          <Card className="rounded-none border-border/40 shadow-none">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-serif text-sm font-medium flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>Jadwal Terdekat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              <div className="divide-y divide-border/20">
                {upcomingBookings.length === 0 ? (
                  <p className="text-center font-sans text-xs text-secondary/60 py-6 italic">
                    Tidak ada jadwal terdekat.
                  </p>
                ) : (
                  upcomingBookings.map((item) => {
                    const bDate = new Date(item.date);
                    const formatted = bDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    });
                    const diffDays = Math.ceil((bDate.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
                    let badgeLabel = "";
                    let badgeColor = "bg-neutral-100 text-neutral-800";

                    if (diffDays === 0) {
                      badgeLabel = "Hari Ini";
                      badgeColor = "bg-red-100 text-red-800 font-bold animate-pulse";
                    } else if (diffDays === 1) {
                      badgeLabel = "Besok";
                      badgeColor = "bg-amber-100 text-amber-800 font-semibold";
                    } else if (diffDays <= 7) {
                      badgeLabel = "Minggu Ini";
                      badgeColor = "bg-indigo-100 text-indigo-800";
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDate(formatDateKey(bDate))}
                        className="p-4 flex justify-between items-start gap-3 hover:bg-muted/10 cursor-pointer transition-colors"
                      >
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-primary text-sm">{formatted}</span>
                            {badgeLabel && (
                              <Badge className={`${badgeColor} rounded-none border-none text-[8px] uppercase px-1.5 py-0.2`}>
                                {badgeLabel}
                              </Badge>
                            )}
                            {item.isTimeBased && (
                              <Badge className="bg-violet-100 text-violet-800 rounded-none border-none text-[8px] uppercase px-1.5 py-0.2 font-semibold">
                                Studio
                              </Badge>
                            )}
                          </div>
                          <div className="font-semibold text-primary">{item.clientName}</div>
                          <div className="text-[10px] text-secondary">
                            {item.eventTime ? `[Jam ${item.eventTime}] ` : ""}{item.eventName} • {item.packageType}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-secondary/40 self-center" />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>      {/* BLOCK DATE DIALOG */}
      {isBlockOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md rounded-none border-border/40 shadow-2xl bg-background text-foreground animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-serif text-lg text-primary font-medium">Blokir Tanggal Kalender</CardTitle>
              <CardDescription className="font-sans text-xs">
                Kunci tanggal {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(selectedDate))} dari pesanan client.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleBlockDate}>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="blockReason" className="text-[10px] uppercase font-bold text-secondary tracking-wider block">Alasan Pemblokiran <span className="text-red-600">*</span></label>
                  <textarea
                    id="blockReason"
                    placeholder="Contoh: Hari Libur Studio, Maintenance Alat, Keperluan Owner, dll."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none text-xs min-h-[90px]"
                  />
                </div>
              </CardContent>
              <div className="border-t border-border/20 px-6 py-4 flex justify-end gap-2 bg-neutral-50 dark:bg-neutral-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBlockOpen(false)}
                  className="rounded-none border-border font-sans text-xs uppercase tracking-wider py-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !blockReason}
                  className="rounded-none font-sans text-xs uppercase tracking-wider py-4 font-bold"
                >
                  {isPending ? "Memproses..." : "Blokir Tanggal"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CREATE MANUAL BOOKING DIALOG */}
      {isBookingOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-xl rounded-none border-border/40 shadow-2xl bg-background text-foreground animate-in zoom-in-95 duration-200 my-8">
            <CardHeader className="border-b border-border/20 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-serif text-lg text-primary font-medium">Buat Booking Manual (Offline)</CardTitle>
                  <CardDescription className="font-sans text-xs">
                    Input booking offline dari WhatsApp, Instagram, atau Telepon untuk tanggal {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(selectedDate))}.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsBookingOpen(false)} className="rounded-none h-8 w-8 text-secondary">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleManualBooking}>
              <CardContent className="py-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Nama Lengkap Client *</label>
                    <Input
                      type="text"
                      required
                      value={bookingForm.fullName}
                      onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                      placeholder="Masukkan nama lengkap client"
                      className="rounded-none border-border/40 text-xs py-4"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Alamat Email *</label>
                    <Input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="rounded-none border-border/40 text-xs py-4"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Nomor WhatsApp / HP</label>
                    <Input
                      type="tel"
                      value={bookingForm.phoneNumber}
                      onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="rounded-none border-border/40 text-xs py-4"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Username Instagram *</label>
                    <Input
                      type="text"
                      required
                      value={bookingForm.instagram}
                      onChange={(e) => setBookingForm({ ...bookingForm, instagram: e.target.value })}
                      placeholder="misal: @najmialazhar"
                      className="rounded-none border-border/40 text-xs py-4"
                    />
                  </div>

                  {/* Jam Acara */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Waktu Acara *</label>
                    <Input
                      type="time"
                      required
                      value={bookingForm.eventTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, eventTime: e.target.value })}
                      className="rounded-none border-border/40 text-xs py-4 cursor-pointer"
                    />
                  </div>

                  {/* Paket select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Paket Pilihan *</label>
                    <select
                      value={bookingForm.packageType}
                      onChange={(e) => setBookingForm({ ...bookingForm, packageType: e.target.value })}
                      className="w-full border border-border/40 px-3 py-2 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.name}>
                          {pkg.name} {pkg.categoryName ? `(${pkg.categoryName})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Package Details Block */}
                  {selectedPkg && (
                    <div className="md:col-span-2 bg-neutral-50 dark:bg-neutral-900 border border-border/20 p-3 text-[11px] space-y-1 font-sans">
                      <div className="flex justify-between">
                        <span className="text-secondary font-medium">Kategori Paket:</span>
                        <span className="text-primary font-bold">{selectedPkg.categoryName || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary font-medium">Harga Total Paket:</span>
                        <span className="text-primary font-bold">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(selectedPkg.price)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border/10 pt-1 mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Down Payment (DP):</span>
                        <span>
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
                            selectedPkg.bookingType === "TIME_BASED" ? 150000 : selectedPkg.price * 0.2
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Nama Acara */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Nama Acara *</label>
                    <Input
                      type="text"
                      required
                      value={bookingForm.eventName}
                      onChange={(e) => setBookingForm({ ...bookingForm, eventName: e.target.value })}
                      placeholder="Contoh: Wedding Rian & Susi"
                      className="rounded-none border-border/40 text-xs py-4"
                    />
                  </div>
                </div>

                {/* Lokasi Acara */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Lokasi Acara</label>
                  <Input
                    type="text"
                    value={bookingForm.eventLocation}
                    onChange={(e) => setBookingForm({ ...bookingForm, eventLocation: e.target.value })}
                    placeholder="Contoh: Gedung Serbaguna Senayan, Jakarta"
                    className="rounded-none border-border/40 text-xs py-4"
                  />
                </div>

                {/* Catatan */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-secondary tracking-wider">Catatan Acara / Request Khusus</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Tuliskan catatan khusus atau request detail pemotretan dari client"
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none text-xs min-h-[70px]"
                  />
                </div>
              </CardContent>
              <div className="border-t border-border/20 px-6 py-4 flex justify-end gap-2 bg-neutral-50 dark:bg-neutral-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingOpen(false)}
                  className="rounded-none border-border font-sans text-xs uppercase tracking-wider py-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !bookingForm.fullName || !bookingForm.email || !bookingForm.eventName}
                  className="rounded-none font-sans text-xs uppercase tracking-wider py-4 font-bold"
                >
                  {isPending ? "Menyimpan..." : "Buat Booking"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
