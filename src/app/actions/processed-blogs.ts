'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function getProcessedBlogs(
    page = 1,
    limit = 10,
    searchTitle?: string,
    authorId?: string
) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {
        status: {
            in: ['PUBLISHED', 'DRAFT']
        }
    };

    if (searchTitle && searchTitle.trim().length > 0) {
        whereClause.title = {
            contains: searchTitle.trim(),
            mode: 'insensitive',
        };
    }

    if (authorId && authorId !== 'all') {
        whereClause.authorId = authorId;
    }

    const [blogs, totalCount] = await Promise.all([
        prisma.blog.findMany({
            where: whereClause,
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                publishedBy: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.blog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
        blogs: blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            status: blog.status,
            clarityScore: blog.clarityScore,
            adminAiSummary: blog.adminAiSummary,
            publishedAt: blog.publishedAt,
            publishedBy: blog.publishedBy ? {
                id: blog.publishedBy.id,
                firstName: blog.publishedBy.firstName,
                lastName: blog.publishedBy.lastName,
            } : null,
            author: {
                id: blog.author.id,
                firstName: blog.author.firstName,
                lastName: blog.author.lastName,
            },
            updatedAt: blog.updatedAt,
        })),
        totalPages,
        currentPage: page,
        totalCount
    };
}

export async function searchAuthors(query: string = '') {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const where: any = {};
    if (query.trim()) {
        where.OR = [
            { firstName: { contains: query.trim(), mode: 'insensitive' } },
            { lastName: { contains: query.trim(), mode: 'insensitive' } },
        ];
    }

    const authors = await prisma.user.findMany({
        where: {
            ...where,
            blogs: {
                some: {
                    status: {
                        in: ['PUBLISHED', 'DRAFT']
                    }
                }
            }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
        },
        orderBy: {
            firstName: 'asc'
        },
        take: 10
    });

    return authors;
}

export async function updateBlogStatusAction(blogId: string, newStatus: 'DRAFT' | 'SUBMITTED') {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
            select: { status: true }
        });

        if (!blog) {
            return { error: 'Blog not found' };
        }

        if (blog.status !== 'PUBLISHED') {
            return { error: 'Only published blogs can be reverted' };
        }

        await prisma.blog.update({
            where: { id: blogId },
            data: {
                status: newStatus,
                publishedAt: null,   // clear publish info
                publishedById: null, // clear publish info
            }
        });

        revalidatePath('/reviews');
        revalidatePath('/'); // Revalidate home page as published blogs affect it

        return { success: true };
    } catch (error) {
        console.error('Failed to update blog status:', error);
        return { error: 'Failed to update blog status' };
    }
}
