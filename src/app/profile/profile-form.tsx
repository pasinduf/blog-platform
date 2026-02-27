'use client';

import * as React from 'react';
import { useActionState, useEffect, useState } from 'react';
import { updateProfileAction } from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, UserCircle, KeyRound, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { toast } from 'sonner';

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    bioDescription: string | null;
    profileImage: string | null;
}

export function ProfileForm({ user }: { user: UserProfile }) {
    const [state, formAction, isPending] = useActionState(updateProfileAction, null);
    const [imagePreview, setImagePreview] = useState<string | null>(user.profileImage);
    const [previewError, setPreviewError] = useState('');

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success);
        }
    }, [state]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setPreviewError('Please upload a valid image file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setPreviewError('Image size must be less than 2MB.');
            return;
        }

        setPreviewError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start w-full">
            <Card className="flex-1 w-full order-2 md:order-1">
                <CardHeader>
                    <CardTitle className="text-2xl">Profile Settings</CardTitle>
                    <CardDescription>
                        Update your personal information and biography.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-6">
                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                        {previewError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{previewError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-4 bg-muted/30 rounded-lg border">
                            <div className="flex flex-col items-center gap-3">
                                <Avatar className="h-24 w-24">
                                    {imagePreview ? (
                                        <AvatarImage src={imagePreview} alt="Profile preview" className="object-cover" />
                                    ) : (
                                        <AvatarFallback className="bg-primary/10">
                                            <UserCircle className="h-12 w-12 text-muted-foreground" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="relative">
                                    <Input
                                        id="picture"
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                    />
                                    <Label
                                        htmlFor="picture"
                                        className="flex items-center gap-2 px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs font-medium cursor-pointer transition-colors"
                                    >
                                        <UploadCloud className="w-3 h-3" />
                                        Upload Image
                                    </Label>
                                </div>
                                <input type="hidden" name="profileImage" value={imagePreview || ''} />
                            </div>
                            <div className="flex-1 space-y-1 text-center md:text-left">
                                <h3 className="font-medium text-lg leading-none">Profile Picture</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upload a new profile picture. Max size 2MB. Recommended 256x256px.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Jane"
                                    defaultValue={user.firstName}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    defaultValue={user.lastName}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="bg-muted/50"
                            />
                            <p className="text-[10px] text-muted-foreground">Email addresses cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bioDescription">Bio Description</Label>
                            <Textarea
                                id="bioDescription"
                                name="bioDescription"
                                placeholder="Tell us a little bit about yourself (optional)"
                                defaultValue={user.bioDescription || ''}
                                className="min-h-[120px] resize-y"
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6">
                        <Button
                            type="submit"
                            disabled={isPending || !!previewError}
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="w-full md:w-[300px] order-1 md:order-2 shrink-0">
                <CardHeader>
                    <CardTitle className="text-xl">Security</CardTitle>
                    <CardDescription>Manage your account security.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline" className="w-full flex items-center gap-2 justify-start">
                        <Link href="/change-password">
                            <KeyRound className="h-4 w-4" />
                            Change Password
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
