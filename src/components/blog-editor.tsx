'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { saveDraftAction, submitForReviewAction } from '@/app/actions/blog';
import { toast } from 'sonner';

// Using mock server action logic for the frontend
export function BlogEditorForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [status, setStatus] = useState(initialData?.status || 'DRAFT');
    const [aiAnalysis, setAiAnalysis] = useState<any>(initialData?.aiAnalysis || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);

    const handleSaveDraft = async () => {
        if (!user) return;
        if (!title.trim()) {
            toast.error('Please enter a title before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveDraftAction(draftId, title, content);

            if (result.error) {
                toast.error(result.error);
            } else if (result.success && result.blogId) {
                toast.success('Draft saved successfully!');

                if (!draftId) {
                    setDraftId(result.blogId);
                    // Update URL without full reload so the user continues editing
                    window.history.replaceState(null, '', `/writer/edit/${result.blogId}`);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!user) return;
        if (!title.trim() || !content.trim() || content === '<p></p>') {
            toast.error('Please enter a title and content before submitting.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await submitForReviewAction(draftId, title, content);

            if (result.error) {
                toast.error(result.error);
            } else if (result.success && result.blogId) {
                toast.success('Submitted for review successfully!');

                if (!draftId) {
                    setDraftId(result.blogId);
                    window.history.replaceState(null, '', `/writer/edit/${result.blogId}`);
                }

                if (result.aiAnalysis) {
                    setAiAnalysis(result.aiAnalysis);
                }
                setStatus('SUBMITTED');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred during submission.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor Main Area */}
            <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        placeholder="Enter a catchy title..."
                        className="text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-lg">Content</Label>
                    <RichTextEditor content={content} onChange={setContent} />
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                        {isSaving && <Spinner className="mr-2 h-4 w-4" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>
                    <Button onClick={handleSubmitForReview} disabled={isAnalyzing || isSaving || !title || !content}>
                        {isAnalyzing && <Spinner className="mr-2 h-4 w-4" />}
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Review
                    </Button>
                </div>
            </div>

            {/* Sidebar: AI Feedback & Meta */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Article Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Current Status:</span>
                            <Badge variant={status === 'PUBLISHED' ? 'success' : status === 'DRAFT' ? 'warning' : 'secondary'}>
                                {status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {aiAnalysis && (
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Feedback</CardTitle>
                            <CardDescription>Generated during submission</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm font-medium">Clarity Score</span>
                                <div className="text-2xl font-bold text-primary">{aiAnalysis.clarityScore}/100</div>
                            </div>
                            <div>
                                <span className="text-sm font-medium mb-1 block">Strengths</span>
                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                    {aiAnalysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <span className="text-sm font-medium mb-1 block text-destructive">Issues</span>
                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                    {aiAnalysis.issues.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <span className="text-sm font-medium mb-1 block">Suggestions</span>
                                <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                                    {aiAnalysis.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {initialData?.adminComments && initialData.adminComments.length > 0 && (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Admin Comments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {initialData.adminComments.map((comment: any) => (
                                <div key={comment.id} className="p-3 bg-secondary rounded-md text-sm">
                                    <span className="block font-medium mb-1">{comment.admin ? `${comment.admin.firstName} ${comment.admin.lastName}` : 'Admin'}</span>
                                    <p className="text-muted-foreground">{comment.content}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
