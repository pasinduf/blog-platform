'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AIService } from '@/services/ai-service';

export async function saveDraftAction(
    id: string | null | undefined,
    title: string,
    content: string
) {
    const user = await getSession();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        if (id) {
            // Update existing draft
            const existingBlog = await prisma.blog.findUnique({
                where: { id },
            });

            if (!existingBlog) {
                return { error: 'Blog not found' };
            }

            if (existingBlog.authorId !== user.id) {
                return { error: 'Unauthorized to edit this blog' };
            }

            if (existingBlog.status !== 'DRAFT') {
                return { error: 'Only drafts can be saved' };
            }

            const updatedBlog = await prisma.blog.update({
                where: { id },
                data: {
                    title,
                    content,
                },
            });

            revalidatePath('/writer');
            return { success: true, blogId: updatedBlog.id };
        } else {
            // Create new draft
            const newBlog = await prisma.blog.create({
                data: {
                    title: title || 'Untitled Draft',
                    content: content || '',
                    authorId: user.id,
                    status: 'DRAFT',
                },
            });

            revalidatePath('/writer');
            return { success: true, blogId: newBlog.id };
        }
    } catch (error) {
        console.error('Failed to save draft:', error);
        return { error: 'Failed to save draft' };
    }
}

export async function submitForReviewAction(
    id: string | null | undefined,
    title: string,
    content: string
) {
    const user = await getSession();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        let blogId = id;

        if (id) {
            // Update existing draft
            const existingBlog = await prisma.blog.findUnique({
                where: { id },
            });

            if (!existingBlog) {
                return { error: 'Blog not found' };
            }

            if (existingBlog.authorId !== user.id) {
                return { error: 'Unauthorized to edit this blog' };
            }

            if (existingBlog.status !== 'DRAFT') {
                return { error: 'Only drafts can be submitted for review' };
            }

            await prisma.blog.update({
                where: { id },
                data: {
                    title: title || 'Untitled Draft',
                    content: content || '',
                },
            });
        } else {
            // Create new draft first
            const newBlog = await prisma.blog.create({
                data: {
                    title: title || 'Untitled Draft',
                    content: content || '',
                    authorId: user.id,
                    status: 'DRAFT',
                },
            });
            blogId = newBlog.id;
        }

        if (!blogId) {
            return { error: 'Failed to initialize blog for submission.' };
        }

        // Perform AI Analysis
        const analysis = await AIService.performWriterAnalysis(title, content);

        // Update blog strictly typing aiAnalysis since it's Prisma Json field but we can pass object
        await prisma.blog.update({
            where: { id: blogId },
            data: {
                status: 'SUBMITTED',
                aiAnalysis: analysis as any,
            },
        });

        revalidatePath('/writer');
        revalidatePath('/admin');
        return { success: true, blogId, aiAnalysis: analysis };
    } catch (error) {
        console.error('Failed to submit for review:', error);
        return { error: 'Failed to submit for review' };
    }
}

export async function generateAdminSummaryAction(blogId: string) {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        const blog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) return { error: 'Blog not found' };

        const summary = await AIService.generateAdminSummary(blog.title, blog.content);

        await prisma.blog.update({
            where: { id: blogId },
            data: { aiSummary: summary as any },
        });

        revalidatePath(`/admin/review/${blogId}`);
        return { success: true, summary };
    } catch (error) {
        console.error('Failed to generate summary:', error);
        return { error: 'Failed to generate summary' };
    }
}

export async function requestRevisionAction(blogId: string, commentContent: string) {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    if (!commentContent.trim()) {
        return { error: 'Comment cannot be empty' };
    }

    try {
        const blog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) return { error: 'Blog not found' };

        if (blog.authorId === user.id) {
            return { error: 'Cannot review your own post' };
        }

        await prisma.adminComment.create({
            data: {
                content: commentContent,
                adminId: user.id,
                blogId: blogId,
            }
        });

        await prisma.blog.update({
            where: { id: blogId },
            data: { status: 'DRAFT' }, // Send back to writer
        });

        revalidatePath('/admin');
        revalidatePath(`/admin/review/${blogId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to request revision:', error);
        return { error: 'Failed to request revision' };
    }
}

export async function publishBlogAction(blogId: string) {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        const blog = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) return { error: 'Blog not found' };

        if (blog.authorId === user.id) {
            return { error: 'Cannot publish your own post' };
        }

        await prisma.blog.update({
            where: { id: blogId },
            data: { status: 'PUBLISHED' },
        });

        revalidatePath('/admin');
        revalidatePath('/'); // Public feed
        return { success: true };
    } catch (error) {
        console.error('Failed to publish blog:', error);
        return { error: 'Failed to publish blog' };
    }
}
