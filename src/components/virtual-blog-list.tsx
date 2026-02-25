'use client';

import * as React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface BaseBlog {
    id: string;
    title: string;
    status?: string;
    excerpt?: string;
    updatedAt: Date;
    author?: { id?: string; name: string };
    commentCount?: number;
}

interface VirtualBlogListProps<T extends BaseBlog> {
    blogs: T[];
    renderAction: (blog: T) => React.ReactNode;
    renderContent?: (blog: T) => React.ReactNode;
    hasNextPage?: boolean;
    isNextPageLoading?: boolean;
    fetchNextPage?: () => void;
    maxColumns?: number;
}

export function VirtualBlogList<T extends BaseBlog>({
    blogs,
    renderAction,
    renderContent,
    hasNextPage,
    isNextPageLoading,
    fetchNextPage,
    maxColumns = 2,
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

    // 2. Set up the window virtualizer
    const listRef = React.useRef<HTMLDivElement>(null);
    const virtualizer = useWindowVirtualizer({
        count: Math.ceil(blogs.length / columns) + (hasNextPage ? 1 : 0),
        estimateSize: () => 200, // Estimated height of each row in pixels
        overscan: 5,
    });

    const virtualItems = virtualizer.getVirtualItems();

    React.useEffect(() => {
        const [lastItem] = [...virtualItems].reverse();
        if (!lastItem) return;

        if (
            lastItem.index >= Math.ceil(blogs.length / columns) - 1 &&
            hasNextPage &&
            !isNextPageLoading
        ) {
            fetchNextPage?.();
        }
    }, [
        hasNextPage,
        fetchNextPage,
        blogs.length,
        isNextPageLoading,
        virtualItems,
        columns,
    ]);

    return (
        <div className="flex flex-col gap-6" ref={listRef}>
            {/* Virtualized Container */}
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualItems.map((virtualItem) => {
                    const rowStartIndex = virtualItem.index * columns;
                    const isLoaderRow = rowStartIndex >= blogs.length;
                    const rowBlogs = blogs.slice(rowStartIndex, rowStartIndex + columns);

                    if (isLoaderRow) {
                        return (
                            <div
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                    paddingBottom: '24px',
                                }}
                            >
                                <div className="py-6 text-center text-muted-foreground w-full">Loading more articles...</div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                                paddingBottom: '24px', // Gap between rows
                            }}
                        >
                            <div className={`grid gap-6 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {rowBlogs.map((blog) => (
                                    <Card key={blog.id} className="flex flex-col w-full h-full">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-4">
                                                <CardTitle className="text-xl line-clamp-2">
                                                    {blog.title}
                                                </CardTitle>
                                                {blog.status && <Badge variant={blog.status === 'PUBLISHED' ? 'success' : blog.status === 'DRAFT' ? 'warning' : 'secondary'}>{blog.status}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                                {blog.author && (
                                                    <>
                                                        <span>By <span className="font-medium text-foreground">{blog.author.name}</span></span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                <span>{new Date(blog.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </CardHeader>

                                        {renderContent && (
                                            <CardContent className="flex-1">
                                                {renderContent(blog)}
                                            </CardContent>
                                        )}

                                        <CardFooter className="flex justify-between items-center border-t pt-4">
                                            <div className="text-sm font-medium text-muted-foreground">
                                                {blog.commentCount !== undefined && `${blog.commentCount} Comments`}
                                            </div>
                                            <div className="flex-1 flex justify-end">
                                                {renderAction(blog)}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {blogs.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                    No articles found matching your criteria.
                </div>
            )}
        </div>
    );
}
