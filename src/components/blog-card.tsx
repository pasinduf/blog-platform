"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, User, Clock, ArrowRight, Share2 } from "lucide-react";
import { calculateReadingTime, formatDate } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { BookmarkButton } from "./bookmark-button";
import { ShareButton } from "./share-button";

interface BlogCardProps {
    blog: {
        id: string;
        title: string;
        content: string;
        status: string;
        excerpt?: string;
        updatedAt: Date;
        author?: { id?: string; firstName: string; lastName: string };
        commentCount?: number;
        coverImage?: string | null;
        isBookmarked?: boolean;
    };
    renderAction?: (blog: any) => React.ReactNode;
    renderContent?: (blog: any) => React.ReactNode;
    compact?: boolean;
    hideAuthor?: boolean;
    hideReadingTime?: boolean;
    showStatus?: boolean;
}

export default function BlogCard({ blog, renderAction, renderContent, compact = false, hideAuthor = false, hideReadingTime = false, showStatus = false }: BlogCardProps) {

    const readingTime = calculateReadingTime(blog.content);

    if (compact) {
        return (
            <div className="h-full">
                <div className="relative h-40 overflow-hidden">
                    {blog.coverImage ? (
                        <Image src={blog.coverImage} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <span className="text-3xl text-gray-400">📝</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm">{blog.title}</h3>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-3">{blog.excerpt || "No excerpt available"}</p>
                    <Link href={`/article/${blog.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                        Read more
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100">
            <div className="relative h-48 overflow-hidden">
                {blog.coverImage ? (
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">📝</span>
                    </div>
                )}
                {/* <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium text-blue-700 rounded-full">{post.category.name}</span>
                    </div> */}
            </div>

            <div className="p-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    {blog.updatedAt &&
                        <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>{formatDate(blog.updatedAt)}</span>
                        </div>
                    }

                    {!hideAuthor &&
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{blog.author?.firstName} {blog.author?.lastName}</span>
                        </div>
                    }

                    {!hideReadingTime &&
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{readingTime}min read</span>
                        </div>
                    }
                    {showStatus &&
                        <div className="ml-auto flex items-center">
                            <Badge variant={blog.status === 'PUBLISHED' ? 'default' : blog.status === 'DRAFT' ? 'warning' : 'secondary'}>{blog.status}</Badge>
                        </div>
                    }
                </div>

                {blog.status === 'PUBLISHED' ?
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/article/${blog.id}`}>{blog.title}</Link>
                    </h3> :

                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                    </h3>
                }


                {renderContent && (
                    <div className="flex-1">
                        {renderContent(blog)}
                    </div>
                )}

                {blog.excerpt && <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>}

                {renderAction ?
                    <div className="flex justify-between items-center">
                        {/* <div className="text-sm font-medium text-muted-foreground">
                            {blog.commentCount !== undefined && `${blog.commentCount} Comments`}
                        </div> */}
                        <div className="flex-1 flex justify-end mt-4">
                            {renderAction(blog)}
                        </div>
                    </div>
                    :
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <Link href={`/article/${blog.id}`} className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 group/link">
                            Read Article
                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookmarkButton blogId={blog.id} initialIsBookmarked={!!blog.isBookmarked} />
                            <ShareButton blogId={blog.id} />
                        </div>
                    </div>
                }
            </div>
        </article>
    );
}
