'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VirtualBlogList, BaseBlog } from '@/components/virtual-blog-list';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface WriterDashboardClientProps {
    blogs: BaseBlog[];
}

export function WriterDashboardClient({ blogs }: WriterDashboardClientProps) {
    const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

    if (blogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg border-dashed gap-4">
                <p className="text-muted-foreground text-lg">Start writing your first blog.</p>
                <Button asChild>
                    <Link href="/writer/compose">Create Blog</Link>
                </Button>
            </div>
        );
    }

    const filteredBlogs = React.useMemo(() => {
        if (statusFilter === 'ALL') return blogs;
        return blogs.filter((b) => b.status === statusFilter);
    }, [blogs, statusFilter]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                        </SelectContent>
                    </Select>

                    {statusFilter !== 'ALL' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter('ALL')}
                            className="h-8 px-2 lg:px-3 text-muted-foreground"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
                </div>
            </div>

            <VirtualBlogList
                blogs={filteredBlogs}
                maxColumns={3}
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
                hideAuthor={true}
                hideReadingTime={true}
                showStatus={true}
            />
        </div>
    );
}
