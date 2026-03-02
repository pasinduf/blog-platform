import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request: Request): Promise<NextResponse> {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json(
            { error: 'Filename is required' },
            { status: 400 }
        );
    }

    if (!request.body) {
        return NextResponse.json(
            { error: 'Request body is required' },
            { status: 400 }
        );
    }

    try {
        const blob = await put(filename, request.body, {
            access: 'public',
            addRandomSuffix: true,
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        return NextResponse.json(
            { error: 'Error uploading file' },
            { status: 500 }
        );
    }
}
