import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Download, FileSpreadsheet, FileText, BarChart3, Users, Target, TrendingUp, Loader2, Printer
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

/* ── Types ─────────────────────────────────────────────────────── */
interface Employee {
  id: string; name: string; email: string;
  department: string; position: string;
  overallScore: number; taskCompletionRate: number;
  deadlineAdherence: number; averageWorkingHours: number;
  efficiencyIndex: number; category: string;
}
interface DeptStat { name: string; avgScore: number; employees: number; }
interface TrendPoint { date: string; tasksCompleted: number; avgScore: number; hoursWorked: number; }

export default function AdminReports() {
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [deptStats, setDeptStats]       = useState<DeptStat[]>([]);
  const [trend, setTrend]               = useState<TrendPoint[]>([]);
  const [loading, setLoading]           = useState(true);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [reportType, setReportType]     = useState('performance');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/reports/chart_data');
        setEmployees(res.data.employees   || []);
        setDeptStats(res.data.departmentStats || []);
        setTrend(res.data.trend           || []);
      } catch (err) {
        console.error('Failed to load report data', err);
        toast({ title: 'Error', description: 'Failed to load report data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Derived summary numbers ─────────────────────────────────── */
  const avgScore       = employees.length ? Math.round(employees.reduce((s, e) => s + e.overallScore, 0) / employees.length) : 0;
  const avgCompletion  = employees.length ? Math.round(employees.reduce((s, e) => s + e.taskCompletionRate, 0) / employees.length) : 0;

  const categoryBadge = (cat: string) => {
    const map: Record<string, string> = {
      'Exceptional':     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      'High Performer':  'bg-green-500/15 text-green-400 border-green-500/30',
      'Average':         'bg-blue-500/15 text-blue-400 border-blue-500/30',
      'Developing':      'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      'Needs Improvement': 'bg-red-500/15 text-red-400 border-red-500/30',
    };
    return map[cat] ?? 'bg-muted text-muted-foreground';
  };

  /* ── Export handlers ─────────────────────────────────────────── */
  const exportCsv = () => {
    const headers = ['Employee', 'Department', 'Score', 'Completion %', 'Adherence %', 'Avg Hours', 'Category'];
    const rows = employees.map(e => [
      e.name, e.department, e.overallScore,
      `${e.taskCompletionRate}%`, `${e.deadlineAdherence}%`, e.averageWorkingHours, e.category,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `performance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`,
    });
    a.click();
    toast({ title: 'CSV Exported', description: 'Downloaded successfully.' });
  };

  const exportPdf = async () => {
    setPdfLoading(true);
    try {
      toast({ title: 'Generating PDF…', description: 'Building your visual report.' });
      
      const res = await api.get('/admin/reports/team_pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `workvision_admin_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      });
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);

      toast({ title: '✅ PDF Downloaded' });
    } catch (err) {
      console.error(err);
      toast({ title: 'PDF Export Failed', variant: 'destructive' });
    } finally { setPdfLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-lg">Loading real-time report data…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div id="report-dashboard" className="container mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="mt-2 text-muted-foreground">Live company-wide performance data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={exportCsv}>
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportPdf} disabled={pdfLoading}>
              {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Export PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance Overview</SelectItem>
              <SelectItem value="productivity">Productivity Trends</SelectItem>
              <SelectItem value="department">Department Analysis</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* KPI Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users,     label: 'Total Employees',  value: employees.length },
            { icon: Target,    label: 'Avg Score',         value: `${avgScore}/100` },
            { icon: BarChart3, label: 'Avg Task Completion',value: `${avgCompletion}%` },
            { icon: TrendingUp,label: 'Departments',        value: deptStats.length },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }} className="dashboard-section">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold text-foreground">{c.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Performance Trend — real avgScore from DB */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="dashboard-section">
            <h3 className="mb-4 text-lg font-semibold">Avg Performance Score — Last 30 Days</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    interval={Math.floor(trend.length / 6)} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#f3f4f6' }} />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="#6366f1" strokeWidth={2} fill="url(#gradScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Department Comparison — real data */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="dashboard-section">
            <h3 className="mb-4 text-lg font-semibold">Department Performance</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#f3f4f6' }}
                    formatter={(val: number, name: string) => [`${val}`, name]} />
                  <Bar dataKey="avgScore" name="Avg Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="employees" name="Employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Tasks Completed + Hours — real 30-day data */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="dashboard-section lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Tasks Completed & Hours Worked — Last 30 Days</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    interval={Math.floor(trend.length / 6)} />
                  <YAxis yAxisId="left"  axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#f3f4f6' }} />
                  <Legend />
                  <Line yAxisId="left"  type="monotone" dataKey="tasksCompleted" name="Tasks Completed"
                    stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="hoursWorked" name="Est. Hours"
                    stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Employee Table — real data, real scores */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="dashboard-section mt-6">
          <h3 className="mb-4 text-lg font-semibold">Detailed Performance Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium text-center">Score</th>
                  <th className="pb-3 font-medium text-center">Completion</th>
                  <th className="pb-3 font-medium text-center">On-Time</th>
                  <th className="pb-3 font-medium text-center">Hours</th>
                  <th className="pb-3 font-medium text-center">Category</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No employee performance data yet.</td></tr>
                ) : employees.map(e => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </td>
                    <td className="py-3 text-muted-foreground">{e.department}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        e.overallScore >= 70 ? 'bg-green-500/10 text-green-400'
                        : e.overallScore >= 50 ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-red-500/10 text-red-400'
                      }`}>{e.overallScore}</span>
                    </td>
                    <td className="py-3 text-center">{e.taskCompletionRate}%</td>
                    <td className="py-3 text-center">{e.deadlineAdherence}%</td>
                    <td className="py-3 text-center">{e.averageWorkingHours}h</td>
                    <td className="py-3 text-center">
                      <Badge variant="outline" className={`text-xs ${categoryBadge(e.category)}`}>{e.category}</Badge>
                    </td>
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

