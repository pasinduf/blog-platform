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
import { LogOut, KeyRound, PenSquare, Bookmark, Menu } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserCircle } from 'lucide-react';

export function Navbar() {
    const { user, role } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold">B</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">BlogHub</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        {user && (
                            <Link
                                href="/writer" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                                Dashboard
                            </Link>
                        )}
                        {role === 'ADMIN' && (
                            <>
                                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                                    Review Queue
                                </Link>
                                <Link href="/admin/leaderboard" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                                    Leaderboard
                                </Link>
                                <Link href="/admin/users" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                                    Users
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {user &&
                        <Link
                            href="/writer/compose"
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                        >
                            <PenSquare className="w-4 h-4" />
                            Write Article
                        </Link>
                    }
                    {/* <ThemeToggle /> */}

                    {/* Mobile Navigation Dropdown */}
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="md:hidden relative size-8 rounded-full cursor-pointer">
                                    <Menu className="size-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuItem asChild>
                                    <Link href="/writer" className="w-full cursor-pointer">
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/writer/compose" className="w-full cursor-pointer">
                                        Write Article
                                    </Link>
                                </DropdownMenuItem>
                                {role === 'ADMIN' && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="w-full cursor-pointer">
                                                Review Queue
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/leaderboard" className="w-full cursor-pointer">
                                                Leaderboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/users" className="w-full cursor-pointer">
                                                Users
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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
                                        <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href="/bookmarks" className="w-full cursor-pointer flex items-center">
                                        <Bookmark className="mr-2 h-4 w-4" />
                                        <span>My Bookmarks</span>
                                    </Link>
                                </DropdownMenuItem>
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
            </div >
        </nav >
    );
}
