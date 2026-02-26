'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { toast } from 'sonner';
import { sendWelcomeEmail } from '@/lib/email';

export async function getUsers(page = 1, limit = 10, searchName?: string) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const skip = (page - 1) * limit;

    const where = searchName
        ? {
            OR: [
                { firstName: { contains: searchName, mode: 'insensitive' as const } },
                { lastName: { contains: searchName, mode: 'insensitive' as const } },
            ],
        }
        : {};

    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
        users,
        totalPages,
        currentPage: page
    };
}

export async function approvePost(userId: string, assignAdmin: boolean = false) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                status: 'APPROVED',
                role: assignAdmin ? 'ADMIN' : 'USER'
            },
            select: { email: true, firstName: true, lastName: true }
        });

        await sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

        revalidatePath('/admin/users');
        return { success: 'User approved successfully' };
    } catch (error) {
        toast.error('Failed to approve user');
        return { error: 'Failed to approve user' };
    }
}

export async function promoteToAdmin(userId: string) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
        });

        revalidatePath('/admin/users');
        return { success: 'User promoted to ADMIN successfully' };
    } catch (error) {
        return { error: 'Failed to promote user' };
    }
}

export async function demoteToUser(userId: string) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        // Prevent removing the last admin
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' }
        });

        if (adminCount <= 1) {
            const userToDemote = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
            if (userToDemote?.role === 'ADMIN') {
                return { error: 'Cannot demote the last remaining ADMIN' };
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' },
        });

        revalidatePath('/admin/users');
        return { success: 'User demoted to USER successfully' };
    } catch (error) {
        return { error: 'Failed to demote user' };
    }
}

export async function rejectPost(userId: string) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'REJECTED' },
        });

        revalidatePath('/admin/users');
        return { success: 'User rejected successfully' };
    } catch (error) {
        toast.error('Failed to reject user');
        return { error: 'Failed to reject user' };
    }
}


export async function getPendingReviewBlogs(searchQuery: string = '') {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const whereClause: any = { status: 'SUBMITTED' };

    if (searchQuery.trim().length >= 3) {
        whereClause.title = {
            contains: searchQuery.trim(),
            mode: 'insensitive',
        };
    }

    const dbBlogs = await prisma.blog.findMany({
        where: whereClause,
        include: {
            author: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return dbBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        status: blog.status,
        updatedAt: blog.updatedAt,
        author: {
            id: blog.author.id,
            firstName: blog.author.firstName,
            lastName: blog.author.lastName,
        },
    }));

}