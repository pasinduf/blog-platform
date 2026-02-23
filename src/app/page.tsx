import { PublicFeedClient } from '@/app/public-feed-client';
import { getPublicFeed } from '@/app/actions/feed';

export default async function Home() {
  const initialData = await getPublicFeed();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Public Feed</h1>
        <p className="text-muted-foreground mt-2">Discover the latest articles published by your organization members.</p>
      </div>

      <PublicFeedClient initialBlogs={initialData.blogs} initialNextCursor={initialData.nextCursor} />
    </div>
  );
}
