import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
    Trash2, Download, RefreshCw, CheckCircle2, Clock, XCircle,
    ClipboardList, Timer, TrendingUp, AlertCircle, Cpu, Sparkles,
    BarChart3, Star, Bug, BookOpen, Users, MessageSquare, Loader2,
} from "lucide-react";
import api from "@/lib/api";

/* ─── Types ─────────────────────────────────────────────────── */
interface WorkLog {
    _id: string;
    date: string;
    tasks_assigned: number;
    tasks_completed: number;
    hours_worked: number;
    deadline_adherence: number;
    delay_count: number;
    notes?: string;
}

interface TaskSummary {
    tasks_assigned: number;
    tasks_completed: number;
    tasks_verified: number;
    tasks_submitted: number;
    tasks_pending: number;
    tasks_rejected: number;
    total_hours: number;
    deadline_adherence: number;
    delay_count: number;
    peer_review_score: number;      // auto-computed from task metrics
    client_feedback_score: number;  // avg of manager feedback scores
    completed_tasks: { title: string; submitted_at: string | null; hours_spent: number; due_date: string | null; status?: string }[];
}

interface AIPrediction {
    predicted_score: number;
    label: string;
    color: string;
    insights: string[];
}

/* ─── Helpers ────────────────────────────────────────────────── */
const scoreLabel = (s: number) => {
    if (s >= 85) return { label: "Outstanding", color: "text-emerald-500" };
    if (s >= 70) return { label: "Good", color: "text-green-500" };
    if (s >= 55) return { label: "Average", color: "text-yellow-500" };
    if (s >= 40) return { label: "Below Average", color: "text-orange-500" };
    return { label: "Needs Improvement", color: "text-red-500" };
};

const scoreInsights = (data: {
    projects_completed: number; hours_worked: number; bugs_fixed: number;
    training_hours: number; peer_review_score: number; client_feedback_score: number;
    score: number;
}): string[] => {
    const tips: string[] = [];
    if (data.score >= 85) tips.push("🌟 Exceptional performance — you are in the top tier!");
    if (data.training_hours < 5) tips.push("📚 Increasing training hours can significantly boost productivity.");
    if (data.bugs_fixed < 3) tips.push("🐛 Resolving more bugs demonstrates technical depth.");
    if (data.peer_review_score < 7) tips.push("🤝 Higher peer-review engagement improves team velocity.");
    if (data.client_feedback_score < 7) tips.push("💬 Improving client satisfaction ratings lifts overall score.");
    if (data.projects_completed < 2) tips.push("📁 Completing more projects strengthens your productivity index.");
    if (data.hours_worked < 6) tips.push("⏰ Consistent daily hours directly impact your AI performance score.");
    if (tips.length === 0) tips.push("✅ All metrics look great — keep up the excellent work!");
    return tips;
};

