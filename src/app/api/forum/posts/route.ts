import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db/index';
import { authOptions } from '@/server/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { title, body, tags } = await request.json();

        if (!title?.trim() || !body?.trim()) {
            return NextResponse.json(
                { message: 'Title and body are required' },
                { status: 400 }
            );
        }

        const processedTags = tags
            ? Array.isArray(tags)
                ? tags
                : tags.split(',').map((tag: string) => tag.trim())
            : [];

        const newPost = await db.forumPost.create({
            data: {
                title: title.trim(),
                body: body.trim(),
                createdById: session.user.id,
                tags: {
                    connectOrCreate: processedTags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                likeCount: 0,
                dislikeCount: 0,
                commentCount: 0,
                viewCount: 0,
            },
            include: {
                createdBy: true,
                tags: true,
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('Error creating new post:', error);
        return NextResponse.json(
            { 
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}