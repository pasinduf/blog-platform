import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminReviewClient } from './client';

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }
    const { id } = await params;

    return <AdminReviewClient blogId={id} />;
}
