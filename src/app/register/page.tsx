'use client';

import { useActionState, useEffect, useState } from 'react';
import { registerAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerAction, null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState('');

    const validateEmail = (val: string) => {
        if (!val.trim()) {
            setEmailError('Email is required.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');
    };

    const validateFirstName = (val: string) => {
        if (!val.trim()) {
            setFirstNameError('First name is required (cannot be empty)');
            return;
        }
        setFirstNameError('');
    };

    const validateLastName = (val: string) => {
        if (!val.trim()) {
            setLastNameError('Last name is required (cannot be empty)');
            return;
        }
        setLastNameError('');
    };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const mix = chars + nums + '!@#$%^&*';

        let pass = '';
        // Ensure at least one letter and one number
        pass += chars[Math.floor(Math.random() * chars.length)];
        pass += nums[Math.floor(Math.random() * nums.length)];

        for (let i = 0; i < 10; i++) {
            pass += mix[Math.floor(Math.random() * mix.length)];
        }

        // Shuffle the string
        pass = pass.split('').sort(() => 0.5 - Math.random()).join('');

        setPassword(pass);
        setConfirmPassword(pass);
        validatePassword(pass, pass);
    };

    const validatePassword = (pass: string, confirm: string) => {
        if (!pass) {
            setPasswordError('');
            return;
        }

        // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        // if (!passwordRegex.test(pass)) {
        //     setPasswordError('Password must be at least 8 characters long and contain at least one letter and one number.');
        //     return;
        // }

        if (confirm && pass !== confirm) {
            setPasswordError('Passwords do not match.');
            return;
        }

        setPasswordError('');
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register</CardTitle>
                    <CardDescription className="text-center">
                        Request access to the blog platform.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4 mb-6">
                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                        {state?.success && (
                            <Alert className="border-green-500 text-green-600">
                                <CheckCircle2 className="h-4 w-4 stroke-green-600" />
                                <AlertDescription>{state.success}</AlertDescription>
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
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    validateEmail(e.target.value);
                                }}
                            />
                            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    required
                                    value={firstName}
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        validateFirstName(e.target.value);
                                    }}
                                />
                                {firstNameError && <p className="text-xs text-destructive">{firstNameError}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    required
                                    value={lastName}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        validateLastName(e.target.value);
                                    }}
                                />
                                {lastNameError && <p className="text-xs text-destructive">{lastNameError}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
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
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        validatePassword(e.target.value, confirmPassword);
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">
                                        {showPassword ? "Hide password" : "Show password"}
                                    </span>
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Use a strong password (minimum 8 characters, including at least one letter and one number).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        validatePassword(password, e.target.value);
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
                    <CardFooter className="flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                isPending ||
                                !!passwordError ||
                                !!emailError ||
                                !!firstNameError ||
                                !!lastNameError ||
                                !email.trim() ||
                                !firstName.trim() ||
                                !lastName.trim() ||
                                !password ||
                                !!state?.success
                            }
                        >
                            {isPending ? 'Submitting...' : 'Register'}
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="underline hover:text-primary">
                                Login here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
