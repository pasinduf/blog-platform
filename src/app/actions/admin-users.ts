'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { toast } from 'sonner';

export async function getUsersAction(page = 1, limit = 10, searchName?: string) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const skip = (page - 1) * limit;

    const where = searchName
        ? { name: { contains: searchName, mode: 'insensitive' as const } }
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
                name: true,
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

export async function approveUserAction(userId: string) {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'APPROVED' },
        });

        revalidatePath('/admin/users');
        return { success: 'User approved successfully' };
    } catch (error) {
        toast.error('Failed to approve user');
        return { error: 'Failed to approve user' };
    }
}

export async function rejectUserAction(userId: string) {
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
