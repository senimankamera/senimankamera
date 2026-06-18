const bookings = [
  { id: 'May', bookingDate: '2026-05-15T00:00:00.000Z' },
  { id: 'June 22', bookingDate: '2026-06-22T00:00:00.000Z' },
  { id: 'June 28', bookingDate: '2026-06-28T00:00:00.000Z' },
  { id: 'June 29', bookingDate: '2026-06-29T00:00:00.000Z' },
  { id: 'June 30', bookingDate: '2026-06-30T05:00:00.000Z' },
  { id: 'July', bookingDate: '2026-07-10T00:00:00.000Z' }
];

const now = new Date("2026-06-18T21:57:12+07:00"); // Mocked user's local time

function runTest(dateRange: string) {
  const isDateInRange = (bookingDateStr: string) => {
    const bookingDate = new Date(bookingDateStr);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateRange === "today") {
      return bookingDate >= startOfToday && bookingDate <= endOfToday;
    }
    if (dateRange === "yesterday") {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const endOfYesterday = new Date(endOfToday);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      return bookingDate >= startOfYesterday && bookingDate <= endOfYesterday;
    }
    if (dateRange === "7-days") {
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return bookingDate >= sevenDaysAgo && bookingDate <= endOfToday;
    }
    if (dateRange === "30-days") {
      const thirtyDaysAgo = new Date(startOfToday);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return bookingDate >= thirtyDaysAgo && bookingDate <= endOfToday;
    }
    if (dateRange === "this-month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
    }
    if (dateRange === "this-year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return bookingDate >= startOfYear && bookingDate <= endOfYear;
    }
    return true; // all
  };

  const matched = bookings.filter(b => isDateInRange(b.bookingDate)).map(b => b.id);
  console.log(`Filter [${dateRange}]:`, matched);
}

const ranges = ["all", "today", "yesterday", "7-days", "30-days", "this-month", "this-year"];
ranges.forEach(r => runTest(r));
