'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VirtualBlogList, BaseBlog } from '@/components/virtual-blog-list';
import { getPublicFeed } from '@/app/actions/feed';

interface PublicFeedClientProps {
    initialBlogs: BaseBlog[];
    initialNextCursor?: string;
}

export function PublicFeedClient({ initialBlogs, initialNextCursor }: PublicFeedClientProps) {
    const [blogs, setBlogs] = React.useState<BaseBlog[]>(initialBlogs);
    const [nextCursor, setNextCursor] = React.useState<string | undefined>(initialNextCursor);
    const [isLoadingNext, setIsLoadingNext] = React.useState(false);

    const fetchNextPage = React.useCallback(async () => {
        if (!nextCursor || isLoadingNext) return;
        setIsLoadingNext(true);
        try {
            const data = await getPublicFeed(nextCursor, 9);
            setBlogs(prev => [...prev, ...data.blogs]);
            setNextCursor(data.nextCursor);
        } catch (error) {
            console.error('Failed to fetch more blogs', error);
        } finally {
            setIsLoadingNext(false);
        }
    }, [nextCursor, isLoadingNext]);

    return (
        <VirtualBlogList
            blogs={blogs}
            hasNextPage={!!nextCursor}
            isNextPageLoading={isLoadingNext}
            fetchNextPage={fetchNextPage}
            maxColumns={2}
            renderContent={(blog) => (
                <p className="text-muted-foreground line-clamp-3">
                    {blog.excerpt}
                </p>
            )}
            renderAction={(blog) => (
                <Button asChild variant="outline">
                    <Link href={`/article/${blog.id}`}>Read More</Link>
                </Button>
            )}
        />
    );
}
