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
import { Save, Send, UploadCloud, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { saveDraftAction, submitForReviewAction } from '@/app/actions/blog';
import Image from 'next/image';
import { toast } from 'sonner';

// Using mock server action logic for the frontend
export function BlogEditorForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [status, setStatus] = useState(initialData?.status || 'DRAFT');
    const [aiAnalysis, setAiAnalysis] = useState<any>(initialData?.aiAnalysis || null);
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
    const [previewError, setPreviewError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setPreviewError('Please upload a valid image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setPreviewError('Image size must be less than 5MB.');
            return;
        }

        setPreviewError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveDraft = async () => {
        if (!user) return;
        if (!title.trim()) {
            toast.error('Please enter a title before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveDraftAction(draftId, title, content, coverImage);

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
            const result = await submitForReviewAction(draftId, title, content, coverImage);

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
            <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                    <Label className="text-lg">Cover Image (Optional)</Label>
                    <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-muted/30 transition-colors hover:bg-muted/50 w-full h-64 md:h-80 flex flex-col items-center justify-center">
                        {coverImage ? (
                            <>
                                <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setCoverImage(null);
                                            setPreviewError('');
                                        }}
                                        className="gap-2"
                                    >
                                        <X className="w-4 h-4" /> Remove Cover
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-center p-6">
                                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}
                    </div>
                    {previewError && <p className="text-sm text-destructive">{previewError}</p>}
                </div>

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
                            <CardTitle className="text-destructive">AI Feedback</CardTitle>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Comments</CardTitle>
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
