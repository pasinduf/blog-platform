'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VirtualBlogList, BaseBlog } from '@/components/virtual-blog-list';
import { getPublicFeed } from '@/app/actions/feed';
import SearchBar from '@/components/search-bar';
import FeaturedBlog from '@/components/ui/featured-blog';

interface PublicFeedClientProps {
    initialBlogs: BaseBlog[];
    initialNextCursor?: string;
}

export function PublicFeedClient({ initialBlogs, initialNextCursor }: PublicFeedClientProps) {
    const [blogs, setBlogs] = React.useState<BaseBlog[]>(initialBlogs);
    const [nextCursor, setNextCursor] = React.useState<string | undefined>(initialNextCursor);
    const [isLoadingNext, setIsLoadingNext] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

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

    const featuedBlog = blogs[0]

    const filteredBlogs = React.useMemo(() => {
        if (!searchQuery.trim()) return blogs;
        const lowerQuery = searchQuery.toLowerCase();
        return blogs.filter((blog) =>
            blog.title.toLowerCase().includes(lowerQuery)
        );
    }, [blogs, searchQuery]);


    const regularBlogs = searchQuery ? filteredBlogs : filteredBlogs.slice(1);

    return (
        <>
            <div className="mb-12 bg-white rounded-2xl shadow-lg px-6 py-4">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="w-full md:w-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your Next Read</h2>
                        <p className="text-gray-600">Browse through published articles</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <SearchBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />
                    </div>
                </div>
            </div>

            {featuedBlog &&
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Featured Article</span>
                        <span className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></span>
                    </h2>
                    <FeaturedBlog blog={featuedBlog} />
                </section>
            }


            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Latest Articles</h2>
                <div className="text-sm text-gray-500">
                    Showing {regularBlogs.length} of {blogs.length} articles
                </div>
            </div>

            <VirtualBlogList
                blogs={regularBlogs}
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
        </>
    );
}
