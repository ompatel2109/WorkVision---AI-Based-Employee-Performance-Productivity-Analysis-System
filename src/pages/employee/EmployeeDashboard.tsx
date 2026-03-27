import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis
} from "recharts";
import {
    Activity,
    Clock,
    CheckCircle,
    TrendingUp,
    Zap,
    Calendar,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
    current_score: number;
    performance_category: string;
    trend: { labels: string[]; data: number[] };
    score_breakdown?: {
        work_score: number;
        feedback_score: number;
        feedback_count: number;
    };
    summary: {
        tasks_completed: number;
        hours_worked: number;
        efficiency: number;
        avg_feedback_score: number | null;
        deadline_adherence: number;
    };
}

export default function EmployeeDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/employee/dashboard");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();

        // Auto-refresh: poll every 60s + refresh on tab focus
        const interval = setInterval(fetchDashboard, 60000);
        const handleVisibility = () => { if (document.visibilityState === 'visible') fetchDashboard(); };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    const score = stats?.current_score || 0;
    const radialData = [{ name: 'Score', value: score, fill: score >= 85 ? '#10b981' : score >= 70 ? '#22c55e' : score >= 55 ? '#3b82f6' : score >= 40 ? '#eab308' : '#ef4444' }];

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gradient-blue">
                        Welcome Back!
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Here’s your performance summary for today.
                    </p>
                </div>
                <Button onClick={() => navigate("/employee/work-log")} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-xl h-9 px-4 text-sm">
                    <Zap className="mr-2 h-4 w-4" /> Log Work
                </Button>
            </div>


            {/* ── Performance Status Banner ─────────────────────────── */}
            {(() => {
                const cat = stats?.performance_category || "Needs Improvement";
                const score = stats?.current_score || 0;

                const config: Record<string, { emoji: string; color: string; ring: string; bar: string; bg: string; tip: string }> = {
                    "Exceptional": { emoji: "🏆", color: "text-emerald-400", ring: "ring-emerald-500/40", bar: "bg-emerald-500", bg: "bg-emerald-500/10", tip: "You are in the top tier! Outstanding work." },
                    "High Performer": { emoji: "⚡", color: "text-green-400", ring: "ring-green-500/40", bar: "bg-green-500", bg: "bg-green-500/10", tip: "Great performance — keep pushing higher!" },
                    "Average": { emoji: "📈", color: "text-blue-400", ring: "ring-blue-500/40", bar: "bg-blue-500", bg: "bg-blue-500/10", tip: "Solid work. Focus on deadlines to level up." },
                    "Developing": { emoji: "🔨", color: "text-yellow-400", ring: "ring-yellow-500/40", bar: "bg-yellow-500", bg: "bg-yellow-500/10", tip: "You're growing. More consistent delivery helps." },
                    "Needs Improvement": { emoji: "🚨", color: "text-red-400", ring: "ring-red-500/40", bar: "bg-red-500", bg: "bg-red-500/10", tip: "Focus on completing & submitting tasks on time." },
                };
                const c = config[cat] || config["Needs Improvement"];

                return (
                    <div className={`w-full rounded-xl border p-6 shadow-sm ${c.bg} ring-2 ${c.ring} transition-all duration-500`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            {/* Left: Status */}
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Current Performance Status</p>
                                <div className="flex items-center gap-3">
                                    {/* Animated pulse indicator */}
                                    <span className="relative flex h-3 w-3">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.bar}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${c.bar}`}></span>
                                    </span>
                                    <h1 className={`text-3xl font-extrabold tracking-tight ${c.color}`}>
                                        {c.emoji} {cat}
                                    </h1>
                                </div>
                                <p className="text-sm text-muted-foreground">{c.tip}</p>
                            </div>
                            {/* Right: Score */}
                            <div className="text-right shrink-0">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Score</p>
                                <p className={`text-5xl font-black ${c.color}`}>{score}</p>
                                <p className="text-xs text-muted-foreground">/ 100</p>
                            </div>
                        </div>
                        {/* Score Progress Bar */}
                        <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-background/40 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>Needs Improvement</span>
                                <span>Developing</span>
                                <span>Average</span>
                                <span>High Performer</span>
                                <span>Exceptional</span>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Quick Stats mini-cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Productivity Gauge Card */}
                <Card className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-blue-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overall Productivity</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-end gap-1">
                                <span className="text-5xl font-black tracking-tighter text-primary">{score}</span>
                                <span className="text-lg text-muted-foreground pb-1">/100</span>
                            </div>
                            {stats?.score_breakdown && (
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-muted-foreground">Work Metrics (80%)</span>
                                        <span className="font-mono font-semibold ml-auto">{stats.score_breakdown.work_score}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                                        <span className="text-muted-foreground">Feedback Sentiment (20%)</span>
                                        <span className="font-mono font-semibold ml-auto">{stats.score_breakdown.feedback_score}</span>
                                    </div>
                                    {stats.score_breakdown.feedback_count > 0 && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Based on {stats.score_breakdown.feedback_count} feedback(s)
                                        </p>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-emerald-500 font-medium flex items-center mt-2">
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                +5% from last week
                            </p>
                        </div>
                        <div className="h-[120px] w-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={radialData} startAngle={90} endAngle={-270}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background dataKey="value" cornerRadius={30} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <StatCard title="Tasks Completed" value={stats?.summary.tasks_completed} icon={CheckCircle} color="text-blue-500" bg="bg-blue-500/15" />
                <StatCard title="Hours Worked" value={stats?.summary.hours_worked} icon={Clock} color="text-orange-500" bg="bg-orange-500/15" />
            </div>

            {/* Charts & Details Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2 rounded-2xl border border-border/60 shadow-sm">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="text-base font-semibold">Performance Trend</CardTitle>
                        <CardDescription className="text-xs">Your efficiency over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.trend.labels.map((l, i) => ({ date: l, score: stats.trend.data[i] }))}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#f3f4f6', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#60a5fa' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Efficiency Card */}
                <Card className="col-span-1 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground relative overflow-hidden shadow-lg shadow-primary/20">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Activity className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-primary-foreground text-base">Efficiency Rate</CardTitle>
                        <CardDescription className="text-primary-foreground/70 text-xs">Tasks per hour</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-5xl font-black">{stats?.summary.efficiency}</div>
                        <Progress value={(stats?.summary.efficiency || 0) * 20} className="h-2 bg-primary-foreground/20 [&>div]:bg-white" />
                        <p className="text-sm text-primary-foreground/80">
                            You are in the top 10% of your team this week! Keep it up.
                        </p>
                        <Button variant="secondary" className="w-full mt-4" size="sm" onClick={() => navigate("/employee/history")}>
                            View History <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-card to-muted/40 border-border/60`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <p className={`text-3xl font-black mt-2 ${color}`}>{value ?? 0}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid gap-6 md:grid-cols-4">
                <Skeleton className="h-32 col-span-2" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
    );
}
