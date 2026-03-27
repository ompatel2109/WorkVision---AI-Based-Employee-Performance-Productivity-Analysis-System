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
import { Eye, Pencil } from "lucide-react";
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

export default function AdminTeamView() {
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

    // Filters
    const [sortConfig, setSortConfig] = useState("name-asc"); // name-asc, score-desc, score-asc
    const [statusFilter, setStatusFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    // Department list (matching AdminEmployees)
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

    const fetchTeam = async () => {
        try {
            // Admin users endpoint returns all users (managers, admins, employees)
            const res = await api.get("/admin/users");
            // Filter only employees to match the "My Team" functionality
            const onlyEmployees = res.data.filter((u: Employee) => u.role === "employee");
            setEmployees(onlyEmployees);
        } catch (error) {
            console.error("Failed to fetch team", error);
        }
    };

    useEffect(() => {
        fetchTeam();

        const interval = setInterval(fetchTeam, 60000);
        const handleVisibility = () => { if (document.visibilityState === 'visible') fetchTeam(); };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);


    useEffect(() => {
        let filtered = employees.filter((emp) => {
            const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  emp.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
            const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
            
            return matchesSearch && matchesStatus && matchesDept;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sortConfig === "score-desc") return b.latest_score - a.latest_score;
            if (sortConfig === "score-asc") return a.latest_score - b.latest_score;
            if (sortConfig === "name-asc") return a.name.localeCompare(b.name);
            return 0;
        });

        setFilteredEmployees(filtered);
    }, [searchQuery, employees, sortConfig, statusFilter, departmentFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Exceptional":        return "bg-emerald-500 hover:bg-emerald-600 text-white";
            case "High Performer":     return "bg-green-500 hover:bg-green-600 text-white";
            case "Average":            return "bg-blue-500 hover:bg-blue-600 text-white";
            case "Developing":         return "bg-yellow-500 hover:bg-yellow-600 text-white";
            case "Needs Improvement":  return "bg-red-500 hover:bg-red-600 text-white";
            case "At Risk":            return "bg-red-700 hover:bg-red-800 text-white";
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
            await api.put(`/admin/users/${editingEmployee._id}`, {
                name: editName,
                email: editEmail,
                department: editDepartment,
                role: editingEmployee.role
            });
            toast({ title: "Employee Updated", description: `${editName}'s details have been updated successfully.` });
            setIsEditOpen(false);
            setEditingEmployee(null);
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
                <h1 className="text-3xl font-bold tracking-tight">Department Teams</h1>
                <p className="text-muted-foreground">Manage and monitor employees across all departments.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <CardTitle>Employee List</CardTitle>
                        <div className="flex flex-wrap w-full md:w-auto items-center gap-2">
                            <Input
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:max-w-xs"
                            />
                            
                            <select
                                className="h-9 w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="all">All Depts</option>
                                {departments.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            <select
                                className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="Exceptional">Exceptional</option>
                                <option value="High Performer">High Performer</option>
                                <option value="Average">Average</option>
                                <option value="Developing">Developing</option>
                                <option value="Needs Improvement">Needs Improvement</option>
                                <option value="At Risk">At Risk</option>
                            </select>

                            <select
                                className="h-9 w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                                <TableHead>Department</TableHead>
                                <TableHead>Latest Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <TableRow key={emp._id}>
                                        <TableCell className="font-medium">{emp.name}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell><Badge variant="outline">{emp.department}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${Math.min(emp.latest_score || 0, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{(emp.latest_score || 0).toFixed(1)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(emp.status)}>{emp.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/admin/employee/${emp._id}`)}>
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update the details of {editingEmployee?.name}.
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
                            <select
                                id="edit-department"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editDepartment}
                                onChange={(e) => setEditDepartment(e.target.value)}
                            >
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
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
