'use server';

import { prisma } from '@/lib/prisma';

export async function getPublicFeed(cursor?: string, limit = 9) {
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

    const formattedBlogs = dbBlogs.map(blog => {
        const plainText = blog.content.replace(/<[^>]*>?/gm, '').trim();
        return {
            id: blog.id,
            title: blog.title,
            // coverImage: blog.coverImage,
            excerpt: plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText,
            updatedAt: blog.updatedAt,
            author: {
                id: blog.author.id,
                name: blog.author.name
            },
            commentCount: blog._count.comments,
        };
    });

    return { blogs: formattedBlogs, nextCursor };
}
