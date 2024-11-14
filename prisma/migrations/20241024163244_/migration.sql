/*
  Warnings:

  - The primary key for the `communities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `community_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `community_members` table. All the data in the column will be lost.
  - The primary key for the `forum_featured_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `forum_featured_posts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `forum_featured_posts` table. All the data in the column will be lost.
  - The primary key for the `forum_post_comments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `forum_post_dislikes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `forum_post_dislikes` table. All the data in the column will be lost.
  - The primary key for the `forum_post_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `forum_post_likes` table. All the data in the column will be lost.
  - The primary key for the `forum_post_views` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `forum_post_views` table. All the data in the column will be lost.
  - The primary key for the `forum_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `forum_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reward_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reward_redemptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `reward_redemptions` table. All the data in the column will be lost.
  - The primary key for the `rewards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `saved_trips` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_trips` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_ForumPostToForumTag" DROP CONSTRAINT "_ForumPostToForumTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ForumPostToForumTag" DROP CONSTRAINT "_ForumPostToForumTag_B_fkey";

-- DropForeignKey
ALTER TABLE "community_members" DROP CONSTRAINT "community_members_communityId_fkey";

-- DropForeignKey
ALTER TABLE "forum_featured_posts" DROP CONSTRAINT "forum_featured_posts_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_comments" DROP CONSTRAINT "forum_post_comments_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_dislikes" DROP CONSTRAINT "forum_post_dislikes_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_likes" DROP CONSTRAINT "forum_post_likes_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_views" DROP CONSTRAINT "forum_post_views_postId_fkey";

-- DropForeignKey
ALTER TABLE "reward_redemptions" DROP CONSTRAINT "reward_redemptions_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_categoryId_fkey";

-- DropIndex
DROP INDEX "community_members_communityId_idx";

-- DropIndex
DROP INDEX "community_members_communityId_userId_key";

-- DropIndex
DROP INDEX "community_members_userId_idx";

-- DropIndex
DROP INDEX "forum_featured_posts_postId_idx";

-- DropIndex
DROP INDEX "forum_post_dislikes_postId_idx";

-- DropIndex
DROP INDEX "forum_post_dislikes_postId_userId_key";

-- DropIndex
DROP INDEX "forum_post_dislikes_userId_idx";

-- DropIndex
DROP INDEX "forum_post_likes_postId_idx";

-- DropIndex
DROP INDEX "forum_post_likes_postId_userId_key";

-- DropIndex
DROP INDEX "forum_post_likes_userId_idx";

-- DropIndex
DROP INDEX "forum_post_views_postId_idx";

-- DropIndex
DROP INDEX "forum_post_views_postId_userId_key";

-- DropIndex
DROP INDEX "forum_post_views_userId_idx";

-- DropIndex
DROP INDEX "reward_redemptions_rewardId_idx";

-- DropIndex
DROP INDEX "reward_redemptions_userId_idx";

-- AlterTable
ALTER TABLE "_ForumPostToForumTag" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "communities" DROP CONSTRAINT "communities_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "communities_id_seq";

-- AlterTable
ALTER TABLE "community_members" DROP CONSTRAINT "community_members_pkey",
DROP COLUMN "id",
ALTER COLUMN "communityId" SET DATA TYPE TEXT,
ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("communityId", "userId");

-- AlterTable
ALTER TABLE "forum_featured_posts" DROP CONSTRAINT "forum_featured_posts_pkey",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_featured_posts_pkey" PRIMARY KEY ("postId");

-- AlterTable
ALTER TABLE "forum_post_comments" DROP CONSTRAINT "forum_post_comments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_post_comments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "forum_post_comments_id_seq";

-- AlterTable
ALTER TABLE "forum_post_dislikes" DROP CONSTRAINT "forum_post_dislikes_pkey",
DROP COLUMN "id",
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_post_dislikes_pkey" PRIMARY KEY ("postId", "userId");

-- AlterTable
ALTER TABLE "forum_post_likes" DROP CONSTRAINT "forum_post_likes_pkey",
DROP COLUMN "id",
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_post_likes_pkey" PRIMARY KEY ("postId", "userId");

-- AlterTable
ALTER TABLE "forum_post_views" DROP CONSTRAINT "forum_post_views_pkey",
DROP COLUMN "id",
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_post_views_pkey" PRIMARY KEY ("postId", "userId");

-- AlterTable
ALTER TABLE "forum_posts" DROP CONSTRAINT "forum_posts_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "forum_posts_id_seq";

-- AlterTable
ALTER TABLE "forum_tags" DROP CONSTRAINT "forum_tags_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "forum_tags_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "forum_tags_id_seq";

-- AlterTable
ALTER TABLE "reward_categories" DROP CONSTRAINT "reward_categories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "reward_categories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "reward_categories_id_seq";

-- AlterTable
ALTER TABLE "reward_redemptions" DROP CONSTRAINT "reward_redemptions_pkey",
DROP COLUMN "id",
ALTER COLUMN "rewardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("rewardId", "userId");

-- AlterTable
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "rewards_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "rewards_id_seq";

-- AlterTable
ALTER TABLE "saved_trips" DROP CONSTRAINT "saved_trips_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "saved_trips_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "saved_trips_id_seq";

-- AlterTable
ALTER TABLE "user_trips" DROP CONSTRAINT "user_trips_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_trips_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_trips_id_seq";

-- AddForeignKey
ALTER TABLE "forum_featured_posts" ADD CONSTRAINT "forum_featured_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_likes" ADD CONSTRAINT "forum_post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_dislikes" ADD CONSTRAINT "forum_post_dislikes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_views" ADD CONSTRAINT "forum_post_views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_comments" ADD CONSTRAINT "forum_post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "reward_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForumPostToForumTag" ADD CONSTRAINT "_ForumPostToForumTag_A_fkey" FOREIGN KEY ("A") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForumPostToForumTag" ADD CONSTRAINT "_ForumPostToForumTag_B_fkey" FOREIGN KEY ("B") REFERENCES "forum_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
