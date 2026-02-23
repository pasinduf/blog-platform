import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WriterDashboardClient } from '@/app/writer/writer-dashboard-client';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function WriterDashboard() {
    const user = await getSession();

    if (!user) {
        redirect('/login');
    }

    const dbBlogs = await prisma.blog.findMany({
        where: { authorId: user.id },
        orderBy: { updatedAt: 'desc' },
    });

    const formattedBlogs = dbBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        status: blog.status,
        updatedAt: blog.updatedAt.toISOString(),
    }));

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Writer Dashboard</h1>
                <Button asChild>
                    <Link href="/writer/compose">Create New Post</Link>
                </Button>
            </div>

            <WriterDashboardClient blogs={formattedBlogs} />
        </div>
    );
}
