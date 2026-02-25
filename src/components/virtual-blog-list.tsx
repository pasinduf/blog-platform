'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import BlogCard from './blog-card';

export interface BaseBlog {
    id: string;
    title: string;
    content: string;
    status: string;
    coverImage?: string | null;
    excerpt?: string;
    updatedAt: Date;
    author?: { id?: string; name: string };
    commentCount?: number;
}

interface VirtualBlogListProps<T extends BaseBlog> {
    blogs: T[];
    renderAction?: (blog: T) => React.ReactNode;
    renderContent?: (blog: T) => React.ReactNode;
    hasNextPage?: boolean;
    isNextPageLoading?: boolean;
    fetchNextPage?: () => void;
    maxColumns?: number;
    compact?: boolean;
    hideAuthor?: boolean;
    hideReadingTime?: boolean;
    showStatus?: boolean;
}

export function VirtualBlogList<T extends BaseBlog>({
    blogs,
    renderAction,
    renderContent,
    hasNextPage,
    isNextPageLoading,
    fetchNextPage,
    maxColumns = 2,
    compact = false,
    hideAuthor = false,
    hideReadingTime = false,
    showStatus = false,
}: VirtualBlogListProps<T>) {
    const [columns, setColumns] = React.useState(maxColumns);

    // Update columns based on window width
    React.useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 768) setColumns(1);
            else if (window.innerWidth < 1024) setColumns(Math.min(2, maxColumns));
            else setColumns(maxColumns);
        };
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, [maxColumns]);

    return (
        <div className="flex flex-col gap-8">
            <div className={`grid gap-6 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {blogs.map((blog) => (
                    <BlogCard
                        key={blog.id}
                        blog={blog}
                        renderAction={renderAction}
                        renderContent={renderContent}
                        compact={compact}
                        hideAuthor={hideAuthor}
                        hideReadingTime={hideReadingTime}
                        showStatus={showStatus}
                    />
                ))}
            </div>

            {blogs.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                    No articles found matching your criteria.
                </div>
            )}

            {hasNextPage && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => fetchNextPage?.()}
                        disabled={isNextPageLoading}
                        className="px-6 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-full hover:bg-blue-100 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {isNextPageLoading ? 'Loading...' : 'Load More Articles'}
                    </button>
                </div>
            )}
        </div>
    );
}
