'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleBookmarkAction(blogId: string) {
    const user = await getSession();

    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }

    try {
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_blogId: {
                    userId: user.id,
                    blogId: blogId,
                },
            },
        });

        if (existingBookmark) {
            await prisma.bookmark.delete({
                where: {
                    id: existingBookmark.id,
                },
            });
        } else {
            await prisma.bookmark.create({
                data: {
                    userId: user.id,
                    blogId: blogId,
                },
            });
        }

        revalidatePath('/');
        revalidatePath(`/article/${blogId}`);
        revalidatePath('/bookmarks');

        return { success: true, isBookmarked: !existingBookmark };
    } catch (error) {
        console.error('Failed to toggle bookmark:', error);
        return { error: 'Failed to toggle bookmark' };
    }
}

export async function getBookmarksAction() {
    const user = await getSession();

    if (!user) {
        return { error: 'Unauthorized', status: 401, blogs: [] };
    }

    const dbBookmarks = await prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
            blog: {
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                    _count: { select: { comments: true } },
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    const formattedBlogs = dbBookmarks.map(bookmark => {
        const blog = bookmark.blog;
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
        };
    });

    return { blogs: formattedBlogs };
}
