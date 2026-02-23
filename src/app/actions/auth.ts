'use server';

import { createSession, deleteSession, getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { passwordRegex } from '@/lib/utils';

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { error: 'Invalid email or password' };
    }

    if (user.status !== 'APPROVED') {
        return { error: 'Account pending approval' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        return { error: 'Invalid email or password' };
    }

    await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });

    redirect('/');
}

export async function logoutAction() {
    await deleteSession();
    redirect('/login');
}

export async function registerAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const password = formData.get('password') as string;

    if (!email || !firstName || !lastName || !password) {
        return { error: 'All fields are required' };
    }

    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedEmail || !trimmedFirstName || !trimmedLastName) {
        return { error: 'Fields cannot be empty or just spaces' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { error: 'Please enter a valid email address format' };
    }

    // Password validation: minimum 8 characters, at least one letter and one number
    if (!passwordRegex.test(password)) {
        return { error: 'Password must be at least 8 characters long and contain at least one letter and one number' };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
    });

    if (existingUser) {
        return { error: 'User with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${trimmedFirstName} ${trimmedLastName}`;

    await prisma.user.create({
        data: {
            email: trimmedEmail,
            name: fullName,
            password: hashedPassword,
            role: 'USER',
            status: 'PENDING',
        },
    });

    return { success: 'Registration successful. Account pending admin approval.' };
}

export async function changePasswordAction(prevState: any, formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match' };
    }

    if (!passwordRegex.test(newPassword)) {
        return { error: 'New password must be at least 8 characters long and contain at least one letter and one number' };
    }

    const payload = await getSession();

    if (!payload) {
        return { error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.id },
    });

    if (!user) {
        return { error: 'User not found' };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordsMatch) {
        return { error: 'Incorrect current password' };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: newPasswordHash },
    });

    return { success: 'Password changed successfully' };
}
