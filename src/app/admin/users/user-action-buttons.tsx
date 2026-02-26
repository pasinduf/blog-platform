'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';

interface UserActionButtonsProps {
    userId: string;
    onApprove: (userId: string) => Promise<void>;
    onReject: (userId: string) => Promise<void>;
}

export function UserActionButtons({ userId, onApprove, onReject }: UserActionButtonsProps) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            try {
                await onApprove(userId);
                toast.success('User approved successfully');
            } catch (error) {
                toast.error('Failed to approve user');
            }
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            try {
                await onReject(userId);
                toast.success('User registration declined');
            } catch (error) {
                toast.error('Failed to decline user');
            }
        });
    };

    return (
        <div className="flex justify-end gap-2">
            <ConfirmationDialog
                title="Approve User"
                description="Are you sure you want to approve this user? They will gain access to the platform."
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
        </div>
    );
}
