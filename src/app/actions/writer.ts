'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function getAuthorBlogs(statusFilter: string = 'ALL', searchQuery: string = '') {
    const user = await getSession();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const whereClause: any = { authorId: user.id };

    if (statusFilter !== 'ALL') {
        whereClause.status = statusFilter;
    }

    if (searchQuery.trim().length >= 3) {
        whereClause.title = {
            contains: searchQuery.trim(),
            mode: 'insensitive',
        };
    }

    const dbBlogs = await prisma.blog.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
    });

    return dbBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        status: blog.status,
        updatedAt: blog.updatedAt,
        content: blog.content,
        coverImage: blog.coverImage,
    }));
}
