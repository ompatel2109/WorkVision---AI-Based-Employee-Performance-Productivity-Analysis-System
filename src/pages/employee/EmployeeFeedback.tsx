import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Minus,
    Brain,
    TrendingUp,
    User as UserIcon
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
} from "recharts";
import api from "@/lib/api";

interface FeedbackItem {
    _id: string;
    message: string;
    type: "positive" | "negative" | "improvement";
    sentiment: "Positive" | "Neutral" | "Negative" | null;
    sentiment_score: number | null;
    manager_name: string;
    date: string;
}

interface SentimentTrend {
    distribution: {
        positive: number;
        neutral: number;
        negative: number;
        unknown: number;
    };
    total: number;
    timeline: { date: string; score: number; sentiment: string }[];
}

const SENTIMENT_COLORS = {
    Positive: "#10b981",
    Neutral: "#f59e0b",
    Negative: "#ef4444",
    Unknown: "#6b7280",
};

export default function EmployeeFeedback() {
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [sentimentTrend, setSentimentTrend] = useState<SentimentTrend | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fbRes, trendRes] = await Promise.all([
                    api.get("/employee/feedback"),
                    api.get("/employee/feedback/sentiment-trend"),
                ]);
                setFeedback(fbRes.data);
                setSentimentTrend(trendRes.data);
            } catch (error) {
                console.error("Failed to fetch feedback", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getSentimentConfig = (sentiment: string | null) => {
        switch (sentiment) {
            case "Positive":
                return { icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10", badge: "bg-emerald-500 hover:bg-emerald-600", emoji: "🟢", label: "Positive" };
            case "Negative":
                return { icon: ThumbsDown, color: "text-red-500", bg: "bg-red-500/10", badge: "bg-red-500 hover:bg-red-600", emoji: "🔴", label: "Negative" };
            case "Neutral":
                return { icon: Minus, color: "text-amber-500", bg: "bg-amber-500/10", badge: "bg-amber-500 hover:bg-amber-600", emoji: "🟡", label: "Neutral" };
            default:
                return { icon: MessageSquare, color: "text-gray-500", bg: "bg-gray-500/10", badge: "bg-gray-500 hover:bg-gray-600", emoji: "⚪", label: "Unanalyzed" };
        }
    };

    const pieData = sentimentTrend ? [
        { name: "Positive", value: sentimentTrend.distribution.positive, fill: SENTIMENT_COLORS.Positive },
        { name: "Neutral", value: sentimentTrend.distribution.neutral, fill: SENTIMENT_COLORS.Neutral },
        { name: "Negative", value: sentimentTrend.distribution.negative, fill: SENTIMENT_COLORS.Negative },
    ].filter(d => d.value > 0) : [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[300px]" />
                </div>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Brain className="h-8 w-8 text-primary" />
                    Feedback & AI Insights
                </h1>
                <p className="text-muted-foreground mt-1">
                    View manager feedback with AI-powered sentiment analysis.
                </p>
            </div>

            {/* Sentiment Overview Cards */}
            {sentimentTrend && sentimentTrend.total > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-500/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Positive</p>
                                    <p className="text-3xl font-bold text-emerald-500">{sentimentTrend.distribution.positive}</p>
                                </div>
                                <ThumbsUp className="h-8 w-8 text-emerald-500/40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-500/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Neutral</p>
                                    <p className="text-3xl font-bold text-amber-500">{sentimentTrend.distribution.neutral}</p>
                                </div>
                                <Minus className="h-8 w-8 text-amber-500/40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-800 bg-red-500/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Negative</p>
                                    <p className="text-3xl font-bold text-red-500">{sentimentTrend.distribution.negative}</p>
                                </div>
                                <ThumbsDown className="h-8 w-8 text-red-500/40" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-3xl font-bold text-primary">{sentimentTrend.total}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-primary/40" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts Row */}
            {sentimentTrend && sentimentTrend.timeline.length > 0 && (
                <div className="grid gap-6 md:grid-cols-5">
                    {/* Sentiment Timeline */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Sentiment Timeline
                            </CardTitle>
                            <CardDescription>AI-detected sentiment score over recent feedback (-1 to +1)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sentimentTrend.timeline}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis domain={[-1, 1]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', color: '#f3f4f6', border: 'none', borderRadius: '8px' }}
                                            formatter={(value: number) => [value.toFixed(3), "Score"]}
                                        />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                            {sentimentTrend.timeline.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={SENTIMENT_COLORS[entry.sentiment as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.Unknown}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribution Pie */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                Sentiment Distribution
                            </CardTitle>
                            <CardDescription>Breakdown of all feedback sentiments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={index} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', color: '#f3f4f6', border: 'none', borderRadius: '8px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                {pieData.map((d) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                                        <span className="text-muted-foreground">{d.name} ({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Feedback List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">All Feedback</h2>
                <div className="grid gap-4">
                    {feedback.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No feedback received yet. Your manager will send feedback here.
                            </CardContent>
                        </Card>
                    ) : (
                        feedback.map((item) => {
                            const config = getSentimentConfig(item.sentiment);
                            const SentimentIcon = config.icon;
                            return (
                                <Card key={item._id} className={`transition-all hover:shadow-md border-l-4`} style={{ borderLeftColor: SENTIMENT_COLORS[item.sentiment as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.Unknown }}>
                                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                                        <div className={`p-2.5 rounded-full ${config.bg} mt-0.5`}>
                                            <SentimentIcon className={`h-5 w-5 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">{config.label} Feedback</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={config.badge}>
                                                        {config.emoji} {config.label}
                                                    </Badge>
                                                    {item.sentiment_score !== null && (
                                                        <Badge variant="outline" className="text-xs font-mono">
                                                            Score: {item.sentiment_score.toFixed(3)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                <UserIcon className="h-3 w-3" />
                                                <span>{item.manager_name}</span>
                                                <span>•</span>
                                                <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pl-[68px]">
                                        <p className="text-sm leading-relaxed">{item.message}</p>
                                        {/* Sentiment Confidence Bar */}
                                        {item.sentiment_score !== null && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">AI Confidence:</span>
                                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[200px]">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.abs(item.sentiment_score) * 100}%`,
                                                            backgroundColor: SENTIMENT_COLORS[item.sentiment as keyof typeof SENTIMENT_COLORS] || SENTIMENT_COLORS.Unknown
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{(Math.abs(item.sentiment_score) * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
