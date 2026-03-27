import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, FileText, Star, Sparkles, Trophy, Loader2, Brain, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────────────── */
interface AiRecommendation {
    id: string;
    name: string;
    email: string;
    ai_score: number;
    active_tasks: number;
    completion_rate: number;
    performance_score: number;
    reason: string;
    rank: number;
}

/* ── Star Rating Component ───────────────────────────────────── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(n)}
                    className="focus:outline-none"
                >
                    <Star
                        className={`h-5 w-5 transition-colors ${n <= (hovered || value)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground self-center">
                {value} / 10
            </span>
        </div>
    );
}

/* ── AI Score Bar ─────────────────────────────────────────────── */
function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

/* ── AI Recommend Panel ───────────────────────────────────────── */
function AiRecommendPanel({ onSelect }: { onSelect: (empId: string, empName: string) => void }) {
    const [recs, setRecs] = useState<AiRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [fetched, setFetched] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const res = await api.get("/tasks/ai_recommend");
            setRecs(res.data);
            setFetched(true);
        } catch {
            console.error("AI Recommendation Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (empId: string, empName: string) => {
        setSelectedId(empId);
        setExpanded(false);
        onSelect(empId, empName);
    };

    const rankBadge = (rank: number) => {
        if (rank === 1) return <span className="text-lg">🥇</span>;
        if (rank === 2) return <span className="text-lg">🥈</span>;
        if (rank === 3) return <span className="text-lg">🥉</span>;
        return <span className="text-sm text-muted-foreground font-bold">#{rank}</span>;
    };

    const scoreColor = (score: number) => {
        if (score >= 75) return "text-emerald-500";
        if (score >= 50) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5 overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                        <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">AI Task Recommendation</p>
                        <p className="text-xs text-muted-foreground">Ranked by workload, completion &amp; performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!fetched ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={fetchRecommendations}
                            disabled={loading}
                            className="h-8 border-violet-500/40 text-violet-500 hover:text-violet-400 hover:bg-violet-500/10 text-xs gap-1.5"
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                            )}
                            {loading ? "Analysing..." : "Recommend"}
                        </Button>
                    ) : (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Results list */}
            <AnimatePresence>
                {fetched && expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="border-t border-violet-500/20 divide-y divide-border/50 max-h-72 overflow-y-auto">
                            {recs.length === 0 ? (
                                <p className="text-center py-6 text-sm text-muted-foreground">
                                    No employees found in your department.
                                </p>
                            ) : recs.map((emp, i) => (
                                <motion.div
                                    key={emp.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className={`p-3 hover:bg-muted/40 transition-colors cursor-pointer ${emp.rank === 1 ? "bg-violet-500/5" : ""} ${selectedId === emp.id ? "ring-1 ring-violet-500/60 bg-violet-500/10" : ""}`}
                                    onClick={() => handleSelect(emp.id, emp.name)}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Rank badge */}
                                        <div className="flex-shrink-0 w-7 text-center mt-0.5">
                                            {rankBadge(emp.rank)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground leading-none">{emp.name}</p>
                                                    {emp.rank === 1 && selectedId !== emp.id && (
                                                        <span className="text-xs font-medium text-violet-400 flex items-center gap-0.5 mt-0.5">
                                                            <Trophy className="h-3 w-3" /> Best match
                                                        </span>
                                                    )}
                                                    {selectedId === emp.id && (
                                                        <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5 mt-0.5">
                                                            <Check className="h-3 w-3" /> Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`text-lg font-bold leading-none ${scoreColor(emp.ai_score)}`}>
                                                    {emp.ai_score}
                                                    <span className="text-xs font-normal text-muted-foreground">/100</span>
                                                </span>
                                            </div>

                                            {/* Score breakdown bars */}
                                            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                                                <div>
                                                    <div className="flex justify-between mb-0.5">
                                                        <span>Capacity</span>
                                                        <span>{emp.active_tasks} tasks</span>
                                                    </div>
                                                    <ScoreBar value={5 - Math.min(emp.active_tasks, 5)} max={5} color="bg-emerald-500" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-0.5">
                                                        <span>Completion</span>
                                                        <span>{emp.completion_rate}%</span>
                                                    </div>
                                                    <ScoreBar value={emp.completion_rate} max={100} color="bg-blue-500" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-0.5">
                                                        <span>Score</span>
                                                        <span>{emp.performance_score}/100</span>
                                                    </div>
                                                    <ScoreBar value={emp.performance_score} max={100} color="bg-violet-500" />
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            <p className="text-xs text-muted-foreground truncate">{emp.reason}</p>
                                        </div>

                                        {/* Select button */}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={selectedId === emp.id ? "default" : emp.rank === 1 ? "default" : "outline"}
                                            className={`h-7 text-xs flex-shrink-0 ${
                                                selectedId === emp.id
                                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                                    : emp.rank === 1
                                                    ? "bg-violet-600 hover:bg-violet-700"
                                                    : ""
                                            }`}
                                            onClick={(e) => { e.stopPropagation(); handleSelect(emp.id, emp.name); }}
                                        >
                                            {selectedId === emp.id ? <><Check className="h-3 w-3 mr-1" />Selected</> : "Select"}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {recs.length > 0 && (
                            <div className="px-4 py-2 bg-muted/20">
                                <p className="text-[10px] text-muted-foreground">
                                    Click any employee to auto-select them as the task assignee.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Verify Dialog ──────────────────────────────────────────── */
interface VerifyDialogProps {
    task: any;
    onDone: () => void;
}

function VerifyDialog({ task, onDone }: VerifyDialogProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [feedbackScore, setFeedbackScore] = useState(7);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handle = async (status: "Completed" | "Rejected") => {
        setIsSubmitting(true);
        try {
            await api.post(`/tasks/${task._id}/verify`, {
                status,
                feedback_score: status === "Completed" ? feedbackScore : null,
            });
            toast({
                title: status === "Completed" ? "✅ Task Approved" : "❌ Task Rejected",
                description: status === "Completed"
                    ? `Feedback score ${feedbackScore}/10 saved. Employee's AI parameters updated.`
                    : "Task has been sent back to the employee.",
            });
            setOpen(false);
            onDone();
        } catch {
            toast({ variant: "destructive", title: "Action failed" });
        } finally { setIsSubmitting(false); }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Review
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Review Submitted Task</DialogTitle>
                    <DialogDescription>
                        <span className="font-medium text-foreground">{task.title}</span>
                        {" — "}{task.assigned_to_name}
                    </DialogDescription>
                </DialogHeader>

                {/* Proof link */}
                {task.proof_file && (
                    <div className="rounded-lg border bg-muted/40 p-3 text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                        <a
                            href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/static/uploads/${task.proof_file}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                        >
                            View Proof / Attachment
                        </a>
                    </div>
                )}

                {/* Hours worked */}
                {task.hours_spent != null && (
                    <p className="text-sm text-muted-foreground">
                        Hours spent: <span className="font-semibold text-foreground">{task.hours_spent} hrs</span>
                    </p>
                )}

                {/* Feedback Score */}
                <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium">
                        Feedback Score <span className="text-muted-foreground">(used in employee AI analysis)</span>
                    </label>
                    <StarRating value={feedbackScore} onChange={setFeedbackScore} />
                    <p className="text-xs text-muted-foreground">
                        This score will be averaged across all your verified tasks to auto-set the employee's
                        <strong> Client Feedback Score</strong> in their AI Performance Analysis.
                    </p>
                </div>

                <DialogFooter className="gap-2 pt-2">
                    <Button
                        variant="destructive" size="sm"
                        onClick={() => handle("Rejected")}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700" size="sm"
                        onClick={() => handle("Completed")}
                        disabled={isSubmitting}
                    >
                        <Check className="h-4 w-4 mr-1" /> Approve &amp; Save Score
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ManagerTasks() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", assigned_to: "", due_date: "" });
    const [selectedEmpName, setSelectedEmpName] = useState("");
    const { toast } = useToast();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, teamRes] = await Promise.all([
                api.get("/tasks/managed_tasks"),
                api.get("/manager/team"),
            ]);
            setTasks(tasksRes.data);
            setEmployees(teamRes.data);
        } catch { console.error("Failed to load data"); }
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.assigned_to) {
            toast({ variant: "destructive", title: "Missing fields", description: "Title and Assignee are required." });
            return;
        }
        try {
            await api.post("/tasks/", newTask);
            toast({ title: "Task Assigned", description: `Task assigned to ${selectedEmpName || "employee"}.` });
            setIsCreateOpen(false);
            setNewTask({ title: "", description: "", assigned_to: "", due_date: "" });
            setSelectedEmpName("");
            fetchData();
        } catch { toast({ variant: "destructive", title: "Failed to create task" }); }
    };

    const handleAiSelect = (empId: string, empName: string) => {
        setNewTask(prev => ({ ...prev, assigned_to: empId }));
        setSelectedEmpName(empName);
        // Note: intentionally NOT calling toast() here to prevent dialog from closing
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            Completed: "bg-green-500 hover:bg-green-600",
            Submitted: "bg-blue-500 hover:bg-blue-600",
            Rejected: "bg-red-500 hover:bg-red-600",
            Pending: "bg-yellow-500 hover:bg-yellow-600",
        };
        return map[status] ?? "bg-gray-500";
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
                    <p className="text-muted-foreground">Assign tasks with AI-powered employee recommendations.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(v) => { setIsCreateOpen(v); if (!v) { setNewTask({ title: "", description: "", assigned_to: "", due_date: "" }); setSelectedEmpName(""); } }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Assign New Task</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle>Assign Task</DialogTitle>
                            <DialogDescription>Create a new task. Use AI to find the best available team member.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title *</label>
                                <Input placeholder="e.g. Complete Q3 Report" value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <Input type="date" value={newTask.due_date}
                                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea placeholder="Task details..." value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            </div>

                            {/* AI Recommendation Panel */}
                            <AiRecommendPanel onSelect={handleAiSelect} />

                            {/* Assign To dropdown */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assign To *</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newTask.assigned_to}
                                    onChange={e => {
                                        const sel = employees.find((emp: any) => emp._id === e.target.value) as any;
                                        setNewTask({ ...newTask, assigned_to: e.target.value });
                                        setSelectedEmpName(sel?.name || "");
                                    }}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp: any) => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                                {selectedEmpName && (
                                    <p className="text-xs text-violet-400 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" /> {selectedEmpName} selected
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTask}>Assign Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead>Proof</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No tasks assigned yet.
                                    </TableCell>
                                </TableRow>
                            ) : tasks.map((task: any) => (
                                <TableRow key={task._id}>
                                    <TableCell className="font-medium">
                                        <div>{task.title}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{task.description}</div>
                                    </TableCell>
                                    <TableCell>{task.assigned_to_name}</TableCell>
                                    <TableCell>
                                        {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusBadge(task.status)}>{task.status}</Badge>
                                    </TableCell>
                                    {/* Feedback score column */}
                                    <TableCell>
                                        {task.feedback_score != null ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{task.feedback_score}/10</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {task.proof_file ? (
                                            <a
                                                href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/static/uploads/${task.proof_file}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="flex items-center text-blue-500 hover:underline text-sm"
                                            >
                                                <FileText className="h-4 w-4 mr-1" /> View
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {task.status === "Submitted" ? (
                                            <VerifyDialog task={task} onDone={fetchData} />
                                        ) : task.status === "Completed" ? (
                                            <span className="text-xs text-green-500 font-medium">Approved ✓</span>
                                        ) : task.status === "Rejected" ? (
                                            <span className="text-xs text-red-500 font-medium">Rejected ✗</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Awaiting</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
