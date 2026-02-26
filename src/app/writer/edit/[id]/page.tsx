import { BlogEditorForm } from '@/components/blog-editor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getSession();
    if (!user) {
        redirect('/login');
    }
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            adminComments: {
                include: {
                    admin: {
                        select: { name: true }
                    }
                }
            }
        }
    });

    if (!blog) return <div>Not found</div>;
    if (blog.authorId !== user.id) return <div>Unauthorized</div>;

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/writer">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Edit Article</h1>
            </div>

            <BlogEditorForm initialData={blog} />
        </div>
    );
}
