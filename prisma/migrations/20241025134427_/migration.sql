/*
  Warnings:

  - You are about to drop the column `carbonSaved` on the `saved_trips` table. All the data in the column will be lost.
  - You are about to drop the column `distance` on the `saved_trips` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `saved_trips` table. All the data in the column will be lost.
  - You are about to drop the column `carbonSaved` on the `user_trips` table. All the data in the column will be lost.
  - You are about to drop the column `distance` on the `user_trips` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `user_trips` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "saved_trips" DROP COLUMN "carbonSaved",
DROP COLUMN "distance",
DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "user_trips" DROP COLUMN "carbonSaved",
DROP COLUMN "distance",
DROP COLUMN "duration";