/* ─── Gauge Component ────────────────────────────────────────── */
const ScoreGauge = ({ score }: { score: number }) => {
    const clamp = Math.min(100, Math.max(0, score));
    const { label, color } = scoreLabel(clamp);
    const dash = 2 * Math.PI * 54;
    const offset = dash - (clamp / 100) * dash;

    const gaugeColor =
        clamp >= 85 ? "#10b981" :
            clamp >= 70 ? "#22c55e" :
                clamp >= 55 ? "#eab308" :
                    clamp >= 40 ? "#f97316" : "#ef4444";

    return (
        <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative flex items-center justify-center">
                <svg width="140" height="140" className="-rotate-90">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="currentColor"
                        strokeWidth="12" className="text-muted/30" />
                    <circle cx="70" cy="70" r="54" fill="none"
                        stroke={gaugeColor} strokeWidth="12"
                        strokeDasharray={dash} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                </svg>
                <div className="absolute text-center">
                    <p className={`text-3xl font-black ${color}`}>{clamp.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
            </div>
            <Badge className={`text-sm px-3 py-1 ${clamp >= 85 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                clamp >= 70 ? "bg-green-500/10 text-green-500 border-green-500/30" :
                    clamp >= 55 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" :
                        clamp >= 40 ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                            "bg-red-500/10 text-red-500 border-red-500/30"
                }`} variant="outline">
                {label}
            </Badge>
        </div>
    );
};

/* ─── Small stat card ────────────────────────────────────────── */
const StatCard = ({
    icon: Icon, label, value, color, sub,
}: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) => (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <div className={`rounded-full p-2 ${color}`}><Icon className="h-5 w-5" /></div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
    </div>
);

/* ─── Main Page ──────────────────────────────────────────────── */
export default function EmployeeWorkLog() {
    const { toast } = useToast();

    // Data
    const [logs, setLogs] = useState<WorkLog[]>([]);
    const [summary, setSummary] = useState<TaskSummary | null>(null);
    const [aiResult, setAiResult] = useState<AIPrediction | null>(null);
    const [userInfo, setUserInfo] = useState<{ department?: string; role?: string }>({});

    // Loading states
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);

    // Form fields — manual inputs
    const [hoursWorked, setHoursWorked] = useState("8");
    const [projectsCompleted, setProjectsCompleted] = useState("1");
    const [bugsFixed, setBugsFixed] = useState("0");
    const [trainingHours, setTrainingHours] = useState("0");
    const [peerReviewScore, setPeerReviewScore] = useState([7]);   // slider 1-10
    const [clientFeedbackScore, setClientFeedbackScore] = useState([7]);   // slider 1-10
    const [notes, setNotes] = useState("");

    /* ── Fetchers ─────────────────────────────────────────── */
    const fetchLogs = useCallback(async () => {
        try { const r = await api.get("/employee/work-log"); setLogs(r.data); }
        catch { console.error("Failed to fetch logs"); }
    }, []);

    const fetchTaskSummary = useCallback(async () => {
        setIsSummaryLoading(true);
        try {
            const r = await api.get("/employee/task-summary");
            setSummary(r.data);
            // Auto-set AI sliders from server-computed scores
            if (r.data.peer_review_score != null)
                setPeerReviewScore([Math.round(r.data.peer_review_score)]);
            if (r.data.client_feedback_score != null)
                setClientFeedbackScore([Math.round(r.data.client_feedback_score)]);
        }
        catch { console.error("Failed to fetch task summary"); }
        finally { setIsSummaryLoading(false); }
    }, []);

    const fetchUserInfo = useCallback(async () => {
        try { const r = await api.get("/auth/me"); setUserInfo(r.data); }
        catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchLogs();
        fetchTaskSummary();
        fetchUserInfo();
    }, [fetchLogs, fetchTaskSummary, fetchUserInfo]);

    /* ── AI Predict ───────────────────────────────────────── */
    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAiResult(null);
        const payload = {
            projects_completed: parseInt(projectsCompleted) || 0,
            hours_worked: parseFloat(hoursWorked) || 0,
            bugs_fixed: parseInt(bugsFixed) || 0,
            training_hours: parseFloat(trainingHours) || 0,
            peer_review_score: peerReviewScore[0],
            client_feedback_score: clientFeedbackScore[0],
            department: userInfo.department || "Engineering",
            role: userInfo.role || "employee",
        };
        try {
            const r = await api.post("/predict", payload);
            const score = r.data.predicted_score;
            const lbl = scoreLabel(score);
            const tips = scoreInsights({ ...payload, score });
            setAiResult({ predicted_score: score, ...lbl, insights: tips });
            toast({ title: "✅ AI Analysis Complete", description: `Performance Score: ${score.toFixed(1)} / 100` });
        } catch {
            toast({ variant: "destructive", title: "AI unavailable", description: "Ensure the backend AI model is loaded." });
        } finally { setIsAnalyzing(false); }
    };

    /* ── Download Work Log PDF ────────────────────────────── */
    const downloadWorkLogPdf = async () => {
        setIsPdfLoading(true);
        try {
            toast({ title: "Generating PDF…", description: "Building your work log report." });
            const response = await api.get("/employee/work_log/pdf", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `workvision_worklog_${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "✅ PDF Downloaded", description: "Your work log report has been saved." });
        } catch {
            toast({ variant: "destructive", title: "PDF Failed", description: "Could not generate PDF. Please try again." });
        } finally { setIsPdfLoading(false); }
    };

    /* ── Save Work Log ────────────────────────────────────── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary) {
            toast({ variant: "destructive", title: "Error", description: "Task summary not loaded yet." });
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await api.post("/employee/work-log", {
                tasks_assigned: summary.tasks_assigned,
                tasks_completed: summary.tasks_completed,
                hours_worked: parseFloat(hoursWorked) || 0,
                deadline_adherence: summary.deadline_adherence,
                delay_count: summary.delay_count,
                bugs_fixed: parseInt(bugsFixed) || 0,
                projects_completed: parseInt(projectsCompleted) || 0,
                training_hours: parseFloat(trainingHours) || 0,
                notes: notes.trim() || undefined,
            });

            const data = res.data;
            if (data.unified_score != null) {
                const uScore = data.unified_score;
                const wScore = data.work_score;
                const fScore = data.feedback_score;
                const fbCount = data.feedback_count;

                // Update AI panel to show the saved unified score
                const lbl = scoreLabel(uScore);
                const tips: string[] = [];
                tips.push(`📊 Unified Score = Work (${wScore}) × 80% + Feedback (${fScore}) × 20%`);
                if (fbCount > 0) tips.push(`💬 Based on ${fbCount} manager feedback(s)`);
                if (wScore >= 80) tips.push("🌟 Outstanding work metrics — top performer!");
                else if (wScore >= 60) tips.push("👍 Good work output — keep pushing higher!");
                else tips.push("📈 Focus on task completion and deadlines to boost your work score.");
                if (fScore >= 75) tips.push("🟢 Manager feedback is very positive!");
                else if (fScore < 50) tips.push("🔴 Manager feedback needs improvement — seek guidance.");

                setAiResult({ predicted_score: uScore, ...lbl, insights: tips });

                toast({
                    title: `✅ Saved — Score: ${uScore}/100`,
                    description: `Work: ${wScore} × 80% + Feedback: ${fScore} × 20%`
                });
            } else {
                toast({ title: "Work log saved!", description: "Your entry has been recorded." });
            }

            setNotes("");
            fetchLogs();
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to save work log." });
        } finally { setIsSubmitting(false); }
    };

    /* ── Delete / Download ────────────────────────────────── */
    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/employee/work-log/${id}`);
            toast({ title: "Log deleted" });
            fetchLogs();
        } catch { toast({ variant: "destructive", title: "Error", description: "Failed to delete log." }); }
    };

    const handleDownloadProof = async (id: string, date: string) => {
        try {
            const r = await api.get(`/employee/work-log/proof/${id}`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([r.data]));
            const a = document.createElement("a");
            a.href = url; a.download = `proof_of_work_${date}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "Proof downloaded!" });
        } catch { toast({ variant: "destructive", title: "Error", description: "Failed to download proof." }); }
    };

    /* ─── Render ─────────────────────────────────────────────────── */
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Work Logs</h1>
                <p className="text-muted-foreground">
                    Log your daily metrics, run the <span className="text-primary font-medium">AI Performance Analysis</span>, and download proof certificates.
                </p>
            </div>

            {/* ── Live Task Summary ──────────────────────────── */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg">Live Task Summary</CardTitle>
                        <CardDescription>Auto-synced from manager-assigned tasks</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchTaskSummary} disabled={isSummaryLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isSummaryLoading ? "animate-spin" : ""}`} />Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {summary ? (
                        <>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <StatCard icon={ClipboardList} label="Assigned" value={summary.tasks_assigned} color="bg-blue-500/10 text-blue-500" />
                                <StatCard icon={CheckCircle2} label="Completed" value={summary.tasks_completed} color="bg-green-500/10 text-green-500"
                                    sub={`${summary.tasks_verified ?? 0} verified · ${summary.tasks_submitted ?? 0} under review`} />
                                <StatCard icon={Clock} label="Pending" value={summary.tasks_pending} color="bg-yellow-500/10 text-yellow-500" sub="Not yet started" />
                                <StatCard icon={XCircle} label="Rejected" value={summary.tasks_rejected} color="bg-red-500/10 text-red-500" />
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <StatCard icon={Timer} label="Total Hours (Completed)" value={`${summary.total_hours} hrs`} color="bg-purple-500/10 text-purple-500" />
                                <StatCard icon={TrendingUp} label="Deadline Adherence" value={`${summary.deadline_adherence}%`} color="bg-teal-500/10 text-teal-500" />
                                <StatCard icon={AlertCircle} label="Delays" value={summary.delay_count} color="bg-orange-500/10 text-orange-500" sub="Submitted late" />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                            <RefreshCw className="h-4 w-4 animate-spin" /><span>Loading…</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Log Form + AI Panel ────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-5">

                {/* LEFT: Input Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Performance Parameters
                        </CardTitle>
                        <CardDescription>
                            Fill in today's metrics, then click <strong>Run AI Analysis</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Auto-filled summary */}
                            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Auto-filled from task system
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-muted-foreground">Assigned:</span>{" "}
                                        <span className="font-semibold">{summary?.tasks_assigned ?? "—"}</span>
                                    </div>
                                    <div><span className="text-muted-foreground">Completed:</span>{" "}
                                        <span className="font-semibold text-green-500">{summary?.tasks_completed ?? "—"}</span>
                                    </div>
                                    <div><span className="text-muted-foreground">Adherence:</span>{" "}
                                        <span className="font-semibold">{summary?.deadline_adherence ?? "—"}%</span>
                                    </div>
                                    <div><span className="text-muted-foreground">Delays:</span>{" "}
                                        <span className="font-semibold text-red-500">{summary?.delay_count ?? "—"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Manual: Hours Worked */}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-2"><Timer className="h-4 w-4" />Hours Worked Today</Label>
                                <Input type="number" step="0.5" min="0.5" max="24" required
                                    placeholder="e.g. 8" value={hoursWorked}
                                    onChange={e => setHoursWorked(e.target.value)} />
                            </div>

                            {/* Manual: Projects Completed */}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-2"><ClipboardList className="h-4 w-4" />Projects Completed</Label>
                                <Input type="number" min="0" placeholder="e.g. 2" value={projectsCompleted}
                                    onChange={e => setProjectsCompleted(e.target.value)} />
                            </div>

                            {/* Manual: Bugs Fixed */}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-2"><Bug className="h-4 w-4" />Bugs Fixed</Label>
                                <Input type="number" min="0" placeholder="e.g. 5" value={bugsFixed}
                                    onChange={e => setBugsFixed(e.target.value)} />
                            </div>

                            {/* Manual: Training Hours */}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Training Hours</Label>
                                <Input type="number" step="0.5" min="0" placeholder="e.g. 2" value={trainingHours}
                                    onChange={e => setTrainingHours(e.target.value)} />
                            </div>


                            {/* Read-only: Peer Review Score (auto-computed) */}
                            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                                <Label className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-violet-500" />
                                        Peer Review Score
                                    </span>
                                    <Badge variant="outline" className="text-violet-500 border-violet-500/30">
                                        {peerReviewScore[0]} / 10 🔒
                                    </Badge>
                                </Label>
                                <Slider min={1} max={10} step={1} value={peerReviewScore}
                                    onValueChange={() => { }} disabled className="w-full opacity-70 pointer-events-none" />
                                <p className="text-xs text-muted-foreground">
                                    Auto-computed from your task completion ratio, deadline adherence, and delays.
                                </p>
                            </div>

                            {/* Read-only: Client Feedback Score (from manager ratings) */}
                            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                                <Label className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-amber-500" />
                                        Client Feedback Score
                                    </span>
                                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                                        {clientFeedbackScore[0]} / 10 🔒
                                    </Badge>
                                </Label>
                                <Slider min={1} max={10} step={1} value={clientFeedbackScore}
                                    onValueChange={() => { }} disabled className="w-full opacity-70 pointer-events-none" />
                                <p className="text-xs text-muted-foreground">
                                    Average of your manager's feedback scores on verified tasks.
                                    {summary?.tasks_verified === 0 && " (No tasks verified yet — using adherence estimate.)"}
                                </p>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Textarea id="notes" placeholder="Describe what you worked on today…" rows={2}
                                    value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button type="button" variant="outline" className="flex-1"
                                    onClick={handleAnalyze} disabled={isAnalyzing}>
                                    <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-pulse" : ""}`} />
                                    {isAnalyzing ? "Analyzing…" : "Run AI Analysis"}
                                </Button>
                                <Button type="submit" className="flex-1" disabled={isSubmitting || !summary}>
                                    {isSubmitting ? "Saving…" : "Save Log"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* RIGHT: AI Results + History */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                    {/* AI Analysis Panel */}
                    <Card className={`border-2 transition-colors ${aiResult ? "border-primary/40" : "border-dashed"}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-primary" />
                                AI Performance Analysis
                                <Badge variant="outline" className="ml-auto text-xs">Powered by RandomForest AI</Badge>
                            </CardTitle>
                            <CardDescription>
                                Fill in the parameters on the left and click <strong>"Run AI Analysis"</strong> to get your productivity prediction.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {aiResult ? (
                                <div className="space-y-4">
                                    {/* Score Gauge */}
                                    <ScoreGauge score={aiResult.predicted_score} />

                                    {/* Metric bars */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Projects", value: parseInt(projectsCompleted) || 0, max: 10, color: "bg-blue-500" },
                                            { label: "Bugs Fixed", value: parseInt(bugsFixed) || 0, max: 20, color: "bg-rose-500" },
                                            { label: "Peer Review", value: peerReviewScore[0], max: 10, color: "bg-violet-500" },
                                            { label: "Client Fbk", value: clientFeedbackScore[0], max: 10, color: "bg-amber-500" },
                                        ].map(m => (
                                            <div key={m.label} className="space-y-1">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{m.label}</span><span>{m.value}/{m.max}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div className={`h-2 rounded-full ${m.color} transition-all duration-700`}
                                                        style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Insights */}
                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                        <p className="text-sm font-semibold flex items-center gap-1.5">
                                            <Star className="h-4 w-4 text-yellow-500" /> AI Insights
                                        </p>
                                        <ul className="space-y-1">
                                            {aiResult.insights.map((tip, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                    <Cpu className="h-12 w-12 opacity-20" />
                                    <p className="text-sm text-center">
                                        Enter your metrics and click<br />
                                        <span className="font-medium text-foreground">Run AI Analysis</span> to see your performance score.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Log History */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Log History</CardTitle>
                                    <CardDescription>Download proof certificates for each entry</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={downloadWorkLogPdf}
                                    disabled={isPdfLoading}
                                    className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs"
                                >
                                    {isPdfLoading
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                                        : <><Download className="h-3.5 w-3.5" /> Download Full Log PDF</>}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Assigned</TableHead>
                                        <TableHead>Done</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Adherence</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No logs yet. Submit your first entry!
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.map(log => {
                                        const d = new Date(log.date).toLocaleDateString();
                                        return (
                                            <TableRow key={log._id}>
                                                <TableCell className="font-medium text-sm">{d}</TableCell>
                                                <TableCell>{log.tasks_assigned}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-green-500 border-green-500/30 bg-green-500/10">
                                                        {log.tasks_completed}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{log.hours_worked} h</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.deadline_adherence >= 80 ? "secondary" : "destructive"}>
                                                        {log.deadline_adherence}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" title="Download Proof"
                                                            onClick={() => handleDownloadProof(log._id, d.replace(/\//g, "-"))}>
                                                            <Download className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Delete"
                                                            onClick={() => handleDelete(log._id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

