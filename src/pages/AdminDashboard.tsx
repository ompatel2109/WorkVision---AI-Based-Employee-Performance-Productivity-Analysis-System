import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Activity, Database, AlertTriangle, Trophy, Search } from 'lucide-react';
import api from '@/lib/api';

interface AdminStats {
  total_users: number;
  total_managers: number;
  total_departments: number;
  avg_company_score: number;
  total_performance_records: number;
  system_status: string;
}

interface LeaderEntry {
  id: string; name: string; email: string;
  score: number; category: string; rank: number; department: string;
}

interface ManagerEntry {
  id: string; name: string; email: string;
  department: string; employee_count: number;
  active_tasks: number; completed_tasks: number;
}

/* ── helpers ── */
const MEDALS = ['🥇', '🥈', '🥉'];

const categoryStyle = (cat: string) => {
  const m: Record<string, string> = {
    'Exceptional': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'High Performer': 'bg-green-500/15 text-green-400 border-green-500/30',
    'Average': 'bg-blue-500/15 text-blue-400 border-blue-400/30',
    'Developing': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    'Needs Improvement': 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return m[cat] ?? 'bg-muted text-muted-foreground';
};

const scoreBarColor = (s: number) =>
  s >= 85 ? 'bg-emerald-500' : s >= 70 ? 'bg-green-500' : s >= 55 ? 'bg-blue-500' : s >= 40 ? 'bg-yellow-500' : 'bg-red-500';

// Deterministic dept colors
const DEPT_COLORS = ['bg-violet-500/15 text-violet-400', 'bg-cyan-500/15 text-cyan-400', 'bg-pink-500/15 text-pink-400',
  'bg-orange-500/15 text-orange-400', 'bg-teal-500/15 text-teal-400', 'bg-indigo-500/15 text-indigo-400'];
const deptColor = (dept: string) => DEPT_COLORS[Math.abs([...dept].reduce((a, c) => a + c.charCodeAt(0), 0)) % DEPT_COLORS.length];

function MedalCard({ entry }: { entry: LeaderEntry }) {
  const isGold = entry.rank === 1;
  const isSilver = entry.rank === 2;
  const gradients = [
    'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-400/40 shadow-yellow-500/10',
    'bg-gradient-to-br from-slate-400/20 to-slate-300/10 border-slate-400/40 shadow-slate-500/10',
    'bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-orange-500/40 shadow-orange-500/10',
  ];
  const textColors = ['text-yellow-400', 'text-slate-400', 'text-orange-500'];
  return (
    <div className={`flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-all hover:scale-[1.02] duration-200 shadow-lg ${gradients[entry.rank-1]}`}>
      <span className="text-4xl">{MEDALS[entry.rank - 1]}</span>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black border-2
        ${isGold ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/40' : isSilver ? 'bg-slate-400/20 text-slate-300 border-slate-400/40' : 'bg-orange-500/20 text-orange-400 border-orange-500/40'}`}>
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-bold text-sm">{entry.name}</p>
        <Badge variant="outline" className={`mt-1 text-xs ${deptColor(entry.department)}`}>{entry.department}</Badge>
        <p className={`text-3xl font-black mt-2 ${textColors[entry.rank-1]}`}>{entry.score.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">/100</p>
      </div>
      <Badge variant="outline" className={`text-xs ${categoryStyle(entry.category)}`}>{entry.category}</Badge>
    </div>
  );
}

function RankRow({ entry }: { entry: LeaderEntry }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="w-6 text-center text-sm font-bold text-muted-foreground">#{entry.rank}</span>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{entry.name}</p>
          <Badge variant="outline" className={`text-xs shrink-0 ${deptColor(entry.department)}`}>{entry.department}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${scoreBarColor(entry.score)}`} style={{ width: `${entry.score}%` }} />
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <span className="font-bold text-sm">{entry.score}</span>
        <Badge variant="outline" className={`text-xs ${categoryStyle(entry.category)}`}>{entry.category}</Badge>
      </div>
    </div>
  );
}

function ManagerRow({ entry }: { entry: ManagerEntry }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/50 transition-colors border border-border/50 bg-card/80">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center text-sm font-bold text-indigo-500 shrink-0">
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold truncate">{entry.name}</p>
          <Badge variant="outline" className={`text-xs shrink-0 ${deptColor(entry.department)}`}>{entry.department}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{entry.email}</p>
      </div>
      <div className="text-right shrink-0 flex gap-4">
        <div className="text-center">
          <span className="text-xs text-muted-foreground block leading-tight">Team Size</span>
          <span className="font-bold text-base">{entry.employee_count}</span>
        </div>
        <div className="text-center">
          <span className="text-xs text-muted-foreground block leading-tight">Active Tasks</span>
          <span className="font-bold text-base text-blue-500">{entry.active_tasks}</span>
        </div>
        <div className="text-center">
          <span className="text-xs text-muted-foreground block leading-tight">Completed</span>
          <span className="font-bold text-base text-green-500">{entry.completed_tasks}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [managers, setManagers] = useState<ManagerEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = () => Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/leaderboard'),
      api.get('/admin/managers_overview')
    ])
      .then(([s, lb, mgrs]) => {
        setStats(s.data);
        setLeaderboard(lb.data.leaderboard || []);
        setManagers(mgrs.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchAll();

    // Auto-refresh: poll every 60s and also refresh on tab focus
    const interval = setInterval(fetchAll, 60000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchAll(); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const departments = ['All', ...Array.from(new Set(leaderboard.map(e => e.department)))];

  const filtered = leaderboard.filter(e =>
    (filterDept === 'All' || e.department === filterDept) &&
    (search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()))
  );

  const top3 = filtered.filter(e => e.rank <= 3 && (filterDept === 'All' || e.department === filterDept) && filtered.includes(e)).slice(0, 3);
  const rest = filtered.filter(e => !top3.includes(e));

  if (loading) return <div className="flex items-center justify-center h-60 text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Organization Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Comprehensive metrics, department health, and company-wide performance.</p>
      </motion.div>

      {/* Modern KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Employees', value: stats?.total_users || 0, icon: Users, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30', iconColor: 'text-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
          { title: 'Avg Company Score', value: `${(stats?.avg_company_score || 0).toFixed(1)}`, icon: Activity, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30', iconColor: 'text-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
          { title: 'Total Managers', value: stats?.total_managers || 0, icon: Trophy, color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30', iconColor: 'text-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
          { title: 'Departments', value: stats?.total_departments || 0, icon: Database, color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30', iconColor: 'text-orange-500', textColor: 'text-orange-600 dark:text-orange-400' },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${kpi.color} p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                <p className={`text-3xl font-black mt-2 ${kpi.textColor}`}>{kpi.value}</p>
              </div>
              <div className={`kpi-icon bg-white/40 dark:bg-black/20 ${kpi.iconColor}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

        {/* ── Organisation-Wide Employee Leaderboard ─────────────────── */}
      <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-xl bg-yellow-500/15 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-yellow-500" />
            </div>
            Employee Leaderboard
          </CardTitle>
          <CardDescription className="text-xs">All employees across all departments, ranked by AI performance score.</CardDescription>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search employee name or department…" className="pl-9 h-9 rounded-xl text-sm"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              className="h-9 rounded-xl border border-input bg-background px-3 py-1.5 text-sm max-w-[180px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={filterDept} onChange={e => setFilterDept(e.target.value)}
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No employees match your search.</p>
          ) : (
            <>
              {/* Top 3 Medal Cards */}
              {top3.length > 0 && (
                <div className={`grid gap-4 ${top3.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : top3.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {top3.map(e => <MedalCard key={e.id} entry={e} />)}
                </div>
              )}

              {/* Rest of the list */}
              {rest.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">All Other Employees</p>
                  <div className="space-y-1 bg-muted/20 rounded-xl p-2">
                    {rest.map(e => <RankRow key={e.id} entry={e} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
