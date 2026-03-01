'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AIService } from '@/services/ai-service';

export async function saveDraftAction(
    id: string | null | undefined,
    title: string,
    content: string,
    coverImage: string | null = null
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

            // if (existingBlog.status !== 'DRAFT') {
            //     return { error: 'Only drafts can be saved' };
            // }

            const updatedBlog = await prisma.blog.update({
                where: { id },
                data: {
                    title,
                    content,
                    status: 'DRAFT',
                    coverImage,
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
                    coverImage,
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
    content: string,
    coverImage: string | null = null
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

            // if (existingBlog.status !== 'DRAFT') {
            //     return { error: 'Only drafts can be submitted for review' };
            // }

            await prisma.blog.update({
                where: { id },
                data: {
                    title: title || 'Untitled Draft',
                    content: content || '',
                    coverImage,
                    clarityScore: 0,
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
                    coverImage,
                },
            });
            blogId = newBlog.id;
        }

        if (!blogId) {
            return { error: 'Failed to initialize blog for submission.' };
        }

        // Update blog strictly typing aiAnalysis since it's Prisma Json field but we can pass object
        await prisma.blog.update({
            where: { id: blogId },
            data: {
                status: 'SUBMITTED',
            },
        });

        revalidatePath('/writer');
        revalidatePath('/admin');
        return { success: true, blogId };
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

        if (blog.status !== 'SUBMITTED') {
            return { error: 'Only submitted blogs can be reviewed' };
        }

        const summary = await AIService.generateAdminSummary(blog.id, blog.title, blog.content);

        await prisma.blog.update({
            where: { id: blogId },
            data: { adminAiSummary: summary as any },
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

        const clarityScore = await AIService.generateClarityScore(blog.id, blog.title, blog.content);

        await prisma.blog.update({
            where: { id: blogId },
            data: {
                status: 'PUBLISHED',
                clarityScore
            },
        });

        revalidatePath('/admin');
        revalidatePath('/'); // Public feed
        return { success: true };
    } catch (error) {
        console.error('Failed to publish blog:', error);
        return { error: 'Failed to publish blog' };
    }
}

export async function userPerformAiAnalysisAction(blogId: string) {
    const user = await getSession();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
        });

        if (!blog) {
            return { error: 'Blog not found' };
        }

        if (blog.authorId !== user.id) {
            return { error: 'Unauthorized' };
        }

        if (blog.aiUserAttempts >= 3) {
            return { error: 'Maximum AI evaluation attempts reached.' };
        }

        const analysis = await AIService.performWriterAnalysis(blog.id, blog.title, blog.content);

        await prisma.blog.update({
            where: { id: blogId },
            data: {
                userAiAnalysis: analysis as any,
                aiUserAttempts: {
                    increment: 1
                }
            },
        });

        revalidatePath('/writer/compose');
        return { success: true, aiAnalysis: analysis, attempts: blog.aiUserAttempts + 1 };
    } catch (error) {
        console.error('Failed to perform AI analysis:', error);
        return { error: 'Failed to perform AI analysis' };
    }
}
