'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Wand2, CheckSquare, AlertTriangle, CalendarDays } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateAdminSummaryAction, requestRevisionAction, publishBlogAction } from '@/app/actions/blog';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export function AdminReviewClient({ blog }: { blog: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState<any>(blog.adminAiSummary || null);
    const [comment, setComment] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isOwnPost = Boolean(user && blog.author.id === user.id);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        try {
            const result = await generateAdminSummaryAction(blog.id);
            if (result.error) {
                toast.error(result.error);
            } else if (result.success && result.summary) {
                setAiSummary(result.summary);
                toast.success('AI summary generated successfully.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate summary.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddCommentResubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await requestRevisionAction(blog.id, comment);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Comment sent to writer for revision.');
                router.push('/admin');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to request revision.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const result = await publishBlogAction(blog.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Blog Published successfully!');
                router.push('/admin');
            }
        } catch (error) {
            toast.error('Failed to publish blog.');
        } finally {
            setIsPublishing(false);
        }
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
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                                <div className="text-sm text-muted-foreground">
                                    By {blog.author.firstName} {blog.author.lastName}
                                </div>
                                <div className="flex items-center gap-1">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>{formatDate(blog.updatedAt)}</span>
                                </div>
                            </div>
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>AI Summary</CardTitle>
                            <Button size="icon" onClick={handleGenerateSummary} disabled={isGenerating || isOwnPost || blog.status !== 'SUBMITTED'}>
                                {isGenerating ? <Spinner className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isGenerating && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Spinner className="h-5 w-5" />
                                        <span className="font-semibold">Analyzing the content...</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-muted-foreground/20 rounded w-1/4 animate-pulse"></div>
                                        <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-muted-foreground/20 rounded w-5/6 animate-pulse"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-muted-foreground/20 rounded w-1/4 animate-pulse"></div>
                                        <div className="h-4 bg-muted-foreground/20 rounded w-full animate-pulse"></div>
                                        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse"></div>
                                    </div>
                                </div>
                            )}

                            {!isGenerating && !aiSummary && (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    Generate an AI summary to help review this post quickly.
                                </div>
                            )}

                            {!isGenerating && aiSummary && (
                                <div className="space-y-4 text-sm">
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
                                    disabled={isOwnPost}
                                />
                                <Button
                                    className="w-full mt-2"
                                    variant="secondary"
                                    onClick={handleAddCommentResubmit}
                                    disabled={!comment || isSubmitting || isOwnPost}
                                >
                                    {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
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
