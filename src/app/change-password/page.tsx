'use client';

import { useActionState, useEffect } from 'react';
import { changePasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { passwordRegex, generateRandomPassword } from '@/lib/utils';

export default function ChangePasswordPage() {
    const [state, formAction, isPending] = useActionState(changePasswordAction, null);
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const generatePassword = () => {
        const pass = generateRandomPassword();
        setNewPassword(pass);
        setConfirmPassword(pass);
        validatePassword(pass, pass);
    };

    const validatePassword = (pass: string, confirm: string) => {
        if (!pass) {
            setPasswordError('');
            return;
        }

        if (!passwordRegex.test(pass)) {
            setPasswordError('Password must be at least 8 characters long and contain at least one letter and one number.');
            return;
        }

        if (confirm && pass !== confirm) {
            setPasswordError('Passwords do not match.');
            return;
        }

        setPasswordError('');
    };

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
                            <Link href="/">Return to Home</Link>
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
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showCurrentPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto text-xs"
                                        onClick={generatePassword}
                                    >
                                        Auto-generate
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            validatePassword(e.target.value, confirmPassword);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showNewPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Use a strong password (minimum 8 characters, including at least one letter and one number).
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            validatePassword(newPassword, e.target.value);
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showConfirmPassword ? "Hide password" : "Show password"}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {passwordError && (
                                <p className="text-sm font-medium text-destructive">
                                    {passwordError}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between mt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/profile">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isPending ||
                                    !!passwordError ||
                                    !currentPassword ||
                                    !newPassword ||
                                    !confirmPassword
                                }
                            >
                                {isPending ? 'Updating...' : 'Update Password'}
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
