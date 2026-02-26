'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Role } from '@prisma/client';

type SessionUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
};

interface AuthContextType {
    user: SessionUser | null;
    role: Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, session }: { children: ReactNode; session: SessionUser | null }) {
    return (
        <AuthContext.Provider value={{ user: session, role: session?.role || null }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
