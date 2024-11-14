import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/db/index';
import { authOptions } from '@/server/auth';
export async function POST(request: NextRequest) {
    // Get session using the new getServerSession
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Parse the request body
    const { title, body, tags } = await request.json();

    if (!title || !body) {
        return NextResponse.json(
            { message: 'Title and body are required' },
            { status: 400 }
        );
    }

    try {
        const newPost = await db.forumPost.create({
            data: {
                title,
                body,
                createdById: session.user.id,
                tags: {
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}