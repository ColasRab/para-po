import ForumTemplateComponent from "@/components/forum/forum";
import { db } from "@/db/index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forum | Para Po!",
};

// Define types for better type safety
interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Tag {
  id: string;
  name: string;
}

interface ForumPost {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  likeCount: number;
  dislikeCount: number;
  viewCount: number;
  commentCount: number;
  tags: Tag[];  // Changed from string[] to Tag[]
  createdBy: User;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  memberCount: number;
}

interface FeaturedPostContent {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  createdBy: User;
}

interface FeaturedPost {
  post: FeaturedPostContent;
}

// This is now an async Server Component
async function ForumPage() {
// Fetch data directly in the component
  const forumData = await db.forumPost.findMany({
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      likeCount: true,
      dislikeCount: true,
      viewCount: true,
      commentCount: true,
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Type assertion after we know the structure matches
  const forumPosts = forumData as unknown as ForumPost[];

  const featuredData = await db.forumFeaturedPost.findFirst({
    include: {
      post: {
        select: {
          id: true,
          title: true,
          body: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  const featured = featuredData as unknown as FeaturedPost;

  const communities = await db.community.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      memberCount: true,
    },
  }) as Community[];

  const tagData = await db.forumTag.findMany({
    select: {
      id: true,
      name: true,
    },
  }) as Tag[];

  return (
    <ForumTemplateComponent
      props={{ forumPosts, featured, communities, tagData }}
    />
  );
}

export default ForumPage;