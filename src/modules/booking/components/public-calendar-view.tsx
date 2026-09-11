"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicCalendarAction } from "../actions/get-public-calendar.action";
import { getTimeSlotsAction } from "../actions/get-time-slots.action";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function PublicCalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [timeBasedDates, setTimeBasedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Time slot states for selected date
  const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string; status: string }[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getPublicCalendarAction()
      .then((res) => {
        if (res.success && res.data) {
          setBookedDates(res.data.bookedDates);
          setTimeBasedDates(res.data.timeBasedDates);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      setIsFetchingSlots(true);
      getTimeSlotsAction(selectedDate)
        .then((res) => {
          if (res.success && res.data) {
            setTimeSlots(res.data.slots || []);
          } else {
            setTimeSlots([]);
          }
        })
        .finally(() => {
          setIsFetchingSlots(false);
        });
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateObj: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateObj: new Date(year, month, i),
      });
    }

    // Next month padding days to make 42 grid cells (6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateObj: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleProceedToBooking = () => {
    if (selectedDate) {
      router.push(`/services?date=${selectedDate}`);
    } else {
      router.push("/services");
    }
  };

  return (
    <div className="w-full">
      {/* Legend & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border/40 bg-card/60 backdrop-blur-sm mb-8">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-emerald-500/20 border border-emerald-500/60 inline-block" />
            <span className="text-secondary font-medium">Tersedia Penuh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-amber-500/20 border border-amber-500/60 inline-block" />
            <span className="text-secondary font-medium">Ada Sesi Terisi (Sebagian Kosong)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-red-500/20 border border-red-500/60 inline-block" />
            <span className="text-secondary font-medium">Penuh (Booked)</span>
          </div>
        </div>

        <span className="text-[11px] text-secondary font-mono">
          *Pembaruan Jadwal Real-Time
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Calendar View (8 Cols) */}
        <div className="lg:col-span-8 border border-border/40 bg-card p-6 md:p-8 shadow-sm">
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center space-y-4 text-secondary">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs uppercase tracking-widest">Memuat Jadwal Pemotretan...</span>
            </div>
          ) : (
            <>
              {/* Month Controller */}
              <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block">
                    Bulan & Tahun
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl text-primary capitalize font-medium">
                    {monthYearLabel}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    aria-label="Bulan Sebelumnya"
                    className="p-2.5 border border-border/40 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    aria-label="Bulan Berikutnya"
                    className="p-2.5 border border-border/40 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-xs uppercase tracking-wider text-secondary pb-3">
                <span className="text-red-500">Ming</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {calendarDays.map((cell, index) => {
                  const dateKey = formatDateKey(cell.dateObj);
                  const isPast = cell.dateObj < today;
                  const isFullyBooked = bookedDates.includes(dateKey);
                  const hasTimeSessions = timeBasedDates.includes(dateKey);
                  const isSelected = selectedDate === dateKey;

                  let statusClasses = "border-border/20 text-primary hover:border-primary/60 cursor-pointer";
                  let badge = null;

                  if (!cell.isCurrentMonth) {
                    statusClasses = "opacity-25 text-secondary border-transparent pointer-events-none";
                  } else if (isPast) {
                    statusClasses = "opacity-40 text-secondary bg-muted/10 border-transparent cursor-not-allowed";
                  } else if (isFullyBooked) {
                    statusClasses = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 cursor-not-allowed";
                    badge = <span className="text-[9px] font-bold block leading-none mt-1 text-red-600">Full</span>;
                  } else if (hasTimeSessions) {
                    statusClasses = "bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:border-amber-500 cursor-pointer";
                    badge = <span className="text-[9px] font-bold block leading-none mt-1 text-amber-600">Ada Sesi</span>;
                  } else {
                    statusClasses = "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 cursor-pointer";
                    badge = <span className="text-[9px] font-medium block leading-none mt-1 text-emerald-600 dark:text-emerald-400">Kosong</span>;
                  }

                  if (isSelected && cell.isCurrentMonth && !isPast && !isFullyBooked) {
                    statusClasses += " ring-2 ring-primary border-primary font-bold bg-primary/10 shadow-sm";
                  }

                  return (
                    <button
                      type="button"
                      key={index}
                      disabled={!cell.isCurrentMonth || isPast || isFullyBooked}
                      onClick={() => {
                        if (cell.isCurrentMonth && !isPast && !isFullyBooked) {
                          setSelectedDate(dateKey);
                        }
                      }}
                      className={cn(
                        "p-2 sm:p-3 min-h-[64px] sm:min-h-[72px] border flex flex-col items-center justify-center transition-all text-left relative focus:outline-none",
                        statusClasses
                      )}
                    >
                      <span className="font-mono text-sm sm:text-base">{cell.dayNumber}</span>
                      {badge}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sidebar / Detail Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[11px] mb-2 border-b border-border/30 pb-3">
              <CalendarIcon className="w-4 h-4" />
              <span>Rincian Tanggal</span>
            </div>

            {selectedDate ? (
              <div className="space-y-4 pt-1">
                <div>
                  <span className="text-xs text-secondary uppercase tracking-wider block">Tanggal Dipilih:</span>
                  <span className="font-serif text-xl font-medium text-primary block mt-0.5">
                    {new Date(selectedDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    Tanggal ini siap untuk dipesan!
                  </span>
                </div>

                {/* Time Slots List */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                    Slot Jam Pada Tanggal Ini:
                  </span>

                  {isFetchingSlots ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-secondary text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memeriksa slot jam...</span>
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        Jam berikut sudah terisi, Anda dapat memilih jam lain yang belum terpakai:
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {timeSlots.map((slot, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-mono text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{slot.startTime} – {slot.endTime} WIB</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              Terisi
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-secondary font-light bg-muted/20 p-3 border border-border/20">
                      Seluruh slot waktu masih **100% Tersedia**. Anda bebas menentukan jam sesi foto saat mengisi formulir booking.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border/30">
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleProceedToBooking}
                    className="w-full gap-2 font-medium"
                  >
                    <span>Booking Tanggal Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto text-secondary">
                  <CalendarIcon className="w-6 h-6 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base text-primary font-medium">Belum Ada Tanggal Dipilih</h4>
                  <p className="text-xs text-secondary max-w-xs mx-auto leading-relaxed">
                    Silakan klik salah satu tanggal hijau atau kuning pada kalender untuk melihat ketersediaan jam dan melanjutkan pemesanan.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleProceedToBooking}
                    className="w-full gap-2 font-medium"
                  >
                    <span>Lihat Daftar Layanan</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick FAQ / Helper Box */}
          <div className="border border-border/30 bg-muted/10 p-5 space-y-3 text-xs text-secondary">
            <h4 className="font-serif text-sm text-primary font-medium">Informasi Reservasi</h4>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>Pemesanan disarankan minimal <strong>H-3</strong> sebelum tanggal sesi foto.</li>
              <li>Jadwal bersifat <em>first-come, first-served</em> terkonfirmasi setelah pembayaran DP/Lunas.</li>
              <li>Untuk jadwal darurat / <em>urgent booking</em>, silakan hubungi kami via WhatsApp.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
