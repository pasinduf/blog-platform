import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminReviewClient } from './client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, firstName: true, lastName: true } }
        }
    });

    if (!blog) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-[50vh]">
                <Card className="max-w-md w-full p-6 text-center shadow-sm">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="bg-muted p-4 rounded-full">
                            <FileQuestion className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-xl mb-2">Article Not Found</CardTitle>
                            <CardDescription>
                                The article you are trying to review could not be found. It may have been deleted or the link is incorrect.
                            </CardDescription>
                        </div>
                        <Button asChild className="w-full mt-4">
                            <Link href="/reviews">Return to Reviews</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return <AdminReviewClient blog={blog} />;
}
