'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, LinkedinIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
    blogId: string;
}

export function ShareButton({ blogId }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCopyLink = async () => {
        try {
            const url = `${window.location.origin}/article/${blogId}`;
            await navigator.clipboard.writeText(url);
            toast.success('Link copied successfully');
        } catch (error) {
            toast.error('Failed to copy link');
        } finally {
            setIsOpen(false);
        }
    };

    const handleShareLinkedIn = () => {
        const url = `${window.location.origin}/article/${blogId}`;
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors outline-none cursor-pointer">
                    <Share2 className="w-5 h-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2">
                    <LinkIcon className="h-4 w-4" />
                    <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareLinkedIn} className="cursor-pointer gap-2">
                    <LinkedinIcon className="h-4 w-4" />
                    <span>Share on LinkedIn</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
