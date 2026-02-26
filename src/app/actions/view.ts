'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function incrementBlogView(blogId: string) {
    const cookieStore = await cookies();
    const viewCookieName = `viewed_${blogId}`;

    // Check if user has already viewed this blog recently
    if (cookieStore.has(viewCookieName)) {
        return { success: true, alreadyViewed: true };
    }

    try {
        // Increment the view count
        await prisma.blog.update({
            where: { id: blogId },
            data: {
                views: {
                    increment: 1
                }
            }
        });

        // Set a cookie that expires in 24 hours
        cookieStore.set(viewCookieName, 'true', {
            maxAge: 60 * 60 * 24, // 24 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        // Optional: Revalidate paths if we want the view count to update immediately
        // revalidatePath(`/article/${blogId}`);
        // revalidatePath('/');

        return { success: true, incremented: true };
    } catch (error) {
        console.error('Failed to increment blog view:', error);
        return { error: 'Failed to update view count' };
    }
}
