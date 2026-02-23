import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function LeaderboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }
    // MOCK DATA for MVP
    // In a real app we'd aggregate avg clarity scores from PostgreSQL.
    const leaderboard = [
        { rank: 1, authorId: 'user-3', authorName: 'Alice Writer', avgScore: 92, postsPublished: 4 },
        { rank: 2, authorId: 'user-7', authorName: 'Carlos Content', avgScore: 88, postsPublished: 2 },
        { rank: 3, authorId: 'user-2', authorName: 'Eve Writer', avgScore: 85, postsPublished: 5 },
    ];

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-500 h-8 w-8" />
                        Writer Leaderboard
                    </h1>
                </div>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Top Writers by Clarity Score</CardTitle>
                    <CardDescription>
                        Aggregated average clarity score across all published articles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {leaderboard.map((writer) => (
                            <div
                                key={writer.authorId}
                                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${writer.rank === 1 ? 'bg-yellow-500/20 text-yellow-600' :
                                            writer.rank === 2 ? 'bg-slate-300/30 text-slate-500' :
                                                writer.rank === 3 ? 'bg-amber-600/20 text-amber-700' : 'bg-muted'}
                  `}>
                                        #{writer.rank}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{writer.authorName}</h3>
                                        <div className="text-sm text-muted-foreground">{writer.postsPublished} published posts</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">{writer.avgScore} <span className="text-sm text-muted-foreground">/ 100</span></div>
                                    <div className="text-xs font-medium uppercase text-muted-foreground tracking-wider mt-1">Avg Clarity</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
