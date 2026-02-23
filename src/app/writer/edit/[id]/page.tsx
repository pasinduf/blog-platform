import { BlogEditorForm } from '@/components/blog-editor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
// import { BlogService } from '@/services/blog-service';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getSession();
    if (!user) {
        redirect('/login');
    }
    const { id } = await params;
    // In a real app, we'd fetch the blog by ID using BlogService
    // const blog = await BlogService.getBlogById(id);
    // if (!blog) return <div>Not found</div>;

    // Mocking data for UI MVP
    const blog = {
        id: id,
        title: 'Understanding Next.js App Router',
        content: '<p>Next.js 13 introduced the new App Router...</p>',
        status: 'SUBMITTED',
        aiAnalysis: {
            clarityScore: 78,
            strengths: ['Great topic choice', 'Concise intro'],
            issues: ['Needs more code examples'],
            suggestions: ['Add a section demonstrating Server Actions.'],
        },
        adminComments: [
            { id: 'c1', content: 'Good start, but please expand on data fetching.', admin: { name: 'Bob Admin' } }
        ]
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/writer">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Edit Post</h1>
            </div>

            <BlogEditorForm initialData={blog} />
        </div>
    );
}
