import { PublicFeedClient } from '@/app/public-feed-client';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const dbBlogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedBlogs = dbBlogs.map(blog => ({
    id: blog.id,
    title: blog.title,
    excerpt: blog.content.length > 150 ? blog.content.substring(0, 150) + '...' : blog.content,
    updatedAt: blog.updatedAt.toISOString(),
    author: {
      id: blog.author.id,
      name: blog.author.name
    },
    commentCount: blog._count.comments,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Public Feed</h1>
        <p className="text-muted-foreground mt-2">Discover the latest articles published by your organization members.</p>
      </div>

      <PublicFeedClient blogs={formattedBlogs} />
    </div>
  );
}
