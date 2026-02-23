'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ReactionType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function addComment(blogId: string, content: string) {
    const user = await getSession();
    if (!user) throw new Error('Unauthorized');
    if (!content.trim()) throw new Error('Content cannot be empty');

    const newComment = await prisma.comment.create({
        data: {
            content,
            blogId,
            authorId: user.id,
        }
    });

    revalidatePath(`/article/${blogId}`);
    return { success: true, comment: newComment };
}

export async function addReply(blogId: string, parentId: string, content: string) {
    const user = await getSession();
    if (!user) throw new Error('Unauthorized');
    if (!content.trim()) throw new Error('Content cannot be empty');

    const newReply = await prisma.comment.create({
        data: {
            content,
            blogId,
            parentId,
            authorId: user.id,
        }
    });

    revalidatePath(`/article/${blogId}`);
    return { success: true, comment: newReply };
}

export async function editComment(commentId: string, blogId: string, content: string) {
    const user = await getSession();
    if (!user) throw new Error('Unauthorized');
    if (!content.trim()) throw new Error('Content cannot be empty');

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== user.id) throw new Error('Forbidden');

    await prisma.comment.update({
        where: { id: commentId },
        data: { content, isEdited: true }
    });

    revalidatePath(`/article/${blogId}`);
    return { success: true };
}

export async function deleteComment(commentId: string, blogId: string) {
    const user = await getSession();
    if (!user) throw new Error('Unauthorized');

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== user.id) throw new Error('Forbidden');

    await prisma.comment.update({
        where: { id: commentId },
        data: { isDeleted: true, content: '[This comment was deleted]' }
    });

    revalidatePath(`/article/${blogId}`);
    return { success: true };
}

export async function toggleReaction(commentId: string, blogId: string, type: ReactionType) {
    const user = await getSession();
    if (!user) throw new Error('Unauthorized');

    const existingReaction = await prisma.reaction.findUnique({
        where: {
            userId_commentId: {
                userId: user.id,
                commentId
            }
        }
    });

    if (existingReaction) {
        if (existingReaction.type === type) {
            // Delete if toggling the exact same reaction
            await prisma.reaction.delete({
                where: { id: existingReaction.id }
            });
        } else {
            // Update if switching reaction types
            await prisma.reaction.update({
                where: { id: existingReaction.id },
                data: { type }
            });
        }
    } else {
        // Create if no prior reaction exists
        await prisma.reaction.create({
            data: {
                type,
                userId: user.id,
                commentId
            }
        });
    }

    revalidatePath(`/article/${blogId}`);
    return { success: true };
}
