import { PublicFeedClient } from '@/app/public-feed-client';
import { getPublicFeed } from '@/app/actions/feed';

export default async function Home() {
  const initialData: any = await getPublicFeed();

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


        <div className="mb-12 bg-white rounded-2xl shadow-lg px-6 py-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full md:w-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your Next Read</h2>
              <p className="text-gray-600">Browse through published articles</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">

            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Public Feed</h1>
        <p className="text-muted-foreground mt-2">Discover the latest articles published by your organization members.</p>

        <PublicFeedClient initialBlogs={initialData.blogs} initialNextCursor={initialData.nextCursor} />
      </div>

    </div>
  );
}
