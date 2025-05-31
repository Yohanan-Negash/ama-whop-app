/*
  Warnings:

  - You are about to drop the column `whopAdminId` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "whopAdminId",
ADD COLUMN     "pushedToForum" BOOLEAN NOT NULL DEFAULT false;
