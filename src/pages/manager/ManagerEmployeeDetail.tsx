import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Send, Sparkles, Loader2, TrendingUp, TrendingDown, Minus,
    CheckCircle2, Clock, ListChecks, BarChart3,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

export default function ManagerEmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [data, setData] = useState<any>(null);
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("positive");
    const [isSending, setIsSending] = useState(false);
    const [aiSummary, setAiSummary] = useState<{ summary: string; stats?: any } | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/manager/employee/${id}`);
            setData(res.data);
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to load employee details" });
            navigate("/manager/team");
        }
    }, [id, navigate, toast]);

    const handleGenerateSummary = useCallback(async () => {
        setIsGeneratingSummary(true);
        try {
            const res = await api.get(`/manager/employee/${id}/ai-summary`);
            setAiSummary(res.data);
        } catch {
            toast({ variant: "destructive", title: "AI failed", description: "Could not generate AI summary." });
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [id, toast]);

    // Load data on mount, then auto-generate AI summary
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (data && !aiSummary && !isGeneratingSummary) {
            handleGenerateSummary();
        }
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSendFeedback = async () => {
        if (!feedback.trim()) return;
        setIsSending(true);
        try {
            const res = await api.post("/manager/feedback", { employee_id: id, message: feedback, type: feedbackType });
            const sentiment = res.data.sentiment;
            const adj = res.data.score_adjustment;
            const newScore = res.data.new_employee_score;
            const workScore = res.data.work_score;
            const fbScore = res.data.feedback_score;
            const emoji = sentiment === "Positive" ? "🟢" : sentiment === "Negative" ? "🔴" : "🟡";
            const adjSign = adj >= 0 ? "+" : "";
            toast({
                title: `Feedback Sent — ${emoji} ${sentiment}`,
                description: `Score: ${adjSign}${adj} → ${newScore}/100 (Work: ${workScore} × 80% + Feedback: ${fbScore} × 20%)`,
            });
            setFeedback("");
            // Refresh data + AI summary after feedback
            await fetchData();
            await handleGenerateSummary();
        } catch {
            toast({ variant: "destructive", title: "Failed to send feedback" });
        } finally {
            setIsSending(false);
        }
    };

    if (!data) return (
        <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading employee data...
        </div>
    );

    const { employee, history, ai_insights, task_stats } = data;

    // Build chart data: oldest → newest, with score, deadline adherence, tasks completed
    const chartData = [...history].reverse().map((h: any) => ({
        date: new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        score: parseFloat((h.score ?? 0).toFixed(1)),
        adherence: parseFloat((h.deadline_adherence ?? 0).toFixed(1)),
        tasks: h.tasks_completed ?? 0,
    }));

    const latestScore = history[0]?.score ?? 0;
    const latestAdherence = history[0]?.deadline_adherence ?? 0;

    const statusColors: Record<string, string> = {
        "Exceptional":      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
        "High Performer":   "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300",
        "Average":          "bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300",
        "Developing":       "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        "Needs Improvement":"bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/manager/team")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
                    <p className="text-muted-foreground">{employee.email} • {employee.department}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${statusColors[ai_insights.predicted_category] ?? ""}`}>
                        {ai_insights.predicted_category}
                    </span>
                </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-2"><BarChart3 className="h-4 w-4 text-indigo-600" /></div>
                    <div>
                        <p className="text-xs text-muted-foreground">Latest Score</p>
                        <p className="text-xl font-bold text-indigo-600">{latestScore.toFixed(1)}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-2"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                    <div>
                        <p className="text-xs text-muted-foreground">Tasks Completed</p>
                        <p className="text-xl font-bold text-green-600">{task_stats?.tasks_done ?? 0} / {task_stats?.tasks_total ?? 0}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-2"><Clock className="h-4 w-4 text-yellow-600" /></div>
                    <div>
                        <p className="text-xs text-muted-foreground">Pending Tasks</p>
                        <p className="text-xl font-bold text-yellow-600">{task_stats?.tasks_pending ?? 0}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2"><ListChecks className="h-4 w-4 text-blue-600" /></div>
                    <div>
                        <p className="text-xs text-muted-foreground">Deadline Adh.</p>
                        <p className="text-xl font-bold text-blue-600">{latestAdherence.toFixed(0)}%</p>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Performance History Chart */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Performance History</CardTitle>
                        <CardDescription>Score, Deadline Adherence & Tasks Completed over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {chartData.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <BarChart3 className="h-10 w-10 opacity-30" />
                                    <p className="text-sm">No performance history yet. Data appears after tasks are completed.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: "Score / Adh%", angle: -90, position: "insideLeft", style: { fontSize: 9 } }} />
                                        <YAxis yAxisId="tasks" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: "Tasks", angle: 90, position: "insideRight", style: { fontSize: 9 } }} />
                                        <Tooltip
                                            contentStyle={{ fontSize: 11 }}
                                            formatter={(value: any, name: string) => {
                                                if (name === "score") return [`${Number(value).toFixed(1)}`, "Score"];
                                                if (name === "adherence") return [`${Number(value).toFixed(0)}%`, "Deadline Adherence"];
                                                if (name === "tasks") return [value, "Tasks Completed"];
                                                return [value, name];
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        {/* Score area */}
                                        <Area yAxisId="score" type="monotone" dataKey="score" name="score" stroke="#8b5cf6" fill="url(#colorScore)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        {/* Deadline adherence line */}
                                        <Line yAxisId="score" type="monotone" dataKey="adherence" name="adherence" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
                                        {/* Tasks bar */}
                                        <Bar yAxisId="tasks" dataKey="tasks" name="tasks" fill="#6366f1" opacity={0.5} radius={[3, 3, 0, 0]} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights & Feedback */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-900 border-indigo-200 dark:border-indigo-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-500" />
                                AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Delay Risk</span>
                                <Badge variant={ai_insights.delay_risk === "High" ? "destructive" : "secondary"}>
                                    {ai_insights.delay_risk}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-sm font-medium">Forecast</span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Predicted to maintain {ai_insights.predicted_category} status next week aligned with current trends.
                                </p>
                            </div>

                            {/* AI-Generated Summary */}
                            <div className="border-t border-indigo-200 dark:border-indigo-700 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                        AI Performance Summary
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1 border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                                        onClick={handleGenerateSummary}
                                        disabled={isGeneratingSummary}
                                    >
                                        {isGeneratingSummary ? (
                                            <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Sparkles className="h-3 w-3" /> {aiSummary ? "Regenerate" : "Generate"}</>
                                        )}
                                    </Button>
                                </div>

                                {isGeneratingSummary && (
                                    <div className="rounded-lg bg-indigo-100/60 dark:bg-indigo-900/40 p-3 flex items-center gap-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500 shrink-0" />
                                        <p className="text-xs text-muted-foreground italic">Analyzing performance data with AI...</p>
                                    </div>
                                )}

                                {aiSummary && !isGeneratingSummary && (
                                    <div className="space-y-3">
                                        <div className="rounded-lg bg-background/60 border border-indigo-200 dark:border-indigo-700 p-3">
                                            <p className="text-xs text-foreground leading-relaxed">{aiSummary.summary}</p>
                                        </div>
                                        {aiSummary.stats && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="rounded-md bg-background/40 border border-indigo-200/60 dark:border-indigo-700/40 p-2 text-center">
                                                    <p className="text-[10px] text-muted-foreground">Score</p>
                                                    <p className="font-bold text-base text-indigo-500">
                                                        {Number(aiSummary.stats.latest_score).toFixed(1)}
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-background/40 border border-indigo-200/60 dark:border-indigo-700/40 p-2 text-center">
                                                    <p className="text-[10px] text-muted-foreground">Trend</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {aiSummary.stats.trend === "improving"
                                                            ? <TrendingUp className="h-4 w-4 text-green-500" />
                                                            : aiSummary.stats.trend === "declining"
                                                            ? <TrendingDown className="h-4 w-4 text-red-500" />
                                                            : <Minus className="h-4 w-4 text-yellow-500" />}
                                                        <span className="text-[11px] font-semibold capitalize">{aiSummary.stats.trend}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-background/40 border border-indigo-200/60 dark:border-indigo-700/40 p-2 text-center">
                                                    <p className="text-[10px] text-muted-foreground">Change</p>
                                                    <p className={`font-bold text-base ${aiSummary.stats.score_change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                        {aiSummary.stats.score_change >= 0 ? "+" : ""}{Number(aiSummary.stats.score_change).toFixed(1)}
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-background/40 border border-indigo-200/60 dark:border-indigo-700/40 p-2 text-center">
                                                    <p className="text-[10px] text-muted-foreground">Deadline</p>
                                                    <p className="font-bold text-base">
                                                        {Number(aiSummary.stats.avg_deadline_adherence).toFixed(0)}%
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!aiSummary && !isGeneratingSummary && (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                        Click Generate to create an AI-powered summary.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Send Feedback</CardTitle>
                            <CardDescription className="text-xs">AI will auto-detect sentiment using NLP</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <select
                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value)}
                            >
                                <option value="positive">👍 Positive</option>
                                <option value="neutral">➡️ Neutral</option>
                                <option value="negative">⚠️ Constructive</option>
                            </select>
                            <Textarea
                                placeholder="Great job on the recent project..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                            />
                            <Button className="w-full" onClick={handleSendFeedback} disabled={isSending}>
                                <Send className="mr-2 h-4 w-4" />
                                {isSending ? "Sending..." : "Send & Analyze"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
