'use server';

import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(state: any, formData: FormData) {
    const session = await getSession();

    if (!session) {
        return { error: 'Unauthorized' };
    }

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const bioDescription = formData.get('bioDescription') as string | null;
    const profileImage = formData.get('profileImage') as string | null;

    if (!firstName || !lastName) {
        return { error: 'First name and Last name are required.' };
    }

    try {
        await prisma.user.update({
            where: { id: session.id },
            data: {
                firstName,
                lastName,
                bioDescription,
                profileImage,
            },
        });

        // Revalidate profile and layout so the navbar avatar updates
        revalidatePath('/', 'layout');

        return { success: 'Profile updated successfully!' };
    } catch (error) {
        return { error: 'Failed to update profile. Please try again later.' };
    }
}
