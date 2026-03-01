'use client';

import * as React from 'react';
import { useActionState, useEffect, useState } from 'react';
import { updateSettingAction } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Calendar, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface SettingItem {
    id: string;
    name: string;
    description: string;
    value: string;
    updatedAt: Date;
    updatedUserName: string | null;
}

export function SettingsClient({ settings }: { settings: SettingItem[] }) {
    const [selectedSettingId, setSelectedSettingId] = useState<string>(settings[0]?.id || '');
    const [state, formAction, isPending] = useActionState(updateSettingAction, null);
    const [localContent, setLocalContent] = useState<string>('');

    const selectedSetting = settings.find(s => s.id === selectedSettingId);

    // Update local content when a new setting is selected to allow editing
    useEffect(() => {
        if (selectedSetting) {
            setLocalContent(selectedSetting.value);
        }
    }, [selectedSettingId, selectedSetting]);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success);
        }
    }, [state]);

    if (!settings || settings.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No system settings found in the database. Please run the seed command.</AlertDescription>
            </Alert>
        );
    }

    // const formatDate = (date: Date) => {
    //     return new Intl.DateTimeFormat('en-US', {
    //         dateStyle: 'medium',
    //         timeStyle: 'short'
    //     }).format(new Date(date));
    // };

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start w-full">
            {/* Left Nav Menu - similar to Security vs Profile form layout context */}
            <Card className="w-full md:w-[300px] shrink-0">
                <CardHeader>
                    <CardTitle className="text-xl">Settings</CardTitle>
                    <CardDescription>Select a setting to view or edit its value.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col space-y-1 p-2">
                        {settings.map((setting) => (
                            <Button
                                key={setting.id}
                                variant={selectedSettingId === setting.id ? 'default' : 'ghost'}
                                className="w-full justify-start text-left font-normal"
                                onClick={() => setSelectedSettingId(setting.id)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span className="truncate">{setting.name.replace(/_/g, ' ')}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Area */}
            {selectedSetting && (
                <Card className="flex-1 w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl tracking-tight">{selectedSetting.name.replace(/_/g, ' ')}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                            {selectedSetting.description}
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

                            <input type="hidden" name="id" value={selectedSetting.id} />

                            <div className="space-y-2">
                                <Label htmlFor="value" className="text-base font-semibold">Value</Label>
                                <Textarea
                                    id="value"
                                    name="value"
                                    value={localContent}
                                    onChange={(e) => setLocalContent(e.target.value)}
                                    placeholder="Enter the setting value here..."
                                    className="min-h-[300px] font-mono text-sm leading-relaxed p-4 bg-muted/30"
                                    required
                                />
                                {/* {selectedSetting.name !== 'AI_API_KEY' && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Available variables at execution time (appended automatically): <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{"Title: ${title}"}</code>, <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{"Content: ${content}"}</code>
                                    </p>
                                )} */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                <div className="mb-4 flex items-center text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                                    <Calendar className="mr-2 h-4 w-4 text-primary/70" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-foreground/70">Last Updated</span>
                                        <span>{formatDate(selectedSetting.updatedAt)}</span>
                                    </div>
                                </div>
                                {selectedSetting.updatedUserName && (
                                    <div className="flex items-center text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                                        <User className="mr-2 h-4 w-4 text-primary/70" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-foreground/70">Updated By</span>
                                            <span className="truncate pr-2">{selectedSetting.updatedUserName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end border-t px-6 py-2 bg-muted/10">
                            <Button
                                type="submit"
                                disabled={isPending || localContent.trim() === '' || localContent === selectedSetting.value}
                                className="min-w-[120px]"
                            >
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
        </div>
    );
}

