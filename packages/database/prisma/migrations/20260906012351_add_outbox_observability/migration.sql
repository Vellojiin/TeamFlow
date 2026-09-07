-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "lastError" TEXT;
