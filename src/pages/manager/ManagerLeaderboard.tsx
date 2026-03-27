import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderEntry {
    id: string; name: string; email: string;
    score: number; category: string; rank: number; department: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const categoryStyle = (cat: string) => {
    const m: Record<string, string> = {
        "Exceptional": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        "High Performer": "bg-green-500/15 text-green-400 border-green-500/30",
        "Average": "bg-blue-500/15 text-blue-400 border-blue-500/30",
        "Developing": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        "Needs Improvement": "bg-red-500/15 text-red-400 border-red-500/30",
    };
    return m[cat] ?? "bg-muted text-muted-foreground";
};

const scoreBarColor = (s: number) =>
    s >= 85 ? "bg-emerald-500" : s >= 70 ? "bg-green-500" : s >= 55 ? "bg-blue-500" : s >= 40 ? "bg-yellow-500" : "bg-red-500";

function MedalCard({ entry }: { entry: LeaderEntry }) {
    const isGold = entry.rank === 1;
    return (
        <div className={`flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-all
            ${isGold ? "border-yellow-400/40 bg-yellow-500/10 shadow-lg shadow-yellow-500/10" : "bg-card border-border"}`}>
            <span className="text-4xl">{MEDALS[entry.rank - 1]}</span>
            <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold
                ${isGold ? "bg-yellow-500/20 text-yellow-400" : "bg-primary/10 text-primary"}`}>
                {entry.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="font-semibold">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.email}</p>
                <p className={`text-3xl font-black mt-2 ${isGold ? "text-yellow-400" : "text-foreground"}`}>{entry.score}</p>
                <p className="text-xs text-muted-foreground">/100</p>
            </div>
            <Badge variant="outline" className={`text-xs ${categoryStyle(entry.category)}`}>{entry.category}</Badge>
        </div>
    );
}

function RankRow({ entry }: { entry: LeaderEntry }) {
    return (
        <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
            <span className="w-7 text-center text-sm font-bold text-muted-foreground">#{entry.rank}</span>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {entry.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.email}</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-28 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBarColor(entry.score)}`} style={{ width: `${entry.score}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.score}/100</span>
                </div>
            </div>
            <Badge variant="outline" className={`text-xs shrink-0 ${categoryStyle(entry.category)}`}>{entry.category}</Badge>
        </div>
    );
}

export default function ManagerLeaderboard() {
    const [department, setDepartment] = useState("");
    const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get("/manager/leaderboard")
            .then(res => {
                setDepartment(res.data.department || "");
                setLeaderboard(res.data.leaderboard || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-3 gap-4"><Skeleton className="h-52" /><Skeleton className="h-52" /><Skeleton className="h-52" /></div>
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                    Performance Leaderboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Department: <span className="font-semibold text-foreground">{department}</span> · {leaderboard.length} member{leaderboard.length !== 1 ? "s" : ""} ranked by AI performance score
                </p>
            </div>

            {leaderboard.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No performance data yet</p>
                        <p className="text-sm mt-1">Scores appear once team members submit and complete tasks.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Top 3 Medal Podium */}
                    {top3.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">🏅 Top Performers</CardTitle>
                                <CardDescription>The highest scoring members in your department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className={`grid gap-4 ${top3.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : top3.length === 2 ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-3"}`}>
                                    {top3.map(e => <MedalCard key={e.id} entry={e} />)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Full Ranking List */}
                    {rest.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">📋 Full Rankings</CardTitle>
                                <CardDescription>All other team members ranked by score</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {rest.map(e => <RankRow key={e.id} entry={e} />)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
