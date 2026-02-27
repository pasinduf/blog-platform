'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BaseBlog } from '@/components/virtual-blog-list';
import { getPendingReviewBlogs } from '../actions/admin-users';
import SearchBar from '@/components/search-bar';
import { Spinner } from '@/components/ui/spinner';
import BlogCard from '@/components/blog-card';

interface ReviewQueueClientProps {
    blogs: BaseBlog[];
    currentUserId: string;
}

export function ReviewQueueClient({ blogs: initialBlogs, currentUserId }: ReviewQueueClientProps) {

    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [activeSearch, setActiveSearch] = React.useState('');
    const [blogs, setBlogs] = React.useState<BaseBlog[]>(initialBlogs);
    const [isLoading, setIsLoading] = React.useState(false);


    React.useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            try {
                const query = activeSearch.trim().length >= 3 ? activeSearch : '';
                const data = await getPendingReviewBlogs(query);
                setBlogs(data);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogs();
    }, [activeSearch]);


    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm === '' || searchTerm.trim().length >= 0) {
                if (activeSearch !== searchTerm) {
                    setActiveSearch(searchTerm);
                }
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, activeSearch]);


    if (initialBlogs.length === 0 && !searchTerm) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg border-dashed gap-4">
                <p className="text-muted-foreground text-lg">No pending review articles.</p>
            </div>
        );
    }


    return (

        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="w-full md:w-auto">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
                                        Needs admin review, AI summary, and potential feedback.
                                    </p>
                                )}
                                renderAction={(blog: any) => (
                                    <Button asChild className="w-full" disabled={blog.author?.id === currentUserId}>
                                        <Link href={`/admin/review/${blog.id}`}>
                                            Review Article
                                        </Link>
                                    </Button>
                                )}
                                hideReadingTime={true}
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
