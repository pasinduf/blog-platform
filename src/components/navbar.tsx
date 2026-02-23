'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, LogOut, KeyRound } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { user, role } = useAuth();
    const router = useRouter();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bold text-xl tracking-tight">
                        BlogMVP
                    </Link>
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        {user && (
                            <>
                                <Link href="/writer" className="text-muted-foreground hover:text-primary transition-colors">
                                    Writer Dashboard
                                </Link>
                                <Link href="/writer/compose" className="text-muted-foreground hover:text-primary transition-colors">
                                    Compose
                                </Link>
                            </>
                        )}
                        {role === 'ADMIN' && (
                            <>
                                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                                    Review Queue
                                </Link>
                                <Link href="/admin/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
                                    Leaderboard
                                </Link>
                                <Link href="/admin/users" className="text-muted-foreground hover:text-primary transition-colors">
                                    Users
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative size-8 rounded-full cursor-pointer">
                                    <UserCircle className="size-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/change-password" className="w-full cursor-pointer flex items-center">
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        <span>Change Password</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={async () => {
                                        await logoutAction();
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild variant="default">
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}
