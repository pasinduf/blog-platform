import { BlogEditorForm } from '@/components/blog-editor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ComposePage() {
    const user = await getSession();
    if (!user) redirect('/login');
    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/writer">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Create New Article</h1>
            </div>

            <BlogEditorForm />
        </div>
    );
}
