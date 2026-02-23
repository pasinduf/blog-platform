import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { CommentSection } from '@/components/comment-section';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, name: true } },
            comments: {
                where: { parentId: null },
                include: {
                    author: true,
                    reactions: true,
                    replies: {
                        include: { author: true, reactions: true },
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!blog) {
        notFound();
    }

    // Helper to format reactions consistently
    const formatReactions = (reactions: any[]) => {
        const counts = { like: 0, heart: 0, dislike: 0 };
        const userReactions: Record<string, 'like' | 'heart' | 'dislike'> = {};

        reactions.forEach(r => {
            if (r.type === 'LIKE') counts.like++;
            if (r.type === 'HEART') counts.heart++;
            if (r.type === 'DISLIKE') counts.dislike++;

            if (session) {
                userReactions[r.userId] = r.type.toLowerCase() as any;
            }
        });

        return { counts, userReactions };
    };

    // Format comments to match the expected structure
    const formattedComments = blog.comments.map(c => {
        const parentRx = formatReactions(c.reactions);

        return {
            id: c.id,
            content: c.content,
            authorId: c.authorId,
            authorName: c.author.name,
            createdAt: c.createdAt.toISOString(),
            isEdited: c.isEdited,
            isDeleted: c.isDeleted,
            reactions: parentRx.counts,
            userReactions: parentRx.userReactions,
            replies: c.replies.map(r => {
                const replyRx = formatReactions(r.reactions);
                return {
                    id: r.id,
                    content: r.content,
                    authorId: r.authorId,
                    authorName: r.author.name,
                    createdAt: r.createdAt.toISOString(),
                    isEdited: r.isEdited,
                    isDeleted: r.isDeleted,
                    reactions: replyRx.counts,
                    userReactions: replyRx.userReactions
                }
            })
        };
    });

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Feed
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl lg:text-4xl leading-tight mb-2">
                            {blog.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 pb-4 border-b">
                            <span>By <span className="font-medium text-foreground">{blog.author.name}</span></span>
                            <span>•</span>
                            <span>{new Date(blog.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div
                            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-foreground dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12">
                <CommentSection blogId={blog.id} comments={formattedComments} />
            </div>
        </div>
    );
}
