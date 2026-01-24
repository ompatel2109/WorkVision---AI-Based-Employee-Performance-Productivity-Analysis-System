import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { getEmployeePerformanceData, getDepartmentStats } from '@/data/mockData';
import { EmployeePerformance } from '@/types';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminReports() {
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [departmentStats, setDepartmentStats] = useState<{ name: string; avgScore: number; employees: number }[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState('performance');
  const { toast } = useToast();

  useEffect(() => {
    setPerformanceData(getEmployeePerformanceData());
    setDepartmentStats(getDepartmentStats());
  }, []);

  // Generate trend data for the selected period
  const generateTrendData = () => {
    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, 'MMM dd'),
        avgScore: 60 + Math.floor(Math.random() * 25),
        tasksCompleted: 40 + Math.floor(Math.random() * 30),
        hoursWorked: 6 + Math.random() * 3,
      };
    });
  };

  const trendData = generateTrendData();

  const avgScore = performanceData.length > 0 
    ? Math.round(performanceData.reduce((sum, p) => sum + p.metrics.overallScore, 0) / performanceData.length)
    : 0;

  const avgCompletion = performanceData.length > 0
    ? Math.round(performanceData.reduce((sum, p) => sum + p.metrics.taskCompletionRate, 0) / performanceData.length)
    : 0;

  const exportReport = (formatType: 'csv' | 'pdf') => {
    if (formatType === 'csv') {
      // Generate CSV content
      const headers = ['Employee', 'Department', 'Position', 'Score', 'Task Completion', 'Deadline Adherence', 'Avg Hours'];
      const rows = performanceData.map(p => [
        p.employee.name,
        p.employee.department,
        p.employee.position,
        p.metrics.overallScore,
        `${p.metrics.taskCompletionRate}%`,
        `${p.metrics.deadlineAdherence}%`,
        p.metrics.averageWorkingHours
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Exported",
        description: "CSV report has been downloaded successfully.",
      });
    } else {
      toast({
        title: "PDF Export",
        description: "PDF export feature coming soon with Lovable Cloud.",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Generate comprehensive performance reports and export data.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportReport('csv')}>
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => exportReport('pdf')}>
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row"
        >
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance Overview</SelectItem>
              <SelectItem value="productivity">Productivity Trends</SelectItem>
              <SelectItem value="department">Department Analysis</SelectItem>
              <SelectItem value="comparison">Employee Comparison</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal gap-2",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </motion.div>

        {/* Report Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="dashboard-section"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{performanceData.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="dashboard-section"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Target className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-foreground">{avgScore}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="dashboard-section"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Task Completion</p>
                <p className="text-2xl font-bold text-foreground">{avgCompletion}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="dashboard-section"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{departmentStats.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dashboard-section"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">Performance Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(210, 70%, 25%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(210, 70%, 25%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="hsl(210, 70%, 25%)"
                    strokeWidth={2}
                    fill="url(#colorScore)"
                    name="Avg Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Department Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="dashboard-section"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">Department Performance</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="hsl(175, 60%, 40%)" 
                    radius={[4, 4, 0, 0]}
                    name="Avg Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Tasks & Hours Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="dashboard-section lg:col-span-2"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">Tasks Completed & Working Hours</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="tasksCompleted" 
                    stroke="hsl(210, 70%, 25%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(210, 70%, 25%)', strokeWidth: 2 }}
                    name="Tasks Completed"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="hoursWorked" 
                    stroke="hsl(175, 60%, 40%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(175, 60%, 40%)', strokeWidth: 2 }}
                    name="Hours Worked"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Employee Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="dashboard-section mt-6"
        >
          <h3 className="mb-6 text-lg font-semibold text-foreground">Detailed Performance Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Position</th>
                  <th className="pb-3 font-medium text-center">Score</th>
                  <th className="pb-3 font-medium text-center">Completion</th>
                  <th className="pb-3 font-medium text-center">On-Time</th>
                  <th className="pb-3 font-medium text-center">Avg Hours</th>
                  <th className="pb-3 font-medium text-center">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((perf) => (
                  <tr key={perf.employee.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-4">
                      <p className="font-medium text-foreground">{perf.employee.name}</p>
                      <p className="text-xs text-muted-foreground">{perf.employee.email}</p>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{perf.employee.department}</td>
                    <td className="py-4 text-sm text-muted-foreground">{perf.employee.position}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        perf.metrics.overallScore >= 80 
                          ? 'bg-success/10 text-success' 
                          : perf.metrics.overallScore >= 60 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {perf.metrics.overallScore}
                      </span>
                    </td>
                    <td className="py-4 text-center text-sm">{perf.metrics.taskCompletionRate}%</td>
                    <td className="py-4 text-center text-sm">{perf.metrics.deadlineAdherence}%</td>
                    <td className="py-4 text-center text-sm">{perf.metrics.averageWorkingHours}h</td>
                    <td className="py-4 text-center text-sm">{perf.metrics.efficiencyIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
