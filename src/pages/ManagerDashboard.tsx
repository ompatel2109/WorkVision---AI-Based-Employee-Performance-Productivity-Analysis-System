import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ManagerStats {
    avg_score: number;
    total_employees: number;
    high_performers: number;
    medium_performers: number;
    low_performers: number;
    risk_count: number;
    department: string;
    productivity_trend: {
        labels: string[];
        data: number[];
    };
}

interface LeaderEntry {
  id: string; name: string; email: string;
  score: number; category: string; department: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

const categoryStyle = (cat: string) => {
  const m: Record<string, string> = {
    'Exceptional': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'High Performer': 'bg-green-500/15 text-green-400 border-green-500/30',
    'Average': 'bg-blue-500/15 text-blue-400 border-blue-400/30',
    'Developing': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    'Needs Improvement': 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return m[cat] ?? 'bg-muted text-muted-foreground';
};

export default function ManagerDashboard() {
    const [stats, setStats] = useState<ManagerStats | null>(null);
    const [topEmployees, setTopEmployees] = useState<LeaderEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, leaderRes] = await Promise.all([
                    api.get("/manager/dashboard"),
                    api.get("/manager/leaderboard")
                ]);
                setStats(statsRes.data);
                // Get strictly the top 3 from the leaderboard list
                setTopEmployees((leaderRes.data.leaderboard || []).slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        // Auto-refresh: poll every 60s and also refresh on tab focus
        const interval = setInterval(fetchDashboardData, 60000);
        const handleVisibility = () => { if (document.visibilityState === 'visible') fetchDashboardData(); };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
                <p>Failed to load dashboard data.</p>
                <p className="text-sm">Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{stats?.department} Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">Overview of your department's performance and tasks.</p>
                </div>
            </div>

            {/* Modern Gradient KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Total Employees', value: stats?.total_employees, sub: `In ${stats?.department}`, icon: Users, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30', iconColor: 'text-blue-500 bg-blue-500/15', textColor: 'text-blue-600 dark:text-blue-400' },
                    { title: 'Avg Performance', value: stats?.avg_score.toFixed(1), sub: 'Team average', icon: Award, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30', iconColor: 'text-emerald-500 bg-emerald-500/15', textColor: 'text-emerald-600 dark:text-emerald-400' },
                    { title: 'High Performers', value: stats?.high_performers, sub: 'Score ≥ 70', icon: TrendingUp, color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30', iconColor: 'text-violet-500 bg-violet-500/15', textColor: 'text-violet-600 dark:text-violet-400' },
                    { title: 'At-Risk', value: stats?.risk_count, sub: 'Needs attention', icon: AlertTriangle, color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30', iconColor: 'text-rose-500 bg-rose-500/15', textColor: 'text-rose-600 dark:text-rose-400' },
                ].map((kpi) => (
                    <div key={kpi.title} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${kpi.color} p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                                <p className={`text-3xl font-black mt-2 ${kpi.textColor}`}>{kpi.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                            </div>
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconColor}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 rounded-2xl border border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="text-base font-semibold">Productivity Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 px-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={stats?.productivity_trend.labels.map((label, index) => ({
                                    name: label,
                                    Productivity: stats.productivity_trend.data[index],
                                }))}
                            >
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="Productivity" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3 rounded-2xl border border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="text-base font-semibold">Performance Distribution</CardTitle>
                        <CardDescription className="text-xs">Breakdown of employee performance levels.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    { name: "High", value: stats?.high_performers },
                                    { name: "Medium", value: stats?.medium_performers },
                                    { name: "Low", value: stats?.low_performers },
                                ]}
                            >
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <RechartsTooltip />
                                <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="rounded-2xl border border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <div className="h-8 w-8 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                                <Award className="h-4 w-4 text-yellow-500" />
                            </div>
                            Top 3 Performers
                        </CardTitle>
                        <CardDescription className="text-xs">The highest scoring employees in your department right now.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {topEmployees.length === 0 ? (
                            <p className="text-muted-foreground py-4 text-center text-sm">No employee scores available yet.</p>
                        ) : (
                            <div className={`grid gap-4 ${topEmployees.length === 1 ? 'grid-cols-1 max-w-sm' : topEmployees.length === 2 ? 'grid-cols-2 max-w-2xl' : 'grid-cols-1 md:grid-cols-3'}`}>
                                {topEmployees.map((entry, idx) => {
                                    const gradients = [
                                        'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-400/40 shadow-yellow-500/10',
                                        'bg-gradient-to-br from-slate-400/20 to-slate-300/10 border-slate-400/40',
                                        'bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-500/40',
                                    ];
                                    const numColors = ['text-yellow-400', 'text-slate-400', 'text-orange-500'];
                                    const avatarStyle = [
                                        'bg-yellow-500/20 text-yellow-400 border-yellow-400/40',
                                        'bg-slate-400/20 text-slate-300 border-slate-400/40',
                                        'bg-orange-500/20 text-orange-400 border-orange-500/40',
                                    ];
                                    return (
                                        <div key={entry.id} className={`flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all hover:scale-[1.02] duration-200 shadow-lg ${gradients[idx]}`}>
                                            <span className="text-4xl">{MEDALS[idx] || '🏅'}</span>
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 ${avatarStyle[idx]}`}>
                                                {entry.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{entry.name}</p>
                                                <p className={`text-3xl font-black mt-2 ${numColors[idx]}`}>{entry.score.toFixed(1)}</p>
                                                <p className="text-xs text-muted-foreground">/100</p>
                                            </div>
                                            <Badge variant="outline" className={`text-xs ${categoryStyle(entry.category)}`}>{entry.category}</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
