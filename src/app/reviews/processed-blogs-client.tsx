'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/search-bar';
import { Spinner } from '@/components/ui/spinner';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MoreHorizontal, Link as LinkIcon } from 'lucide-react';
import { getProcessedBlogs, searchAuthors, updateBlogStatusAction } from '../actions/processed-blogs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface ProcessedBlogsClientProps {
    currentUserId: string;
}

export function ProcessedBlogsClient({ currentUserId }: ProcessedBlogsClientProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [activeSearch, setActiveSearch] = React.useState('');

    // Author search state
    const [authorSearchTerm, setAuthorSearchTerm] = React.useState('');
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = React.useState(false);
    const [selectedAuthor, setSelectedAuthor] = React.useState<{ id: string, name: string } | null>(null);
    const [authors, setAuthors] = React.useState<any[]>([]);

    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const authorIdFilter = selectedAuthor ? selectedAuthor.id : 'all';

    const [blogs, setBlogs] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isStatusUpdating, setIsStatusUpdating] = React.useState(false);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalCount, setTotalCount] = React.useState(0);

    // Click outside handler for author dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAuthorDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search Authors on input change
    React.useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const data = await searchAuthors(authorSearchTerm);
                setAuthors(data);
            } catch (error) {
                console.error("Failed to fetch authors:", error);
            }
        };

        const handler = setTimeout(() => {
            if (isAuthorDropdownOpen) {
                fetchAuthors();
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [authorSearchTerm, isAuthorDropdownOpen]);

    // Initial load when opening dropdown empty
    const handleDropdownOpen = () => {
        setIsAuthorDropdownOpen(true);
        if (authors.length === 0) {
            searchAuthors('').then(setAuthors).catch(console.error);
        }
    };

    // Debounce Title search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (activeSearch !== searchTerm) {
                setActiveSearch(searchTerm);
                setCurrentPage(1); // Reset to page 1 on new search
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, activeSearch]);

    // Fetch blogs
    const fetchBlogs = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getProcessedBlogs(currentPage, 10, activeSearch, authorIdFilter);
            setBlogs(data.blogs);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        } catch (error) {
            console.error("Failed to fetch processed blogs:", error);
            toast.error("Failed to load blogs");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, activeSearch, authorIdFilter]);

    React.useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);



    const handleStatusChange = async (blogId: string, newStatus: 'DRAFT' | 'SUBMITTED') => {
        setIsStatusUpdating(true);
        try {
            const res = await updateBlogStatusAction(blogId, newStatus);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(`Blog status changed to ${newStatus}`);
                fetchBlogs(); // Refetch to get updated list
            }
        } catch (error) {
            toast.error("An error occurred while updating status");
        } finally {
            setIsStatusUpdating(false);
        }
    };

    return (
        <Card className="w-full shadow-sm">
            <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Processed Articles</CardTitle>
                        <CardDescription className="mt-1">View and manage all reviewed and published articles.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full lg:max-w-2xl items-center gap-2">
                        <div className="w-full">
                            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        </div>
                        <div className="w-full" ref={dropdownRef}>
                            <div className="relative">
                                <Input
                                    placeholder="Search Author..."
                                    value={selectedAuthor ? selectedAuthor.name : authorSearchTerm}
                                    onChange={(e) => {
                                        setAuthorSearchTerm(e.target.value);
                                        if (selectedAuthor) setSelectedAuthor(null);
                                        setIsAuthorDropdownOpen(true);
                                        setCurrentPage(1);
                                    }}
                                    onFocus={handleDropdownOpen}
                                    className="w-full pr-8"
                                />
                                {selectedAuthor && (
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                                        onClick={() => {
                                            setSelectedAuthor(null);
                                            setAuthorSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Clear Author Filter"
                                    >
                                        ✕
                                    </button>
                                )}
                                {isAuthorDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-auto">
                                        {(!authorSearchTerm || selectedAuthor) && (
                                            <div
                                                className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                                                onClick={() => {
                                                    setSelectedAuthor(null);
                                                    setAuthorSearchTerm('');
                                                    setIsAuthorDropdownOpen(false);
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                All Authors
                                            </div>
                                        )}
                                        {authors.length === 0 ? (
                                            <div className="px-2 py-2 text-sm text-muted-foreground text-center">No authors found</div>
                                        ) : (
                                            authors.map((author) => (
                                                <div
                                                    key={author.id}
                                                    className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                                                    onClick={() => {
                                                        setSelectedAuthor({ id: author.id, name: `${author.firstName} ${author.lastName}` });
                                                        setAuthorSearchTerm(`${author.firstName} ${author.lastName}`);
                                                        setIsAuthorDropdownOpen(false);
                                                        setCurrentPage(1);
                                                    }}
                                                >
                                                    {author.firstName} {author.lastName}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative border rounded-lg overflow-x-auto w-full">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10 w-full min-h-[300px]">
                            <Spinner size="lg" />
                        </div>
                    )}

                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Title</th>
                                <th scope="col" className="px-6 py-3 font-medium">Author</th>
                                <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                <th scope="col" className="px-6 py-3 font-medium">Score</th>
                                <th scope="col" className="px-6 py-3 font-medium">Tags</th>
                                <th scope="col" className="px-6 py-3 font-medium">Published Date</th>
                                <th scope="col" className="px-6 py-3 font-medium">Published By</th>
                                <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                                        No processed blogs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr key={blog.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-6 py-4 font-medium truncate max-w-[200px]" title={blog.title}>
                                            {blog.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {blog.author.firstName} {blog.author.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {blog.status}
                                                </Badge>
                                                {blog.status === 'PUBLISHED' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                        title="Copy Article Link"
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/article/${blog.id}`;
                                                            navigator.clipboard.writeText(url);
                                                            toast.success("Article link copied to clipboard");
                                                        }}
                                                    >
                                                        <LinkIcon className="h-3 w-3" />
                                                        <span className="sr-only">Copy Link</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-primary">
                                            {blog.clarityScore !== null ? `${blog.clarityScore}/100` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(!blog.adminAiSummary || !blog.adminAiSummary.tags || !Array.isArray(blog.adminAiSummary.tags)) ? (
                                                    <span>-</span>
                                                ) : (
                                                    blog.adminAiSummary.tags.map((tag: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="text-xs font-normal whitespace-nowrap">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {blog.status === 'PUBLISHED' && blog.publishedAt ? formatDate(blog.publishedAt) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {blog.status === 'PUBLISHED' && blog.publishedBy ?
                                                `${blog.publishedBy.firstName} ${blog.publishedBy.lastName}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {blog.status === 'PUBLISHED' ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={isStatusUpdating}>
                                                            <MoreHorizontal className="w-4 h-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleStatusChange(blog.id, 'DRAFT')}>
                                                            Change to DRAFT
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(blog.id, 'SUBMITTED')}>
                                                            Change to SUBMITTED
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <span className="text-muted-foreground px-4">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalCount > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} records
                        </div>
                        <PaginationWrapper
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
