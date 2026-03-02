import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReviewQueueClient } from '@/app/reviews/review-queue-client';
import { ProcessedBlogsClient } from '@/app/reviews/processed-blogs-client';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminDashboard() {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
        redirect('/');
    }

    const dbBlogs = await prisma.blog.findMany({
        where: { status: 'SUBMITTED' },
        include: {
            author: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const formattedBlogs = dbBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        status: blog.status,
        coverImage: blog.coverImage,
        updatedAt: blog.updatedAt,
        author: {
            id: blog.author.id,
            firstName: blog.author.firstName,
            lastName: blog.author.lastName,
        },
    }));

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Reviews</h1>
                <Button variant="secondary" asChild>
                    <Link href="/leaderboard">View Leaderboard</Link>
                </Button>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending Reviews</TabsTrigger>
                    <TabsTrigger value="processed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Reviewed</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-0">
                    <ReviewQueueClient
                        blogs={formattedBlogs}
                        currentUserId={user.id}
                    />
                </TabsContent>

                <TabsContent value="processed" className="mt-0">
                    <ProcessedBlogsClient currentUserId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
