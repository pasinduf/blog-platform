import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReviewQueueClient } from '@/app/admin/review-queue-client';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
        redirect('/');
    }

    const dbBlogs = await prisma.blog.findMany({
        where: { status: 'SUBMITTED' },
        include: {
            author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const formattedBlogs = dbBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        status: blog.status,
        updatedAt: blog.updatedAt.toISOString(),
        author: {
            id: blog.author.id,
            name: blog.author.name,
        },
    }));

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Review Queue</h1>
                <Button variant="secondary" asChild>
                    <Link href="/admin/leaderboard">View Leaderboard</Link>
                </Button>
            </div>

            <ReviewQueueClient
                blogs={formattedBlogs}
                currentUserId={user.id}
            />
        </div>
    );
}
