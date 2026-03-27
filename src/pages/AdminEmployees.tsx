import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Edit,
  Trash2,
  UserCog
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { useToast } from '@/hooks/use-toast';

// Types matching the backend response
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position?: string; // Optional in DB currently
  latest_score: number;
  status: string; // "Excellent", "Good", "At Risk"
  is_active?: boolean;
}

export default function AdminEmployees() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Department list - strictly defined as requested
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({
        title: "Error",
        description: "Failed to load employee data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    // Explicitly construct the payload to handle select fields correctly if formData misses them or for type safety
    // iterating formData is fine too, but let's be safe with what we send
    const updates: Partial<UserData> & { password?: string } = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      role: formData.get('role') as string,
    };

    // Only add password if it's not empty
    const password = formData.get('password') as string;
    if (password && password.trim() !== '') {
      updates.password = password;
    }

    try {
      await api.put(`/admin/users/${editingUser._id}`, updates);
      toast({ title: "User Updated", description: "User details updated successfully." });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update user.",
        variant: "destructive"
      });
    }
  };

  const getFilteredUsers = (dept: string) => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = dept === 'all' || user.department === dept;
      return matchesSearch && matchesDept;
    }).sort((a, b) => {
      const roleOrder = { admin: 0, manager: 1, employee: 2 };
      const roleA = roleOrder[a.role as keyof typeof roleOrder] ?? 2;
      const roleB = roleOrder[b.role as keyof typeof roleOrder] ?? 2;
      return roleA - roleB;
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Good": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "At Risk": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };



  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete}`);
      toast({ title: "User Deleted", description: "The user has been removed." });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    } finally {
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
    }
  };

  // Add User Form Handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await api.post('/admin/users', data);
      toast({ title: "User Added", description: "New user created successfully." });
      setIsAddDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add user.",
        variant: "destructive"
      });
    }
  };

  const UserGrid = ({ data }: { data: UserData[] }) => {
    // ... (keep existing check for empty data)
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <UserCog className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No employees found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:shadow-md 
                ${user.role === 'admin'
                ? 'bg-purple-50/50 border-purple-200 hover:border-purple-400 dark:bg-purple-900/10 dark:border-purple-800'
                : user.role === 'manager'
                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400 dark:bg-amber-900/10 dark:border-amber-800'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
          >
            {user.role === 'admin' && (
              <div className="absolute top-0 right-0 rounded-bl-lg bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Admin
              </div>
            )}
            {user.role === 'manager' && (
              <div className="absolute top-0 right-0 rounded-bl-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Manager
              </div>
            )}

            <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
                onClick={() => handleEditClick(user)}
                title="Edit User"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/90 shadow-sm"
                onClick={() => handleDeleteClick(user._id)}
                title="Delete User"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-semibold text-foreground truncate text-base">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-normal">
                    {user.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/50">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Performance</p>
                  <Badge variant="outline" className={`${getStatusColor(user.status)} border px-2 py-0.5`}>
                    {user.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight">{user.latest_score.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground mb-1">/100</span>
                  </div>
                </div>
              </div>

              {/* Mini Progress Bar */}
              <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${user.status === 'Excellent' ? 'bg-green-500' :
                    user.status === 'Good' ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${Math.min(user.latest_score, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background/50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employee Directory</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all employees and managers across departments.
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new account for an employee or manager.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input name="name" id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" id="email" type="email" placeholder="john@company.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Default Password</Label>
                  <Input name="password" id="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" defaultValue="Engineering">
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="employee">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              Total Users: {users.length}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedDept}>
          <TabsList className="w-full justify-start h-auto flex-wrap p-1 bg-muted/50 gap-1 rounded-lg">
            <TabsTrigger value="all" className="px-6 py-2">All Teams</TabsTrigger>
            {departments.map(dept => (
              <TabsTrigger key={dept} value={dept} className="px-6 py-2">
                {dept}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="all" className="mt-0">
              <UserGrid data={getFilteredUsers('all')} />
            </TabsContent>

            {departments.map(dept => (
              <TabsContent key={dept} value={dept} className="mt-0">
                <UserGrid data={getFilteredUsers(dept)} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>



      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input name="name" id="edit-name" defaultValue={editingUser.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input name="email" id="edit-email" type="email" defaultValue={editingUser.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password</Label>
                  <Input name="password" id="edit-password" type="password" placeholder="Leave blank to keep current" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select name="department" defaultValue={editingUser.department}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select name="role" defaultValue={editingUser.role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>

      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
