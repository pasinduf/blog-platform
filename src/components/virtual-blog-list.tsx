'use client';

import * as React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface BaseBlog {
    id: string;
    title: string;
    status?: string;
    excerpt?: string;
    updatedAt: string;
    author?: { id?: string; name: string };
    commentCount?: number;
}

interface VirtualBlogListProps<T extends BaseBlog> {
    blogs: T[];
    renderAction: (blog: T) => React.ReactNode;
    renderStatus?: (blog: T) => React.ReactNode;
    renderContent?: (blog: T) => React.ReactNode;
}

export function VirtualBlogList<T extends BaseBlog>({
    blogs,
    renderAction,
    renderStatus,
    renderContent,
}: VirtualBlogListProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [columns, setColumns] = React.useState(3);

    // Update columns based on window width
    React.useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 768) setColumns(1);
            else if (window.innerWidth < 1024) setColumns(2);
            else setColumns(3);
        };
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // 1. Filter blogs based on search query
    const filteredBlogs = React.useMemo(() => {
        if (!searchQuery.trim()) return blogs;
        const lowerQuery = searchQuery.toLowerCase();
        return blogs.filter((blog) =>
            blog.title.toLowerCase().includes(lowerQuery)
        );
    }, [blogs, searchQuery]);

    // 2. Set up the window virtualizer
    const listRef = React.useRef<HTMLDivElement>(null);
    const virtualizer = useWindowVirtualizer({
        count: Math.ceil(filteredBlogs.length / columns),
        estimateSize: () => 200, // Estimated height of each row in pixels
        overscan: 5,
    });

    return (
        <div className="flex flex-col gap-6" ref={listRef}>
            {/* Search Input */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Virtualized Container */}
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                    const rowStartIndex = virtualItem.index * columns;
                    const rowBlogs = filteredBlogs.slice(rowStartIndex, rowStartIndex + columns);

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
                                                {renderStatus ? (
                                                    renderStatus(blog)
                                                ) : (
                                                    blog.status && <Badge variant="secondary">{blog.status}</Badge>
                                                )}
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

            {filteredBlogs.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                    No articles found matching "{searchQuery}".
                </div>
            )}
        </div>
    );
}
