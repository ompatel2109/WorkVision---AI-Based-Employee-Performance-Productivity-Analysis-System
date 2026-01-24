import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  score: number;
  tasksCompleted: number;
  workingHours: number;
}

interface ProductivityChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'area';
  title?: string;
}

export function ProductivityChart({ data, type = 'area', title = 'Productivity Trend' }: ProductivityChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="dashboard-section"
    >
      <h3 className="mb-6 text-lg font-semibold text-foreground">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(175, 60%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(175, 60%, 40%)" stopOpacity={0} />
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'hsl(215, 35%, 15%)', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(175, 60%, 40%)"
                strokeWidth={2}
                fill="url(#colorScore)"
                name="Productivity Score"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 45%)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(210, 20%, 88%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(175, 60%, 40%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(175, 60%, 40%)', strokeWidth: 2 }}
                name="Productivity Score"
              />
              <Line
                type="monotone"
                dataKey="tasksCompleted"
                stroke="hsl(210, 70%, 25%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(210, 70%, 25%)', strokeWidth: 2 }}
                name="Tasks Completed"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
