'use client';

import { useActionState, useEffect } from 'react';
import { changePasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function ChangePasswordPage() {
    const [state, formAction, isPending] = useActionState(changePasswordAction, null);
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <Card className="w-full max-w-md text-center p-6">
                    <CardTitle className="mb-4">Not Authenticated</CardTitle>
                    <CardDescription className="mb-6">You must be logged in to change your password.</CardDescription>
                    <Button asChild>
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Change Password</CardTitle>
                    <CardDescription className="text-center">
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>

                {state?.success ? (
                    <CardContent className="space-y-6 pt-4 text-center">
                        <div className="flex justify-center text-green-500 mb-4">
                            <CheckCircle2 className="h-16 w-16" />
                        </div>
                        <p className="font-medium text-lg">{state.success}</p>
                        <Button asChild className="w-full mt-4">
                            <Link href="/">Return to Dashboard</Link>
                        </Button>
                    </CardContent>
                ) : (
                    <form action={formAction}>
                        <CardContent className="space-y-4">
                            {state?.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{state.error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between mt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Updating...' : 'Update Password'}
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
