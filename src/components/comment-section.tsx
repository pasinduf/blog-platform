'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Reply, ThumbsUp, Heart, ThumbsDown, Edit2, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { addComment, addReply, editComment, deleteComment, toggleReaction } from '@/app/actions/comment';

type ReactionType = 'LIKE' | 'HEART' | 'DISLIKE';

export interface CommentType {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    replies?: CommentType[];
    isEdited?: boolean;
    isDeleted?: boolean;
    reactions?: {
        like: number;
        heart: number;
        dislike: number;
    } & Record<string, number>;
    userReactions?: Record<string, 'like' | 'heart' | 'dislike'>;
}

type Updater = (c: CommentType) => CommentType;

const updateCommentRecursive = (list: CommentType[], targetId: string, updater: Updater): CommentType[] => {
    return list.map(c => {
        if (c.id === targetId) return updater(c);
        if (c.replies) return { ...c, replies: updateCommentRecursive(c.replies, targetId, updater) };
        return c;
    });
};

export function CommentSection({ blogId, comments: initialComments }: { blogId: string, comments: CommentType[] }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentType[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track which comment ID we are replying to
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    // Track editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return;
        setIsSubmitting(true);

        try {
            const res = await addComment(blogId, newComment);
            const newC: CommentType = {
                id: res.comment.id,
                content: res.comment.content,
                authorId: user.id,
                authorName: `${user.firstName} ${user.lastName}`,
                createdAt: res.comment.createdAt.toString(),
                replies: []
            };
            setComments([newC, ...comments]);
            setNewComment('');
            toast.success('Comment posted successfully');
        } catch (error) {
            toast.error('Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePostReply = async (parentId: string) => {
        if (!replyText.trim() || !user) return;
        setIsSubmitting(true);

        try {
            const res = await addReply(blogId, parentId, replyText);
            setComments(prev => updateCommentRecursive(prev, parentId, c => ({
                ...c,
                replies: [
                    ...(c.replies || []),
                    {
                        id: res.comment.id,
                        content: res.comment.content,
                        authorId: user.id,
                        authorName: `${user.firstName} ${user.lastName}`,
                        createdAt: res.comment.createdAt.toString()
                    }
                ]
            })));
            setReplyingTo(null);
            setReplyText('');
            toast.success('Reply posted successfully');
        } catch (error) {
            toast.error('Failed to post reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (id: string) => {
        if (!editText.trim()) return;
        try {
            await editComment(id, blogId, editText);
            setComments(prev => updateCommentRecursive(prev, id, c => ({ ...c, content: editText, isEdited: true })));
            setEditingId(null);
            setEditText('');
            toast.success('Comment updated successfully');
        } catch (error) {
            toast.error('Failed to update comment');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteComment(id, blogId);
            setComments(prev => updateCommentRecursive(prev, id, c => ({ ...c, isDeleted: true, content: '[This comment was deleted]' })));
            toast.success('Comment deleted successfully');
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const handleReact = async (id: string, type: 'like' | 'heart' | 'dislike') => {
        if (!user) return;

        // Optimistically update
        setComments(prev => updateCommentRecursive(prev, id, c => {
            const currentReactions = c.reactions || { like: 0, heart: 0, dislike: 0 };
            const currentUserReactions = c.userReactions || {};
            const previousReactionType = currentUserReactions[user.id];

            const newReactions = { ...currentReactions };
            const newUserReactions = { ...currentUserReactions };

            if (previousReactionType === type) {
                // Toggle off
                newReactions[type] = Math.max(0, newReactions[type] - 1);
                delete newUserReactions[user.id];
            } else {
                // Switch or add
                if (previousReactionType) {
                    newReactions[previousReactionType] = Math.max(0, newReactions[previousReactionType] - 1);
                }
                newReactions[type] += 1;
                newUserReactions[user.id] = type;
            }

            return { ...c, reactions: newReactions, userReactions: newUserReactions };
        }));

        // Fire to Server Action in background
        try {
            const dbEnum = type.toUpperCase() as ReactionType;
            await toggleReaction(id, blogId, dbEnum);
            //toast.success('Reaction updated');
        } catch (error) {
            //toast.error('Failed to update reaction');
        }
    };

    const renderCommentCard = (comment: CommentType, isReply = false) => {
        const currentUserReaction = user ? comment.userReactions?.[user.id] : null;

        return (
            <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4 ml-12' : 'mt-6'}`}>
                <Avatar className={`w-10 h-10 border ${comment.isDeleted ? 'opacity-50' : ''}`}>
                    <AvatarFallback>{comment.isDeleted ? '?' : comment.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${comment.isDeleted ? 'text-muted-foreground' : ''}`}>
                            {comment.isDeleted ? 'Deleted User' : comment.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        {comment.isEdited && !comment.isDeleted && <span className="text-xs text-muted-foreground italic">(Edited)</span>}
                    </div>

                    {editingId === comment.id ? (
                        <div className="flex flex-col gap-2 mt-2">
                            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-[60px] text-sm" />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                                <Button size="sm" onClick={() => handleEditSubmit(comment.id)}>Save</Button>
                            </div>
                        </div>
                    ) : (
                        <div className={`text-sm p-3 rounded-md rounded-tl-none mt-1 ${comment.isDeleted ? 'bg-muted/30 text-muted-foreground italic' : 'bg-secondary'}`}>
                            {comment.content}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                        {!comment.isDeleted && (
                            <div className="flex items-center">
                                <Button variant="ghost" size="sm" className={`h-8 px-2 ${currentUserReaction === 'like' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} onClick={() => handleReact(comment.id, 'like')} disabled={!user}>
                                    <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${currentUserReaction === 'like' ? 'fill-current' : ''}`} />
                                    <span className="text-xs">{comment.reactions?.like || 0}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className={`h-8 px-2 ${currentUserReaction === 'heart' ? 'text-red-500' : 'text-muted-foreground'}`} onClick={() => handleReact(comment.id, 'heart')} disabled={!user}>
                                    <Heart className={`h-3.5 w-3.5 mr-1 ${currentUserReaction === 'heart' ? 'fill-current' : ''}`} />
                                    <span className="text-xs">{comment.reactions?.heart || 0}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className={`h-8 px-2 ${currentUserReaction === 'dislike' ? 'text-orange-500' : 'text-muted-foreground'}`} onClick={() => handleReact(comment.id, 'dislike')} disabled={!user}>
                                    <ThumbsDown className={`h-3.5 w-3.5 mr-1 ${currentUserReaction === 'dislike' ? 'fill-current' : ''}`} />
                                    <span className="text-xs">{comment.reactions?.dislike || 0}</span>
                                </Button>
                            </div>
                        )}

                        {!isReply && !comment.isDeleted && user && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8 px-2 text-muted-foreground"
                                onClick={() => {
                                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                    setReplyText('');
                                    setEditingId(null);
                                }}
                            >
                                <Reply className="h-3.5 w-3.5 mr-1" />
                                Reply
                            </Button>
                        )}

                        {!comment.isDeleted && user?.id === comment.authorId && (
                            <div className="flex items-center ml-auto">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => {
                                    setEditingId(comment.id);
                                    setEditText(comment.content);
                                    setReplyingTo(null);
                                }}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <ConfirmationDialog
                                    title="Delete Comment"
                                    description="Are you sure you want to delete this comment? This action cannot be undone."
                                    confirmText="Delete"
                                    destructive
                                    onConfirm={() => handleDelete(comment.id)}
                                >
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </ConfirmationDialog>
                            </div>
                        )}
                    </div>

                    {/* Reply Input Box */}
                    {replyingTo === comment.id && !isReply && (
                        <div className="mt-3 flex flex-col gap-2">
                            <Textarea
                                className="min-h-[60px] text-sm"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                <Button size="sm" onClick={() => handlePostReply(comment.id)} disabled={isSubmitting || !replyText.trim()}>
                                    Post Reply
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies?.map((r) => renderCommentCard(r, true))}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
                Discussion ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
            </h3>

            {/* Main Comment Input */}
            {user ? (
                <div className="flex gap-4 mb-8">
                    <Avatar className="w-10 h-10 border">
                        <AvatarFallback>{user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Share your thoughts on this article..."
                            value={newComment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handlePostComment} disabled={isSubmitting || !newComment.trim()}>
                                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 text-center border rounded-md bg-muted/50">
                    <h4 className="font-semibold mb-2">Join the conversation</h4>
                    <p className="text-sm text-muted-foreground mb-4">You need to be signed in to leave a comment or react.</p>
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => renderCommentCard(comment, false))}
                {comments.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        Be the first to comment!
                    </div>
                )}
            </div>
        </div>
    );
}
