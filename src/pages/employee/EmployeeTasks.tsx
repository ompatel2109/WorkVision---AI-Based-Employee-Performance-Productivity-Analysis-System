import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Upload, FileText, CheckCircle2, AlertCircle, Clock, XCircle,
    ClipboardList
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: "Pending" | "Submitted" | "Completed" | "Rejected";
    assigned_by_name: string;
    due_date?: string;
    submitted_at?: string;
    hours_spent?: number;
}

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
        Pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", icon: Clock },
        Submitted: { label: "Under Review", className: "bg-blue-500/10  text-blue-500  border-blue-500/30", icon: Clock },
        Completed: { label: "Completed", className: "bg-green-500/10 text-green-500 border-green-500/30", icon: CheckCircle2 },
        Rejected: { label: "Rejected", className: "bg-red-500/10   text-red-500   border-red-500/30", icon: XCircle },
    };
    const { label, className, icon: Icon } = map[status] || map["Pending"];
    return (
        <Badge variant="outline" className={`gap-1 ${className}`}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
};

const accentColor = (status: string) => {
    if (status === "Completed") return "bg-green-500";
    if (status === "Rejected") return "bg-red-500";
    if (status === "Submitted") return "bg-blue-500";
    return "bg-yellow-500";
};

export default function EmployeeTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [hoursSpent, setHoursSpent] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const activeTasks = tasks.filter(t => t.status === "Pending" || t.status === "Rejected");
    const completedTasks = tasks.filter(t => t.status === "Submitted" || t.status === "Completed");

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get("/tasks/my_tasks");
            setTasks(res.data);
        } catch { console.error("Failed to fetch tasks"); }
    };

    const handleSubmitProof = async () => {
        if (!selectedTask || !hoursSpent) return;
        setIsSubmitting(true);

        const formData = new FormData();
        if (file) formData.append("file", file);
        formData.append("hours_spent", hoursSpent);

        try {
            await api.post(`/tasks/${selectedTask}/submit`, formData);
            toast({
                title: "✅ Task Submitted!",
                description: "Moved to review. Your Work Log has been auto-updated.",
            });
            setIsUploadOpen(false);
            setFile(null);
            setHoursSpent("");
            fetchTasks();
        } catch (error: any) {
            const errMsg = error?.response?.data?.error || "Please try again.";
            toast({ variant: "destructive", title: "Submission Failed", description: errMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const TaskCard = ({ task }: { task: Task }) => (
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor(task.status)}`} />
            <CardHeader className="pl-6 pb-2">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription className="mt-0.5">
                            Assigned by <span className="font-medium">{task.assigned_by_name}</span>
                            {task.due_date && (
                                <> · Due <span className="font-medium">{format(new Date(task.due_date), "MMM d, yyyy")}</span></>
                            )}
                        </CardDescription>
                    </div>
                    <StatusBadge status={task.status} />
                </div>
            </CardHeader>
            <CardContent className="pl-6 pt-0">
                {task.description && (
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Action area */}
                    {(task.status === "Pending" || task.status === "Rejected") && (
                        <div className="flex items-center gap-3">
                            {task.status === "Rejected" && (
                                <p className="text-sm text-red-500 flex items-center gap-1 font-medium">
                                    <AlertCircle className="h-4 w-4" /> Rejected — please resubmit
                                </p>
                            )}
                            <Dialog
                                open={isUploadOpen && selectedTask === task._id}
                                onOpenChange={(open) => {
                                    setIsUploadOpen(open);
                                    if (open) setSelectedTask(task._id);
                                    if (!open) { setFile(null); setHoursSpent(""); }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Submit Proof
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Submit Task Proof</DialogTitle>
                                        <DialogDescription>
                                            Enter hours spent and optionally upload a proof file.
                                            This will auto-update your Work Log.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Hours Spent <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 4.5"
                                                step="0.5"
                                                min="0.5"
                                                value={hoursSpent}
                                                onChange={(e) => setHoursSpent(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Proof File <span className="text-muted-foreground text-xs">(optional — any type)</span>
                                            </label>
                                            <Input type="file" onChange={(e) => {
                                                if (e.target.files?.[0]) setFile(e.target.files[0]);
                                            }} />
                                            {file && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <FileText className="h-3 w-3" /> {file.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleSubmitProof}
                                            disabled={!hoursSpent || isSubmitting}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit for Review"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {/* Submitted / Completed info */}
                    {(task.status === "Submitted" || task.status === "Completed") && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {task.submitted_at && (
                                <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    Submitted {format(new Date(task.submitted_at), "MMM d, h:mm a")}
                                </span>
                            )}
                            {task.hours_spent !== undefined && task.hours_spent > 0 && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {task.hours_spent} hrs
                                </span>
                            )}
                            {task.status === "Completed" && (
                                <span className="text-green-500 flex items-center gap-1 font-medium">
                                    <CheckCircle2 className="h-4 w-4" /> Manager verified
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const EmptyState = ({ label }: { label: string }) => (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <ClipboardList className="h-10 w-10 text-muted-foreground mb-3 opacity-30" />
            <p className="text-muted-foreground">{label}</p>
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground">
                    Submit proof for pending tasks. Completed tasks and Work Log update automatically.
                </p>
            </div>

            <Tabs defaultValue="active">
                <TabsList className="mb-4">
                    <TabsTrigger value="active" className="gap-2">
                        Active Tasks
                        {activeTasks.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{activeTasks.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2">
                        Completed / Under Review
                        {completedTasks.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{completedTasks.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    {activeTasks.length === 0
                        ? <EmptyState label="No active tasks. You're all caught up! 🎉" />
                        : activeTasks.map(t => <TaskCard key={t._id} task={t} />)
                    }
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {completedTasks.length === 0
                        ? <EmptyState label="No submitted or completed tasks yet." />
                        : completedTasks.map(t => <TaskCard key={t._id} task={t} />)
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
}
