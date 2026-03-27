import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Employee {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    latest_score: number;
    status: string;
}

export default function ManagerTeamView() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    // Edit dialog state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editDepartment, setEditDepartment] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchTeam = async () => {
        try {
            const res = await api.get("/manager/team");
            setEmployees(res.data);
            setFilteredEmployees(res.data);
        } catch (error) {
            console.error("Failed to fetch team", error);
        }
    };

    useEffect(() => {
        fetchTeam();

        // Auto-refresh: poll every 60s + refresh on tab focus
        const interval = setInterval(fetchTeam, 60000);
        const handleVisibility = () => { if (document.visibilityState === 'visible') fetchTeam(); };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    const [sortConfig, setSortConfig] = useState("name-asc"); // name-asc, score-desc, score-asc
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        let filtered = employees.filter((emp) =>
            (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (statusFilter === "all" || emp.status === statusFilter)
        );

        // Sorting
        filtered.sort((a, b) => {
            if (sortConfig === "score-desc") return b.latest_score - a.latest_score;
            if (sortConfig === "score-asc") return a.latest_score - b.latest_score;
            if (sortConfig === "name-asc") return a.name.localeCompare(b.name);
            return 0;
        });

        setFilteredEmployees(filtered);
    }, [searchQuery, employees, sortConfig, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Exceptional":        return "bg-emerald-500 hover:bg-emerald-600 text-white";
            case "High Performer":     return "bg-green-500 hover:bg-green-600 text-white";
            case "Average":            return "bg-blue-500 hover:bg-blue-600 text-white";
            case "Developing":         return "bg-yellow-500 hover:bg-yellow-600 text-white";
            case "Needs Improvement":  return "bg-red-500 hover:bg-red-600 text-white";
            default:                   return "bg-gray-400 text-white";
        }
    };

    const handleEditClick = (emp: Employee) => {
        setEditingEmployee(emp);
        setEditName(emp.name);
        setEditEmail(emp.email);
        setEditDepartment(emp.department);
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingEmployee) return;
        setIsSaving(true);
        try {
            await api.patch(`/manager/employee/${editingEmployee._id}`, {
                name: editName,
                email: editEmail,
                department: editDepartment,
            });
            toast({ title: "Employee Updated", description: `${editName}'s details have been updated successfully.` });
            setIsEditOpen(false);
            setEditingEmployee(null);
            // Refresh team list
            fetchTeam();
        } catch (error: any) {
            const message = error?.response?.data?.error || "Failed to update employee";
            toast({ variant: "destructive", title: "Update Failed", description: message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
                <p className="text-muted-foreground">Manage and monitor your team members.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Employee List</CardTitle>
                        <div className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-xs"
                            />
                            <select
                                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="Exceptional">Exceptional</option>
                                <option value="High Performer">High Performer</option>
                                <option value="Average">Average</option>
                                <option value="Developing">Developing</option>
                                <option value="Needs Improvement">Needs Improvement</option>
                            </select>
                            <select
                                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={sortConfig}
                                onChange={(e) => setSortConfig(e.target.value)}
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="score-desc">Score (High-Low)</option>
                                <option value="score-asc">Score (Low-High)</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Latest Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <TableRow key={emp._id}>
                                        <TableCell className="font-medium">{emp.name}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${Math.min(emp.latest_score, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{emp.latest_score.toFixed(1)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(emp.status)}>{emp.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/manager/employee/${emp._id}`)}>
                                                    <Eye className="mr-2 h-3 w-3" />
                                                    Details
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(emp)}>
                                                    <Pencil className="mr-2 h-3 w-3" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update the details of {editingEmployee?.name}. Only edit is allowed — no deletion.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Employee name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="employee@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-department">Department</Label>
                            <Input
                                id="edit-department"
                                value={editDepartment}
                                onChange={(e) => setEditDepartment(e.target.value)}
                                placeholder="Department"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
