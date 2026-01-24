import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { useAuth } from '@/contexts/AuthContext';
import { generateMockWorkEntries, getWeeklyChartData } from '@/data/mockData';
import { WorkEntry } from '@/types';
import { ArrowLeft, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      const mockEntries = generateMockWorkEntries(user.id, 60);
      setEntries(mockEntries);
    }
  }, [user]);

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true;
    const score = entry.productivityScore || 0;
    if (filter === 'excellent') return score >= 80;
    if (filter === 'good') return score >= 60 && score < 80;
    if (filter === 'average') return score < 60;
    return true;
  });

  const chartData = getWeeklyChartData(entries.slice(0, 14));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Performance History</h1>
              <p className="mt-2 text-muted-foreground">
                View your complete work history and performance trends.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="excellent">Excellent (80+)</SelectItem>
                  <SelectItem value="good">Good (60-79)</SelectItem>
                  <SelectItem value="average">Needs Work (&lt;60)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart */}
          <ProductivityChart 
            data={chartData} 
            type="line" 
            title="Performance Over Last 2 Weeks" 
          />

          {/* Entries Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 dashboard-section"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Work Entries ({filteredEntries.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Tasks</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Deadlines</th>
                    <th className="pb-3 font-medium">Delays</th>
                    <th className="pb-3 font-medium">Complexity</th>
                    <th className="pb-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => (
                    <motion.tr 
                      key={entry.id} 
                      className="border-b border-border/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {entry.date.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        <span className="font-medium text-foreground">{entry.tasksCompleted}</span>
                        <span className="text-muted-foreground">/{entry.tasksAssigned}</span>
                      </td>
                      <td className="py-3 text-sm">{entry.workingHours}h</td>
                      <td className="py-3 text-sm">{entry.deadlinesMet}</td>
                      <td className="py-3 text-sm">
                        {entry.delayCount > 0 ? (
                          <span className="text-warning">{entry.delayCount}</span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </td>
                      <td className="py-3 text-sm capitalize">{entry.taskComplexity}</td>
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
