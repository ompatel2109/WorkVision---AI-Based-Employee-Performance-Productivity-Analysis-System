import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award,
  BarChart3,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getEmployeePerformanceData, getDepartmentStats } from '@/data/mockData';
import { EmployeePerformance } from '@/types';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';

const COLORS = ['hsl(210, 70%, 25%)', 'hsl(175, 60%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)'];

export default function AdminDashboard() {
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [departmentStats, setDepartmentStats] = useState<{ name: string; avgScore: number; employees: number }[]>([]);

  useEffect(() => {
    setPerformanceData(getEmployeePerformanceData());
    setDepartmentStats(getDepartmentStats());
  }, []);

  const avgScore = performanceData.length > 0 
    ? Math.round(performanceData.reduce((sum, p) => sum + p.metrics.overallScore, 0) / performanceData.length)
    : 0;

  const topPerformers = [...performanceData]
    .sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
    .slice(0, 3);

  const employeeComparisonData = performanceData.map(p => ({
    name: p.employee.name.split(' ')[0],
    score: p.metrics.overallScore,
    completion: p.metrics.taskCompletionRate,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of team performance and productivity analytics.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={performanceData.length}
            icon={Users}
            variant="primary"
            delay={0.1}
          />
          <StatCard
            title="Average Score"
            value={avgScore}
            icon={Target}
            trend="up"
            trendValue={5}
            variant="success"
            delay={0.2}
          />
          <StatCard
            title="Top Performer Score"
            value={topPerformers[0]?.metrics.overallScore || 0}
            icon={Award}
            delay={0.3}
          />
          <StatCard
            title="Avg Working Hours"
            value="7.8h"
            icon={Clock}
            delay={0.4}
          />
        </div>

        {/* Charts Row */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Employee Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="dashboard-section"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">Employee Performance Comparison</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    dataKey="score" 
                    fill="hsl(210, 70%, 25%)" 
                    radius={[4, 4, 0, 0]}
                    name="Productivity Score"
                  />
                  <Bar 
                    dataKey="completion" 
                    fill="hsl(175, 60%, 40%)" 
                    radius={[4, 4, 0, 0]}
                    name="Task Completion %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Department Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="dashboard-section"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">Performance by Department</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="avgScore"
                    nameKey="name"
                    label={({ name, avgScore }) => `${name}: ${avgScore}`}
                    labelLine={false}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} avg score`, 'Performance']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Top Performers & Employee List */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="dashboard-section"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Top Performers
            </h3>
            <div className="space-y-4">
              {topPerformers.map((perf, index) => (
                <div key={perf.employee.id} className="flex items-center gap-4 rounded-lg bg-muted/30 p-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-warning/20 text-warning' : 
                    index === 1 ? 'bg-muted text-muted-foreground' : 
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{perf.employee.name}</p>
                    <p className="text-sm text-muted-foreground">{perf.employee.position}</p>
                  </div>
                  <ScoreGauge score={perf.metrics.overallScore} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* All Employees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="dashboard-section lg:col-span-2"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">All Employees</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium">Completion</th>
                    <th className="pb-3 font-medium">Deadlines</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((perf) => (
                    <tr key={perf.employee.id} className="border-b border-border/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-foreground">{perf.employee.name}</p>
                          <p className="text-xs text-muted-foreground">{perf.employee.position}</p>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{perf.employee.department}</td>
                      <td className="py-3 text-sm">{perf.metrics.taskCompletionRate}%</td>
                      <td className="py-3 text-sm">{perf.metrics.deadlineAdherence}%</td>
                      <td className="py-3">
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
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          perf.metrics.trend === 'up' ? 'text-success' : 
                          perf.metrics.trend === 'down' ? 'text-destructive' : 
                          'text-muted-foreground'
                        }`}>
                          {perf.metrics.trend === 'up' ? '↑' : perf.metrics.trend === 'down' ? '↓' : '→'}
                          {perf.metrics.trendPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
