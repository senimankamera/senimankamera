"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info, Clock, Calendar as CalendarIcon } from "lucide-react";

interface BookedDateInfo {
  date: string; // ISO String
  eventName: string;
  clientName: string;
  status: string;
  sessionStartTime?: string | null;
  sessionEndTime?: string | null;
  eventTime?: string | null;
}

interface StepPilihTanggalProps {
  bookedDates: BookedDateInfo[];
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:MM
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
  bookingType: string;
  sessionDuration: number | null;
  packageName?: string;
  categoryName?: string;
}

// Helper to format date key YYYY-MM-DD
const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function StepPilihTanggal({
  bookedDates,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
  bookingType,
  sessionDuration,
  packageName,
  categoryName,
}: StepPilihTanggalProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  });

  // Time-based category slot states
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string; status: string }[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isDayBlocked, setIsDayBlocked] = useState(false);

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

  // Load booked slots dynamically when date is selected
  useEffect(() => {
    if (selectedDate) {
      const loadSlots = async () => {
        setIsFetchingSlots(true);
        try {
          const { getTimeSlotsAction } = await import("../actions/get-time-slots.action");
          const response = await getTimeSlotsAction(selectedDate);
          if (response.success && response.data) {
            setBookedSlots(response.data.slots);
            setIsDayBlocked(response.data.isBlocked);
          } else {
            setBookedSlots([]);
            setIsDayBlocked(false);
          }
        } catch (error) {
          console.error("Gagal memuat slot waktu:", error);
        } finally {
          setIsFetchingSlots(false);
        }
      };
      loadSlots();
    } else {
      setBookedSlots([]);
      setIsDayBlocked(false);
    }
  }, [selectedDate]);

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

  // Check if selected time has already passed for today
  const isTimeInPast = useMemo(() => {
    if (!selectedDate || !selectedTime) return false;
    const todayStr = formatDateKey(new Date());
    if (selectedDate !== todayStr) return false;

    const now = new Date();
    const [selHour, selMin] = selectedTime.split(":").map(Number);
    const selectedMinutes = selHour * 60 + selMin;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return selectedMinutes <= nowMinutes;
  }, [selectedDate, selectedTime]);

  // Real-time time slot overlap validation on client side
  const isTimeSlotOverlapping = useMemo(() => {
    if (!selectedTime || !sessionDuration || bookedSlots.length === 0) return false;
    const newStart = selectedTime;
    const newEnd = calculateEndTime(selectedTime, sessionDuration);

    return bookedSlots.some((slot) => {
      const existingStart = slot.startTime;
      const existingEnd = slot.endTime;
      return existingStart < newEnd && existingEnd > newStart;
    });
  }, [selectedTime, sessionDuration, bookedSlots]);

  // Generate days in the month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        key: `prev-${prevMonthLastDay - i}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        key: `curr-${i}`,
      });
    }

    // Next month padding (to complete a grid of 6 rows usually, or up to 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return days;
  }, [currentDate]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };



  const isDateOnlyConflict = bookingType === "DATE_ONLY" && bookedSlots.length > 0;

  // Find booking status for a date
  const getBlockingBookingForDate = (date: Date) => {
    const key = formatDateKey(date);
    return bookedDates.find((b) => {
      const bDate = new Date(b.date);
      return formatDateKey(bDate) === key && (!b.sessionStartTime || b.status === "ManualBlock");
    });
  };

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-md mx-auto">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block font-bold">
          Langkah 2 dari 5
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-primary mb-2 font-medium">Pilih Tanggal & Waktu</h2>
        <p className="font-sans text-xs text-secondary font-light leading-relaxed">
          Pilih tanggal yang tersedia pada kalender di bawah ini, lalu tentukan waktu pelaksanaan sesi foto Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Custom Calendar Card */}
        <div className="border border-border/40 bg-card p-3 sm:p-5 lg:col-span-7 rounded-none">
          {/* Header calendar */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-base text-primary font-medium capitalize">
              {monthYearLabel}
            </h3>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevMonth}
                className="p-2 h-8 w-8 rounded-none border-border"
              >
                <ChevronLeft className="w-4 h-4 text-primary" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleNextMonth}
                className="p-2 h-8 w-8 rounded-none border-border"
              >
                <ChevronRight className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>

          {/* Weekday titles */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "font-sans text-[10px] uppercase tracking-wider font-bold py-1",
                  idx === 0 || idx === 6 ? "text-red-600/80" : "text-secondary"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth, key }) => {
              const formattedKey = formatDateKey(date);
              const isPast = date < today;
              const blockingBooking = getBlockingBookingForDate(date);
              const isSelected = selectedDate === formattedKey;

              let cellStyle = "text-primary bg-transparent border-border/20";
              let statusText = "Tersedia";
              let dotColor = "";

              if (isPast) {
                cellStyle = "text-secondary/30 bg-muted/10 border-transparent cursor-not-allowed";
              } else if (blockingBooking) {
                const isPending = blockingBooking.status === "PendingApproval" || blockingBooking.status === "PENDING";
                if (isPending) {
                  cellStyle = "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30 cursor-not-allowed font-semibold";
                  statusText = "Menunggu Persetujuan";
                  dotColor = "bg-yellow-500";
                } else {
                  cellStyle = "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30 cursor-not-allowed font-semibold";
                  statusText = "Sudah Dipesan";
                  dotColor = "bg-red-500";
                }
              } else if (isSelected) {
                cellStyle = "bg-primary text-primary-foreground border-primary font-bold";
              } else if (!isCurrentMonth) {
                cellStyle = "text-secondary/40 bg-transparent border-transparent hover:bg-muted/10";
              } else {
                cellStyle = "text-primary bg-card border-border/40 hover:border-primary/60 cursor-pointer";
              }

              const handleCellClick = () => {
                if (isPast || blockingBooking) return;
                onSelectDate(formattedKey);
              };

              return (
                <button
                  key={key}
                  type="button"
                  onClick={handleCellClick}
                  disabled={isPast || !!blockingBooking}
                  className={cn(
                    "h-10 border text-xs font-sans rounded-none transition-all flex flex-col items-center justify-center relative",
                    cellStyle
                  )}
                  title={blockingBooking ? `${blockingBooking.eventName} (${blockingBooking.clientName}) - ${statusText}` : undefined}
                >
                  <span>{date.getDate()}</span>
                  {dotColor && (
                    <span className={cn("absolute bottom-1 w-1 h-1 rounded-full", dotColor)} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Status Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-[10px] font-sans text-secondary border-t border-border/20 pt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-card border border-border/40 block" />
              <span>Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-yellow-100 border border-yellow-200 block rounded-none" />
              <span>Menunggu Persetujuan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-100 border border-red-200 block rounded-none" />
              <span>Sudah Dipesan (Tutup)</span>
            </div>
          </div>
          {bookingType === "DATE_ONLY" && (
            <p className="mt-4 text-[10px] text-secondary/80 italic leading-normal border-t border-border/10 pt-3 text-center">
              * Beberapa tanggal mungkin tidak dapat dipesan otomatis jika sudah terisi sesi foto studio lain pada hari tersebut.
            </p>
          )}
        </div>

        {/* Date Details & Time Selector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date Summary & Visual Cues */}
          {selectedDate ? (
            <div className="border border-border/40 bg-card p-5 space-y-4">
              <h4 className="font-serif text-sm text-primary font-medium flex items-center gap-2 border-b border-border/20 pb-3">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>Tanggal Terpilih</span>
              </h4>
              <div className="font-sans text-xs text-secondary space-y-1.5">
                <div className="text-primary font-medium text-sm">
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    weekday: "long",
                  })}
                </div>
                {!isDayBlocked && (
                  <div className={cn(
                    "text-[11px] font-medium",
                    isDateOnlyConflict ? "text-amber-600 font-bold" : "text-green-600"
                  )}>
                    Status: {isDateOnlyConflict ? "Jadwal Terisi (Penuh)" : `Tanggal Tersedia ${bookingType === "TIME_BASED" ? "(Multi-Sesi)" : ""}`}
                  </div>
                )}
              </div>

              {isDayBlocked ? (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 font-sans text-xs">
                  Tanggal ini telah sepenuhnya diblokir oleh admin. Silakan pilih tanggal lain.
                </div>
              ) : isDateOnlyConflict ? (
                <div className="space-y-4 pt-2 border-t border-border/20">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 font-sans text-xs space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <Info className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-1">Jadwal Sesi Foto Terdeteksi</span>
                        Pada tanggal ini sudah terdapat jadwal sesi foto studio. Karena paket layanan Anda membutuhkan pemesanan satu hari penuh, pemesanan otomatis melalui website tidak tersedia untuk tanggal ini.
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const formattedBookingDate = new Date(selectedDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                      const categoryAndPackage = categoryName
                        ? `${categoryName} (${packageName})`
                        : `${packageName || 'Dokumentasi'}`;
                      const waText = encodeURIComponent(
                        `Halo Kak, saya ingin melakukan booking manual untuk paket "${categoryAndPackage}" pada tanggal ${formattedBookingDate}, karena di website tertulis tanggal tersebut sudah terisi oleh jadwal sesi foto studio lain (sedangkan paket saya memerlukan booking satu hari penuh). Apakah masih memungkinkan?`
                      );
                      window.open(`https://wa.me/6285721598190?text=${waText}`, "_blank");
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-sans text-xs uppercase tracking-wider py-3.5 h-auto whitespace-normal text-center font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    Jika anda tetap ingin memesan di tanggal ini Klik disini untuk hubungi Whatsapp Owner untuk booking manual (Jika Owner Mengizinkan)
                  </Button>
                </div>
              ) : (
                <>
                  {/* Preloaded active slots for TIME_BASED bookings */}
                  {bookingType === "TIME_BASED" && (
                    <div className="space-y-2.5 pt-2 border-t border-border/20">
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">
                        Jadwal Terisi pada Tanggal Ini:
                      </span>
                      {/* Info jeda 15 menit */}
                      <div className="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 px-2.5 py-2">
                        <Clock className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" />
                        <span>Terdapat jeda persiapan studio <strong>15 menit</strong> antar sesi. Sesi berikutnya baru bisa dimulai 15 menit setelah sesi sebelumnya selesai.</span>
                      </div>
                      {isFetchingSlots ? (
                        <div className="text-[11px] text-secondary/60 animate-pulse italic py-1">
                          Memuat jadwal terisi...
                        </div>
                      ) : bookedSlots.length === 0 ? (
                        <div className="text-[11px] text-green-600/90 italic py-1 bg-green-50/50 dark:bg-green-950/10 px-2 border border-green-100 dark:border-green-900/20">
                          Semua jam sesi masih tersedia!
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                          {bookedSlots.map((slot, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-100 dark:border-red-900/20 px-2.5 py-1.5 text-[11px] font-medium"
                            >
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-red-600/60" />
                                {slot.startTime} – {slot.endTime} WIB
                              </span>
                              <span className="text-[8px] uppercase tracking-wider font-bold">Terisi + Jeda</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Input */}
                  <div className="space-y-1.5 pt-2 border-t border-border/20">
                    <label htmlFor="eventTime" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
                      {bookingType === "TIME_BASED" ? "Jam Mulai Sesi" : "Waktu Acara (Jam)"} <span className="text-red-700">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                      <input
                        type="time"
                        id="eventTime"
                        value={selectedTime}
                        onChange={(e) => onSelectTime(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none text-primary cursor-pointer text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Past time warning for today */}
                  {selectedTime && isTimeInPast && (
                    <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 font-sans text-[11px] font-bold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
                      <span>Waktu ini sudah terlewat hari ini. Silakan pilih waktu yang akan datang.</span>
                    </div>
                  )}

                  {/* Duration Display & Overlap Warning */}
                  {selectedTime && bookingType === "TIME_BASED" && sessionDuration && (
                    <div className="space-y-2.5 mt-3">
                      <div className="text-[11px] text-primary/80 font-medium bg-primary/5 p-2.5 border border-primary/20">
                        Rencana Sesi: <span className="font-bold">{selectedTime} WIB</span> s/d{" "}
                        <span className="font-bold">{calculateEndTime(selectedTime, sessionDuration)} WIB</span>{" "}
                        ({sessionDuration} menit durasi paket)
                      </div>

                      {/* Pengingat jeda 15 menit */}
                      <div className="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 px-2.5 py-2">
                        <Clock className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" />
                        <span>Terdapat jeda persiapan studio <strong>15 menit</strong> antar sesi. Sesi berikutnya baru bisa dimulai pukul <strong>{calculateEndTime(selectedTime, sessionDuration + 15)} WIB</strong>.</span>
                      </div>

                      {isTimeSlotOverlapping && (
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 font-sans text-[11px] font-bold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
                          <span>Waktu sesi tabrakan dengan booking lain. Silakan pilih jam lain.</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-border/60 p-6 text-center text-secondary font-sans text-xs leading-relaxed">
              <Info className="w-5 h-5 mx-auto mb-2 text-secondary/70 stroke-1" />
              Silakan klik salah satu tanggal yang tersedia pada kalender untuk memproses jadwal.
            </div>
          )}

          {/* Info Acara Terisi dalam Bulan Ini */}
          <div className="border border-border/40 bg-card p-5 space-y-3">
            <h4 className="font-serif text-xs text-primary font-semibold uppercase tracking-wider">
              Jadwal Dipesan Bulan Ini
            </h4>
            <div className="max-h-[160px] overflow-y-auto font-sans text-[11px] space-y-2 pr-1.5">
              {bookedDates.filter((b) => {
                const bDate = new Date(b.date);
                return (
                  bDate.getMonth() === currentDate.getMonth() &&
                  bDate.getFullYear() === currentDate.getFullYear()
                );
              }).length === 0 ? (
                <p className="text-secondary/60 italic">Tidak ada tanggal terisi di bulan ini.</p>
              ) : (
                bookedDates
                  .filter((b) => {
                    const bDate = new Date(b.date);
                    return (
                      bDate.getMonth() === currentDate.getMonth() &&
                      bDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .map((booking, idx) => {
                    const bDate = new Date(booking.date);
                    const formatted = bDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    });
                    const timeInfo = booking.sessionStartTime
                      ? ` (${booking.sessionStartTime} – ${booking.sessionEndTime} WIB)`
                      : " (Full Day)";
                    const isPending = booking.status === "PendingApproval" || booking.status === "PENDING";

                    return (
                      <div
                        key={idx}
                        className="p-2 border border-border/20 bg-muted/10 flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between font-semibold gap-2">
                          <span className="text-primary truncate" title={`${formatted}${timeInfo}`}>{formatted}{timeInfo}</span>
                          <span className={cn("shrink-0", isPending ? "text-yellow-600" : "text-red-600")}>
                            {isPending ? "Pending" : "Booked"}
                          </span>
                        </div>
                        <div className="text-secondary font-light">
                          Acara: {booking.eventName || "Dokumentasi"}
                        </div>
                        <div className="text-secondary font-light">
                          Pemesan: {booking.clientName}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex justify-between pt-4 border-t border-border/20">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="font-sans text-xs uppercase tracking-widest py-5 px-8 rounded-none border-border"
        >
          ← Kembali
        </Button>
        {selectedDate && selectedTime && !isTimeSlotOverlapping && !isDayBlocked && !isDateOnlyConflict && !isTimeInPast && (
          <Button
            type="button"
            onClick={onNext}
            className="font-sans text-xs uppercase tracking-widest py-5 px-10 rounded-none font-bold text-white transition-all hover:opacity-90 cursor-pointer"
          >
            Lanjut ke Data Pemesan →
          </Button>
        )}
      </div>
    </div>
  );
}
