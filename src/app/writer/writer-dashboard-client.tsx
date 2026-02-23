'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VirtualBlogList, BaseBlog } from '@/components/virtual-blog-list';

interface WriterDashboardClientProps {
    blogs: BaseBlog[];
}

export function WriterDashboardClient({ blogs }: WriterDashboardClientProps) {
    return (
        <VirtualBlogList
            blogs={blogs}
            renderContent={(blog: any) => (
                <p className="text-sm text-muted-foreground">
                    {blog.status === 'DRAFT' && 'This post is currently a draft. You can continue editing it.'}
                    {blog.status === 'SUBMITTED' && 'This post is under admin review.'}
                    {blog.status === 'PUBLISHED' && 'This post is live for everyone to read!'}
                </p>
            )}
            renderAction={(blog: any) => (
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/writer/edit/${blog.id}`}>
                        {blog.status === 'DRAFT' ? 'Continue Editing' : 'View / Edit'}
                    </Link>
                </Button>
            )}
        />
    );
}
