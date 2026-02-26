'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getUsers, approvePost, rejectPost } from '@/app/actions/admin-users';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserActionButtons } from './user-action-buttons';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: Date;
};

export default function AdminUsersPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isPending, startTransition] = useTransition();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const limit = 10;

    const fetchUsers = useCallback(async (page: number, search: string = '') => {
        startTransition(async () => {
            try {
                const data = await getUsers(page, limit, search);
                setUsers(data.users);
                setTotalPages(data.totalPages);
                setCurrentPage(page);
            } catch (error) {
                toast.error('Failed to fetch user');
            } finally {
                setIsInitialLoad(false);
            }
        });
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            router.replace('/');
            return;
        }

        fetchUsers(1, activeSearch);
    }, [user, router, fetchUsers, activeSearch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm === '' || searchTerm.trim().length >= 3) {
                if (activeSearch !== searchTerm) {
                    setActiveSearch(searchTerm);
                }
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, activeSearch]);

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage) return;
        fetchUsers(newPage, activeSearch);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setActiveSearch('');
    };

    const handleApprove = async (userId: string) => {
        await approvePost(userId);
        fetchUsers(currentPage, activeSearch);
    };

    const handleReject = async (userId: string) => {
        await rejectPost(userId);
        fetchUsers(currentPage, activeSearch);
    };

    if (isInitialLoad) {
        return (
            <div className="flex flex-col items-center justify-center p-16 w-full gap-4">
                <Spinner size="lg" />
                <span className="text-muted-foreground">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">User Management</h1>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Registered Users</CardTitle>
                            <CardDescription>Review and manage access requests for the platform.</CardDescription>
                        </div>
                        <div className="flex w-full sm:max-w-sm items-center space-x-2">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by name (min 3 chars)..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {searchTerm && (
                                <Button type="button" variant="ghost" onClick={clearSearch}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto" style={{ opacity: isPending ? 0.6 : 1 }}>
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registered On</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{u.firstName} {u.lastName}</td>
                                        <td className="p-4 align-middle">{u.email}</td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge
                                                variant={
                                                    u.status === 'APPROVED' ? 'success' :
                                                        u.status === 'REJECTED' ? 'destructive' :
                                                            'secondary'
                                                }
                                            >
                                                {u.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            {u.status === 'PENDING' && (
                                                <UserActionButtons
                                                    userId={u.id}
                                                    onApprove={handleApprove}
                                                    onReject={handleReject}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            No users registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <PaginationWrapper
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
