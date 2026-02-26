'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BaseBlog } from '@/components/virtual-blog-list';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import SearchBar from '@/components/search-bar';
import { getAuthorBlogs } from '@/app/actions/writer';
import { Spinner } from '@/components/ui/spinner';
import BlogCard from '@/components/blog-card';

interface WriterDashboardClientProps {
    blogs: BaseBlog[];
}

export function WriterDashboardClient({ blogs: initialBlogs }: WriterDashboardClientProps) {
    const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [activeSearch, setActiveSearch] = React.useState('');

    const [blogs, setBlogs] = React.useState<BaseBlog[]>(initialBlogs);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            try {
                const query = activeSearch.trim().length >= 3 ? activeSearch : '';
                const data = await getAuthorBlogs(statusFilter, query);
                setBlogs(data);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogs();
    }, [statusFilter, activeSearch]);


    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm === '' || searchTerm.trim().length >= 3) {
                if (activeSearch !== searchTerm) {
                    setActiveSearch(searchTerm);
                }
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, activeSearch]);


    if (initialBlogs.length === 0 && !searchTerm && statusFilter === 'ALL') {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg border-dashed gap-4">
                <p className="text-muted-foreground text-lg">Start writing your first blog.</p>
                <Button asChild>
                    <Link href="/writer/compose">Create Article</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="w-full md:w-auto">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>

                <div className="w-full md:w-auto flex md:justify-end">
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
                </div>

            </div>
            <div className="relative">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-16 w-full gap-4">
                        <Spinner size="lg" />
                        <span className="text-muted-foreground">Loading...</span>
                    </div>
                )}

                <div className="flex flex-col gap-8">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                blog={blog}
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
                        ))}
                    </div>

                    {blogs.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                            No articles found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
