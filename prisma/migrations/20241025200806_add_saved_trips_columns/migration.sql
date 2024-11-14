/*
  Warnings:

  - The `role` column on the `community_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `communities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `communities` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `community_members` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `carbonSaved` to the `saved_trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distance` to the `saved_trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `saved_trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbonSaved` to the `user_trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distance` to the `user_trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `user_trips` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "adminCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "moderatorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyActiveMembers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "primaryLanguage" TEXT,
ADD COLUMN     "recentMembers" JSONB,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "CommunityStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "topContributors" JSONB,
ADD COLUMN     "totalComments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPosts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "weeklyActiveMembers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "community_members" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "bannedUntil" TIMESTAMP(3),
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastCommentAt" TIMESTAMP(3),
ADD COLUMN     "lastPostAt" TIMESTAMP(3),
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalComments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPosts" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "role",
ADD COLUMN     "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "saved_trips" ADD COLUMN     "carbonSaved" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_trips" ADD COLUMN     "carbonSaved" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "communities_slug_key" ON "communities"("slug");

-- CreateIndex
CREATE INDEX "communities_status_visibility_idx" ON "communities"("status", "visibility");

-- CreateIndex
CREATE INDEX "communities_memberCount_idx" ON "communities"("memberCount");

-- CreateIndex
CREATE INDEX "communities_createdAt_idx" ON "communities"("createdAt");

-- CreateIndex
CREATE INDEX "community_members_userId_role_idx" ON "community_members"("userId", "role");

-- CreateIndex
CREATE INDEX "community_members_communityId_role_idx" ON "community_members"("communityId", "role");
