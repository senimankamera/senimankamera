-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "sessionEndTime" TEXT,
ADD COLUMN     "sessionStartTime" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "bookingType" TEXT NOT NULL DEFAULT 'DATE_ONLY';

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "sessionDuration" INTEGER;
