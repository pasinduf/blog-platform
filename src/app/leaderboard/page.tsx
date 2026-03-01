import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function LeaderboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    // Fetch users who have at least one PUBLISHED blog
    const users = await prisma.user.findMany({
        where: {
            blogs: {
                some: { status: 'PUBLISHED' }
            }
        },
        include: {
            blogs: {
                where: { status: 'PUBLISHED' },
                select: { clarityScore: true }
            }
        }
    });

    // Calculate scores and sort them directly
    const leaderboard = users
        .map(user => {
            const scoredBlogs = user.blogs.filter(b => b.clarityScore !== null);
            const totalArticles = user.blogs.length;
            const totalScore = scoredBlogs.reduce((sum, blog) => sum + (blog.clarityScore || 0), 0);
            const averageScore = scoredBlogs.length > 0
                ? Math.round(totalScore / scoredBlogs.length)
                : 0;

            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage,
                totalArticles,
                averageScore,
                totalScore
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore) // rank based on totalScore
        .slice(0, 10); // Keep top 10

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/reviews">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-500 h-8 w-8" />
                        Writers Leaderboard
                    </h1>
                </div>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Top Writers by Clarity Score</CardTitle>
                    <CardDescription>
                        Aggregated total clarity score across all published articles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaderboard.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground border rounded-lg">
                                No published articles with clarity scores found yet.
                            </div>
                        ) : (
                            leaderboard.map((writer, index) => {
                                const rank = index + 1;
                                return (
                                    <div
                                        key={writer.id}
                                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                                ${rank === 1 ? 'bg-yellow-500/20 text-yellow-600' :
                                                    rank === 2 ? 'bg-slate-300/30 text-slate-500' :
                                                        rank === 3 ? 'bg-amber-600/20 text-amber-700' : 'bg-muted'}
                                            `}>
                                                #{rank}
                                            </div>

                                            {writer.profileImage ? (
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border hidden sm:block">
                                                    <Image src={writer.profileImage} alt={writer.firstName} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 shrink-0 hidden sm:flex bg-gradient-to-br from-blue-500 to-purple-500 rounded-full items-center justify-center text-white font-bold text-sm">
                                                    {writer.firstName.charAt(0).toUpperCase()}{writer.lastName.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="font-semibold text-lg">{writer.firstName} {writer.lastName}</h3>
                                                <div className="text-sm text-muted-foreground">{writer.totalArticles} published articles</div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">{writer.totalScore} <span className="text-sm text-muted-foreground"></span></div>
                                            <div className="text-xs font-medium uppercase text-muted-foreground tracking-wider mt-1">Total</div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
