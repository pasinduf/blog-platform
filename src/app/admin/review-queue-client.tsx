'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VirtualBlogList, BaseBlog } from '@/components/virtual-blog-list';

interface ReviewQueueClientProps {
    blogs: BaseBlog[];
    currentUserId: string;
}

export function ReviewQueueClient({ blogs, currentUserId }: ReviewQueueClientProps) {
    return (
        <VirtualBlogList
            blogs={blogs}
            renderContent={() => (
                <p className="text-sm text-muted-foreground">
                    Needs admin review, AI summary, and potential feedback.
                </p>
            )}
            renderAction={(blog: any) => (
                <Button asChild className="w-full" disabled={blog.author?.id === currentUserId}>
                    <Link href={`/admin/review/${blog.id}`}>
                        Review Post
                    </Link>
                </Button>
            )}
        />
    );
}
