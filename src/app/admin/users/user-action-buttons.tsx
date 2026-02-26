'use client';

import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface UserActionButtonsProps {
    userId: string;
    onApprove?: (userId: string, assignAdmin: boolean) => Promise<void>;
    onReject?: (userId: string) => Promise<void>;
    onPromote?: (userId: string) => Promise<void>;
    onDemote?: (userId: string) => Promise<void>;
    role?: string;
}

export function UserActionButtons({ userId, onApprove, onReject, onPromote, onDemote, role }: UserActionButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [assignAdmin, setAssignAdmin] = useState(false);

    const handleApprove = () => {
        if (!onApprove) return;
        startTransition(async () => {
            try {
                await onApprove(userId, assignAdmin);
                toast.success('User approved successfully');
            } catch (error) {
                toast.error('Failed to approve user');
            }
        });
    };

    const handleReject = () => {
        if (!onReject) return;
        startTransition(async () => {
            try {
                await onReject(userId);
                toast.success('User registration declined');
            } catch (error) {
                toast.error('Failed to decline user');
            }
        });
    };

    const handlePromote = () => {
        if (!onPromote) return;
        startTransition(async () => {
            try {
                await onPromote(userId);
                toast.success('User promoted to ADMIN');
            } catch (error) {
                toast.error('Failed to promote user');
            }
        });
    };

    const handleDemote = () => {
        if (!onDemote) return;
        startTransition(async () => {
            try {
                await onDemote(userId);
                toast.success('User demoted to USER');
            } catch (error: any) {
                toast.error(error.message || 'Failed to demote user');
            }
        });
    };

    return (
        <div className="flex justify-end gap-2">
            {onApprove && onReject && (
                <>
                    <ConfirmationDialog
                        title="Approve User"
                        description={
                            <div className="flex flex-col gap-4">
                                <p>Are you sure you want to approve this user? They will gain access to the platform.</p>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`assign-admin-${userId}`}
                                        checked={assignAdmin}
                                        onCheckedChange={(checked) => setAssignAdmin(checked as boolean)}
                                    />
                                    <label
                                        htmlFor={`assign-admin-${userId}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Assign as ADMIN
                                    </label>
                                </div>
                            </div>
                        }
                        confirmText="Approve"
                        onConfirm={handleApprove}
                    >
                        <Button type="button" size="sm" disabled={isPending}>
                            Approve
                        </Button>
                    </ConfirmationDialog>

                    <ConfirmationDialog
                        title="Decline User"
                        description="Are you sure you want to decline this registration? This action cannot be undone."
                        confirmText="Decline"
                        destructive
                        onConfirm={handleReject}
                    >
                        <Button type="button" size="sm" variant="secondary" disabled={isPending}>
                            Decline
                        </Button>
                    </ConfirmationDialog>
                </>
            )}

            {role === 'USER' && onPromote && (
                <ConfirmationDialog
                    title="Promote to ADMIN"
                    description="Are you sure you want to promote this user to ADMIN? They will have full access to review queues and user management."
                    confirmText="Promote"
                    onConfirm={handlePromote}
                >
                    <Button type="button" size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive" disabled={isPending}>
                        Promote to Admin
                    </Button>
                </ConfirmationDialog>
            )}

            {role === 'ADMIN' && onDemote && (
                <ConfirmationDialog
                    title="Demote to USER"
                    description="Are you sure you want to demote this ADMIN? They will lose access to administrative functions."
                    confirmText="Demote"
                    destructive
                    onConfirm={handleDemote}
                >
                    <Button type="button" size="sm" variant="outline" disabled={isPending}>
                        Demote to User
                    </Button>
                </ConfirmationDialog>
            )}
        </div>
    );
}
