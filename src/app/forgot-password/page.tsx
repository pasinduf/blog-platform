'use client';

import { useActionState } from 'react';
import { forgotPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we will send you a link to reset your password.
                    </CardDescription>
                </CardHeader>

                {state?.success ? (
                    <CardContent className="space-y-6 pt-4 text-center">
                        <div className="flex justify-center text-green-500 mb-4">
                            <CheckCircle2 className="h-16 w-16" />
                        </div>
                        <p className="font-medium text-lg">{state.success}</p>
                        <Button asChild className="w-full mt-4">
                            <Link href="/login">Return to Login</Link>
                        </Button>
                    </CardContent>
                ) : (
                    <form action={formAction}>
                        <CardContent className="space-y-4 mb-6">
                            {state?.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{state.error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                            <div className="text-center text-sm">
                                Remembered your password?{' '}
                                <Link href="/login" className="underline hover:text-primary">
                                    Sign In here
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
