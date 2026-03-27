import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Department {
    _id: string;
    name: string;
    manager_id: string | null;
    manager_name?: string | null;
    manager_email?: string | null;
    created_at?: string;
}

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function AdminDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managers, setManagers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    // Create State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptManagerId, setNewDeptManagerId] = useState<string>('none');

    // Edit & Delete State
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchDepartments();
        fetchManagers();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await api.get('/admin/users');
            const allUsers = res.data as UserData[];
            const managerList = allUsers.filter(u => u.role === 'manager');
            setManagers(managerList);
        } catch (error) {
            console.error("Failed to fetch managers", error);
        }
    };

    const handleCreate = async () => {
        if (!newDeptName) return;
        try {
            const payload: any = { name: newDeptName };
            if (newDeptManagerId && newDeptManagerId !== 'none') {
                payload.manager_id = newDeptManagerId;
            }

            await api.post('/admin/departments', payload);
            setNewDeptName('');
            setNewDeptManagerId('none');
            setIsDialogOpen(false);
            toast({ title: "Department Created", description: "New department added successfully." });
            fetchDepartments();
        } catch (error) {
            console.error("Failed to create department", error);
            toast({ title: "Error", description: "Failed to create department.", variant: "destructive" });
        }
    };

    const handleEditClick = (dept: Department) => {
        setEditingDept(dept);
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingDept) return;
        try {
            const payload: any = { name: editingDept.name };
            payload.manager_id = editingDept.manager_id === 'none' ? null : editingDept.manager_id;

            await api.put(`/admin/departments/${editingDept._id}`, payload);
            setIsEditOpen(false);
            setEditingDept(null);
            toast({ title: "Department Updated", description: "Department details updated successfully." });
            fetchDepartments();
        } catch (error) {
            console.error("Failed to update department", error);
            toast({ title: "Error", description: "Failed to update department.", variant: "destructive" });
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeptToDelete(id);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deptToDelete) return;
        try {
            await api.delete(`/admin/departments/${deptToDelete}`);
            setDeptToDelete(null);
            setIsDeleteOpen(false);
            toast({ title: "Department Deleted", description: "Department removed successfully." });
            fetchDepartments();
        } catch (error) {
            console.error("Failed to delete department", error);
            toast({ title: "Error", description: "Failed to delete department.", variant: "destructive" });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-2xl font-bold text-foreground">Departments</h1>
                    <p className="text-muted-foreground">Manage organization structure.</p>
                </motion.div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Department</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Department Name</Label>
                                <Input
                                    id="name"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    placeholder="e.g., Marketing"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager">Assign Manager (Optional)</Label>
                                <Select value={newDeptManagerId} onValueChange={setNewDeptManagerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- No Manager --</SelectItem>
                                        {managers.map(mgr => (
                                            <SelectItem key={mgr._id} value={mgr._id}>
                                                {mgr.name} ({mgr.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div>Loading...</div>
                ) : departments.map((dept) => (
                    <motion.div
                        key={dept._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{dept.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Created {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${dept.manager_id ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        Status: {dept.manager_id ? 'Assigned' : 'Unassigned'}
                                    </span>
                                </div>

                                {dept.manager_id ? (
                                    <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border border-border/50">
                                        <Avatar className="h-8 w-8 border border-background">
                                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                {dept.manager_name ? getInitials(dept.manager_name) : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Manager</p>
                                            <p className="text-sm font-medium truncate">{dept.manager_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{dept.manager_email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-md bg-muted/20 border border-border/50 text-center">
                                        <p className="text-sm text-muted-foreground">No manager assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => handleEditClick(dept)}
                            >
                                <Edit className="h-3 w-3" /> Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border border-destructive/20 shadow-none"
                                onClick={() => handleDeleteClick(dept._id)}
                            >
                                <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Department Name</Label>
                            <Input
                                id="edit-name"
                                value={editingDept?.name || ''}
                                onChange={(e) => setEditingDept(prev => prev ? { ...prev, name: e.target.value } : null)}
                                placeholder="Department Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-manager">Assign Manager</Label>
                            <Select
                                value={editingDept?.manager_id || 'none'}
                                onValueChange={(val) => setEditingDept(prev => prev ? { ...prev, manager_id: val } : null)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- No Manager --</SelectItem>
                                    {managers.map(mgr => (
                                        <SelectItem key={mgr._id} value={mgr._id}>
                                            {mgr.name} ({mgr.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this department? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
