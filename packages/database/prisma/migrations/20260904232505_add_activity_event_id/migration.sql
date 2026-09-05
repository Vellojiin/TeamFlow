/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `ActivityLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_eventId_key" ON "ActivityLog"("eventId");
