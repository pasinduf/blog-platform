import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';
import { prisma } from '@/lib/prisma';

export const metadata = {
    title: 'Profile Settings | BlogHub',
    description: 'Manage your personal information and biography',
};

export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            firstName: true,
            lastName: true,
            email: true,
            bioDescription: true,
            profileImage: true,
        },
    });

    if (!dbUser) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>
            <ProfileForm user={dbUser} />
        </div>
    );
}
