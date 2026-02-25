import { PublicFeedClient } from '@/app/public-feed-client';
import { getPublicFeed } from '@/app/actions/feed';

export default async function Home() {
  const initialData: any = await getPublicFeed(undefined, 9);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Our Blog</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">Discover amazing articles, tutorials, and insights from our community</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PublicFeedClient initialBlogs={initialData.blogs} initialNextCursor={initialData.nextCursor} />
      </div>

    </div>
  );
}
