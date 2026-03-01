import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminReviewClient } from './client';
import { prisma } from '@/lib/prisma';

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            author: {
                select: { id: true, firstName: true, lastName: true }
            }
        }
    });

    if (!blog) return <div>Blog not found</div>;

    return <AdminReviewClient blog={blog} />;
}
