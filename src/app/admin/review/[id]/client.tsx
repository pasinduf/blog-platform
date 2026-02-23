'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Wand2, CheckSquare, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AdminReviewClient({ blogId }: { blogId: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isActioning, setIsActioning] = useState(false);

    // MOCK BLOG DATA
    const blog = {
        id: blogId,
        title: blogId === '102' ? 'Why TypeScript is Great' : 'Understanding Next.js App Router',
        content: '<p>Next.js 13 introduced the new App Router. It uses React Server Components by default...</p>',
        // Simulate blogId 102 as being written by the current admin user
        author: { id: blogId === '102' ? user?.id : 'other-user-uuid', name: blogId === '102' ? 'Eve Writer (You)' : 'Alice Writer' },
        status: 'SUBMITTED',
    };

    const isOwnPost = Boolean(user && blog.author.id === user.id);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        // Simulate AI Service Delay
        await new Promise(r => setTimeout(r, 1500));
        setAiSummary({
            summary: 'The author explains the basics of the Next.js App Router and its benefits.',
            keyPoints: ['Server components default', 'New routing paradigms'],
            risks: ['Might be too technical for beginners'],
        });
        setIsGenerating(false);
    };

    const handleAddCommentResubmit = async () => {
        setIsActioning(true);
        // Simulate saving admin comment
        await new Promise(r => setTimeout(r, 800));
        setIsActioning(false);
        console.log(`Added comment: ${comment}`);
        alert('Comment sent to writer for revision.');
        router.push('/admin');
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsPublishing(false);
        console.log('Published blog.');
        alert('Blog Published successfully!');
        router.push('/admin');
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Review Draft</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{blog.title}</CardTitle>
                            <div className="text-sm text-muted-foreground">By {blog.author.name}</div>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose prose-sm sm:prose-base max-w-none text-foreground"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>AI Summary</CardTitle>
                            <Button size="icon" variant="ghost" onClick={handleGenerateSummary} disabled={isGenerating}>
                                {isGenerating ? <Spinner className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {!aiSummary ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    Generate an AI summary to help review this post quickly.
                                </div>
                            ) : (
                                <div className="space-y-4 text-sm mt-2">
                                    <div><span className="font-semibold block">Summary:</span> {aiSummary.summary}</div>
                                    <div>
                                        <span className="font-semibold block">Key Points:</span>
                                        <ul className="list-disc pl-5 text-muted-foreground">
                                            {aiSummary.keyPoints.map((k: string, i: number) => <li key={i}>{k}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-orange-500">Potential Risks:</span>
                                        <ul className="list-disc pl-5 text-muted-foreground">
                                            {aiSummary.risks.map((k: string, i: number) => <li key={i}>{k}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isOwnPost && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Action Blocked</AlertTitle>
                                    <AlertDescription>
                                        You cannot review or publish your own post. It must be approved by another admin.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Leave feedback for writer</label>
                                <Textarea
                                    placeholder="Tell the writer what needs to be changed..."
                                    value={comment}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={handleAddCommentResubmit}
                                    disabled={!comment || isActioning || isOwnPost}
                                >
                                    {isActioning && <Spinner className="mr-2 h-4 w-4" />}
                                    Request Revision
                                </Button>
                            </div>

                            <div className="relative border-t my-4 py-4">
                                <Button
                                    className="w-full"
                                    variant="default"
                                    onClick={handlePublish}
                                    disabled={isPublishing || isOwnPost}
                                >
                                    {isPublishing ? <Spinner className="mr-2 h-4 w-4" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                                    Approve & Publish
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
