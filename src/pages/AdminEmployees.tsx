import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
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
import { Label } from '@/components/ui/label';
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
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getEmployeePerformanceData } from '@/data/mockData';
import { EmployeePerformance } from '@/types';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { useToast } from '@/hooks/use-toast';

export default function AdminEmployees() {
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePerformance | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setPerformanceData(getEmployeePerformanceData());
  }, []);

  const departments = [...new Set(performanceData.map(p => p.employee.department).filter(Boolean))];

  const filteredData = performanceData.filter(perf => {
    const matchesSearch = perf.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         perf.employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || perf.employee.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const handleViewEmployee = (perf: EmployeePerformance) => {
    setSelectedEmployee(perf);
    setIsViewDialogOpen(true);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Employee Added",
      description: "New employee has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteEmployee = (id: string) => {
    toast({
      title: "Employee Removed",
      description: "Employee has been removed from the system.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
            <p className="mt-2 text-muted-foreground">
              Manage employee profiles, permissions, and performance data.
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the details for the new employee account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" placeholder="Software Developer" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Employee</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Employee Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((perf, index) => (
            <motion.div
              key={perf.employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="dashboard-section group relative overflow-hidden transition-all hover:border-primary/30"
            >
              <div className="absolute right-3 top-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewEmployee(perf)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteEmployee(perf.employee.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(perf.employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{perf.employee.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{perf.employee.position}</p>
                  <Badge variant="secondary" className="mt-2">
                    {perf.employee.department}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <ScoreGauge score={perf.metrics.overallScore} size="sm" showLabel={false} />
                  <div>
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="font-semibold text-foreground">{perf.metrics.overallScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(perf.metrics.trend)}
                  <span className={`text-sm ${
                    perf.metrics.trend === 'up' ? 'text-success' :
                    perf.metrics.trend === 'down' ? 'text-destructive' :
                    'text-muted-foreground'
                  }`}>
                    {perf.metrics.trendPercentage}%
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="font-semibold text-foreground">{perf.metrics.taskCompletionRate}%</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="text-xs text-muted-foreground">On-Time</p>
                  <p className="font-semibold text-foreground">{perf.metrics.deadlineAdherence}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No employees found matching your criteria.</p>
          </div>
        )}

        {/* View Employee Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedEmployee && (
              <>
                <DialogHeader>
                  <DialogTitle>Employee Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {getInitials(selectedEmployee.employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedEmployee.employee.name}</h3>
                        <p className="text-muted-foreground">{selectedEmployee.employee.position}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.employee.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.employee.position}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Productivity Score</span>
                      <ScoreGauge score={selectedEmployee.metrics.overallScore} size="md" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Task Completion</span>
                        <span className="font-medium">{selectedEmployee.metrics.taskCompletionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Deadline Adherence</span>
                        <span className="font-medium">{selectedEmployee.metrics.deadlineAdherence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Working Hours</span>
                        <span className="font-medium">{selectedEmployee.metrics.averageWorkingHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Efficiency Index</span>
                        <span className="font-medium">{selectedEmployee.metrics.efficiencyIndex}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Performance Trend</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(selectedEmployee.metrics.trend)}
                          <span>{selectedEmployee.metrics.trendPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                  <Button>Edit Profile</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
