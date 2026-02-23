'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VirtualBlogList, BaseBlog } from '@/components/virtual-blog-list';

interface PublicFeedClientProps {
    blogs: BaseBlog[];
}

export function PublicFeedClient({ blogs }: PublicFeedClientProps) {
    return (
        <VirtualBlogList
            blogs={blogs}
            renderStatus={() => null}
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
