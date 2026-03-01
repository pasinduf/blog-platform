'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    try {
        const settings = await prisma.setting.findMany({
            where: {
                name: {
                    in: [
                        'WRITING_COACH',
                        'ADMIN_REVIEW',
                        'CLARITY_SCORE',
                        'AI_API_KEY'
                    ]
                }
            },
            include: {
                updater: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Map to include updatedUserName
        const formattedSettings = settings.map(s => ({
            ...s,
            updatedUserName: s.updater ? `${s.updater.firstName} ${s.updater.lastName}` : null
        }));

        return { settings: formattedSettings };
    } catch (error) {
        console.error('Failed to fetch settings', error);
        return { error: 'Failed to fetch settings' };
    }
}

export async function updateSettingAction(state: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const id = formData.get('id') as string;
    const value = formData.get('value') as string;

    if (!id || !value) {
        return { error: 'Missing required fields' };
    }

    if (value.trim() === '') {
        return { error: 'Setting value cannot be empty' };
    }

    try {
        await prisma.setting.update({
            where: { id },
            data: {
                value,
                updatedBy: session.id
            }
        });

        revalidatePath('/admin/settings');
        return { success: 'Setting updated successfully!' };
    } catch (error) {
        console.error('Failed to update setting', error);
        return { error: 'Failed to update setting' };
    }
}
