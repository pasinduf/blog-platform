'use client';

import * as React from 'react';
import { incrementBlogView } from '@/app/actions/view';

export function ViewTracker({ blogId }: { blogId: string }) {
    React.useEffect(() => {
        (async () => {
            try {
                await incrementBlogView(blogId);
            } catch (error) {
                console.error('View tracking failed', error);
            }
        })();
    }, [blogId]);

    return null;
}
