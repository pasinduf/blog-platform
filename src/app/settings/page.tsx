import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { getSettings } from '@/app/actions/settings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function AdminSettingsPage() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const result = await getSettings();

    if (result.error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-3xl font-bold mb-8 tracking-tight">System Settings</h1>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{result.error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 tracking-tight">System Settings</h1>
            <SettingsClient settings={result.settings || []} />
        </div>
    );
}
