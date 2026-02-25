import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bookmark, CalendarDays, Clock, Eye, Share2 } from 'lucide-react';
import { CommentSection } from '@/components/comment-section';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from "next/image";
import { calculateReadingTime, formatDate } from '@/lib/utils';

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

    const readingTime = calculateReadingTime(blog?.content);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="mb-6">
                <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Articles
                        </Link>
                    </div>
                </div>


                <div className="relative">
                    {blog.coverImage && (
                        <div className="relative h-64 md:h-96 overflow-hidden">
                            <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" priority sizes="100vw" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div></div>
                                <div className="flex items-center gap-4">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {blog.author?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{blog.author?.name}</p>
                                        <p className="text-sm">Author</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        <span>{formatDate(blog.updatedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{readingTime} min read</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>1.2K views</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* <Card>
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
                    </Card> */}
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <article className="lg:w-full">
                            <div
                                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-foreground dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">Tutorial</span>
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">Web Development</span>
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">Next.js</span>
                                </div>
                            </div>


                            {/* <div className="mt-12">
                                <AuthorBio author={post.author} />
                            </div> */}

                        </article>
                    </div>

                    {/* Related Posts */}
                    <div className="mt-16">

                    </div>

                    <div className="mt-12">
                        <CommentSection blogId={blog.id} comments={formattedComments} />
                    </div>
                </div>

            </div>

        </div>
    );
}
