/*
  Warnings:

  - You are about to drop the `_ForumPostToForumTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_post_dislikes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_post_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forum_post_views` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'LIKE', 'DISLIKE');

-- DropForeignKey
ALTER TABLE "_ForumPostToForumTag" DROP CONSTRAINT "_ForumPostToForumTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ForumPostToForumTag" DROP CONSTRAINT "_ForumPostToForumTag_B_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_dislikes" DROP CONSTRAINT "forum_post_dislikes_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_dislikes" DROP CONSTRAINT "forum_post_dislikes_userId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_likes" DROP CONSTRAINT "forum_post_likes_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_likes" DROP CONSTRAINT "forum_post_likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_views" DROP CONSTRAINT "forum_post_views_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_views" DROP CONSTRAINT "forum_post_views_userId_fkey";

-- AlterTable
ALTER TABLE "forum_posts" ADD COLUMN     "commentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dislikeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_ForumPostToForumTag";

-- DropTable
DROP TABLE "forum_post_dislikes";

-- DropTable
DROP TABLE "forum_post_likes";

-- DropTable
DROP TABLE "forum_post_views";

-- CreateTable
CREATE TABLE "forum_post_interactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_post_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "forum_post_interactions_postId_type_idx" ON "forum_post_interactions"("postId", "type");

-- CreateIndex
CREATE INDEX "forum_post_interactions_userId_type_idx" ON "forum_post_interactions"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "forum_post_interactions_postId_userId_type_key" ON "forum_post_interactions"("postId", "userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "_PostTags_AB_unique" ON "_PostTags"("A", "B");

-- CreateIndex
CREATE INDEX "_PostTags_B_index" ON "_PostTags"("B");

-- AddForeignKey
ALTER TABLE "forum_post_interactions" ADD CONSTRAINT "forum_post_interactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_interactions" ADD CONSTRAINT "forum_post_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_A_fkey" FOREIGN KEY ("A") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostTags" ADD CONSTRAINT "_PostTags_B_fkey" FOREIGN KEY ("B") REFERENCES "forum_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
