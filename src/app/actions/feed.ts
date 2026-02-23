'use server';

import { prisma } from '@/lib/prisma';

export async function getPublicFeed(cursor?: string, limit = 9) {
    console.log("cursor", cursor)
    const take = limit + 1;
    const dbBlogs = await prisma.blog.findMany({
        where: { status: 'PUBLISHED' },
        include: {
            author: { select: { id: true, name: true } },
            _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    let nextCursor: string | undefined = undefined;
    if (dbBlogs.length > limit) {
        const nextItem = dbBlogs.pop();
        nextCursor = nextItem!.id;
    }

    const formattedBlogs = dbBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.content.length > 150 ? blog.content.substring(0, 150) + '...' : blog.content,
        updatedAt: blog.updatedAt.toISOString(),
        author: {
            id: blog.author.id,
            name: blog.author.name
        },
        commentCount: blog._count.comments,
    }));

    return { blogs: formattedBlogs, nextCursor };
}
