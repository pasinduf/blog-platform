'use client';

import * as React from 'react';
import { Bookmark } from 'lucide-react';
import { toggleBookmarkAction } from '@/app/actions/bookmark';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
    blogId: string;
    initialIsBookmarked: boolean;
    onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({ blogId, initialIsBookmarked, onBookmarkChange }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = React.useState(initialIsBookmarked);
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if wrapped in a link

        if (isLoading) return;

        setIsLoading(true);
        // Optimistic update
        setIsBookmarked(!isBookmarked);

        try {
            const result = await toggleBookmarkAction(blogId);

            if (result.error) {
                setIsBookmarked(isBookmarked);

                if (result.status === 401) {
                    toast.error("Please log in to bookmark articles");
                } else {
                    toast.error(result.error);
                }
            } else {
                if (result.isBookmarked) {
                    toast.success("Article added to bookmarks");
                } else {
                    toast.success("Article removed from bookmarks");
                }
                if (onBookmarkChange && result.isBookmarked !== undefined) {
                    onBookmarkChange(result.isBookmarked);
                }
            }
        } catch (error) {
            // Revert on error
            setIsBookmarked(isBookmarked);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors cursor-pointer ${isBookmarked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
        >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
    );
}
