'use client';

import * as React from 'react';
import { BaseBlog } from '@/components/virtual-blog-list';
import { BookmarkButton } from '@/components/bookmark-button';
import BlogCard from '@/components/blog-card';

interface BookmarksClientProps {
    initialBlogs: BaseBlog[];
}

export function BookmarksClient({ initialBlogs }: BookmarksClientProps) {
    const [blogs, setBlogs] = React.useState<BaseBlog[]>(initialBlogs);

    return (
        <div className="flex flex-col gap-8">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                    <BlogCard
                        key={blog.id}
                        blog={blog}
                        renderAction={(blog: any) => (
                            <div className="flex justify-between items-center w-full relative z-20">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {blog.commentCount !== undefined && `${blog.commentCount} Comments`}
                                </span>
                                <BookmarkButton
                                    blogId={blog.id}
                                    initialIsBookmarked={true}
                                    onBookmarkChange={(isBookmarked) => {
                                        if (!isBookmarked) {
                                            setBlogs(prev => prev.filter(b => b.id !== blog.id));
                                        }
                                    }}
                                />
                            </div>
                        )}
                        hideReadingTime={true}
                    />
                ))}
            </div>

            {blogs.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                    No bookmarks saved.
                </div>
            )}
        </div>
    );
}
