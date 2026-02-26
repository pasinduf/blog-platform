'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function getPublicFeed(cursor?: string, limit = 9, searchQuery?: string) {
    const user = await getSession();
    const take = limit + 1;
    const whereClause: any = { status: 'PUBLISHED' };

    if (searchQuery) {
        whereClause.title = { contains: searchQuery, mode: 'insensitive' };
    }

    const dbBlogs = await prisma.blog.findMany({
        where: whereClause,
        include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { comments: true } },
            ...(user ? { bookmarks: { where: { userId: user.id } } } : {})
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
            content: blog.content,
            status: blog.status,
            coverImage: blog.coverImage,
            excerpt: plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText,
            updatedAt: blog.updatedAt,
            author: {
                id: blog.author.id,
                firstName: blog.author.firstName,
                lastName: blog.author.lastName,
            },
            commentCount: blog._count.comments,
            // @ts-ignore
            isBookmarked: user ? blog.bookmarks.length > 0 : false,
            views: blog.views,
        };
    });

    return { blogs: formattedBlogs, nextCursor };
}
