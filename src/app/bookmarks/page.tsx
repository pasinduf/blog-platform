import { getBookmarksAction } from '@/app/actions/bookmark';
import { BookmarksClient } from './bookmarks-client';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { BaseBlog } from '@/components/virtual-blog-list';

export const metadata = {
    title: 'My Bookmarks | BlogHub',
    description: 'View your saved articles',
};

export default async function BookmarksPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const initialData = await getBookmarksAction();

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-12 bg-white rounded-2xl shadow-lg px-6 py-4">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Bookmarks</h2>
                        <p className="text-gray-600">All the articles you've saved for later</p>
                    </div>
                </div>
            </div>

            <BookmarksClient initialBlogs={initialData.blogs} />
        </div>
    );
}
