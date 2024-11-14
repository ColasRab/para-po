import { ForumTemplateComponent } from "@/components/forum/forum";
import { db } from "@/db/index";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Forum | Para Po!",
};

const forumData = await db.forumPost.findMany({
  take: 5,
  select: {
    id: true,
    title: true,
    body: true,
    createdAt: true,
    likeCount: true,
    dislikeCount: true,
    viewCount: true,

    commentCount: true,
    tags: true,
    createdBy: {
      select: {
        id: true,
        name: true,
        image: true, // Only if you need the user's image
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});

const forumFeaturedData = await db.forumFeaturedPost.findFirst({
  take: 1,
  select: {
    post: {
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        likeCount: true,
        dislikeCount: true,
        viewCount: true,
        commentCount: true,
        tags: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true, // Only if you need the user's image
          },
        },
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});
const communityData = await db.community.findMany({
  take: 3,
  orderBy: {
    createdAt: "desc",
  },
});
const tagData = await db.forumTag.findMany();
export type ForumData = typeof forumData;
export type FeaturedForumData = typeof forumFeaturedData;

const Forum = async () => {
  return (
    <ForumTemplateComponent
      props={{
        featured: forumFeaturedData,
        forumPosts: forumData,
        communities: communityData,
        tagData,
      }}
    />
  );
};

export default Forum;
