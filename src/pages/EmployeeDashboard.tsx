import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { useAuth } from '@/contexts/AuthContext';
import { generateMockWorkEntries, calculatePerformanceMetrics, getWeeklyChartData } from '@/data/mockData';
import { WorkEntry } from '@/types';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [metrics, setMetrics] = useState<ReturnType<typeof calculatePerformanceMetrics> | null>(null);

  useEffect(() => {
    if (user) {
      const mockEntries = generateMockWorkEntries(user.id, 30);
      setEntries(mockEntries);
      setMetrics(calculatePerformanceMetrics(mockEntries));
    }
  }, [user]);

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getWeeklyChartData(entries);

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
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here's an overview of your performance this month.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <Link to="/work-entry">
            <Button variant="hero">
              <Calendar className="h-4 w-4 mr-2" />
              Log Today's Work
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full History
            </Button>
          </Link>
        </motion.div>

        {/* Main Score & Stats Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Productivity Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="dashboard-section flex flex-col items-center justify-center lg:row-span-2"
          >
            <h3 className="mb-6 text-lg font-semibold text-foreground">Productivity Score</h3>
            <ScoreGauge score={metrics.overallScore} size="lg" />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Your overall productivity score based on tasks completed, deadlines met, and working hours.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <StatCard
              title="Task Completion Rate"
              value={`${metrics.taskCompletionRate}%`}
              icon={Target}
              trend={metrics.trend}
              trendValue={metrics.trendPercentage}
              variant="primary"
              delay={0.3}
            />
            <StatCard
              title="Deadline Adherence"
              value={`${metrics.deadlineAdherence}%`}
              icon={CheckCircle2}
              variant="success"
              delay={0.4}
            />
            <StatCard
              title="Avg Working Hours"
              value={`${metrics.averageWorkingHours}h`}
              subtitle="per day"
              icon={Clock}
              delay={0.5}
            />
            <StatCard
              title="Efficiency Index"
              value={metrics.efficiencyIndex}
              subtitle="tasks per hour"
              icon={AlertTriangle}
              variant="warning"
              delay={0.6}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6">
          <ProductivityChart data={chartData} title="Your Productivity This Week" />
        </div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 dashboard-section"
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Work Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Tasks</th>
                  <th className="pb-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Deadlines Met</th>
                  <th className="pb-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 5).map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50">
                    <td className="py-3 text-sm">
                      {entry.date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 text-sm">
                      {entry.tasksCompleted}/{entry.tasksAssigned}
                    </td>
                    <td className="py-3 text-sm">{entry.workingHours}h</td>
                    <td className="py-3 text-sm">{entry.deadlinesMet}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        (entry.productivityScore || 0) >= 80 
                          ? 'bg-success/10 text-success' 
                          : (entry.productivityScore || 0) >= 60 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {entry.productivityScore}
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
  );
}
