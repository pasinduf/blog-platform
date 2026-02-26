'use server';

import { createSession, deleteSession, getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { passwordRegex } from '@/lib/utils';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

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
        firstName: user.firstName,
        lastName: user.lastName,
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

    await prisma.user.create({
        data: {
            email: trimmedEmail,
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
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

export async function forgotPasswordAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: 'Email is required' };
    }

    const user = await prisma.user.findUnique({
        where: { email, status: 'APPROVED' },
    });

    if (!user) {
        return { success: 'If an account with that email exists, we sent a password reset link.' };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
        data: {
            token,
            userId: user.id,
            expiresAt,
        },
    });

    const { error } = await sendPasswordResetEmail(user.email, token);

    if (error) {
        return { error: 'Failed to send reset email. Please try again later. Check server console for link if in development.' };
    }

    return { success: 'If an account with that email exists, we sent a password reset link.' };
}

export async function resetPasswordAction(prevState: any, formData: FormData) {

    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !password || !confirmPassword) {
        return { error: 'All fields are required' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    if (!passwordRegex.test(password)) {
        return { error: 'Password must be at least 8 characters long and contain at least one letter and one number' };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
        return { error: 'Invalid or expired password reset token' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.deleteMany({
            where: { userId: resetToken.userId }, // delete all tokens for this user
        }),
    ]);

    return { success: 'Password has been reset successfully. You can now log in with your new password.' };
}
