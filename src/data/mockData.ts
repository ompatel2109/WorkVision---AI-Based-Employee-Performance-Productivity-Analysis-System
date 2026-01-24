import { User, WorkEntry, EmployeePerformance } from '@/types';

export const mockEmployees: User[] = [
  {
    id: '2',
    email: 'john.smith@company.com',
    name: 'John Smith',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    createdAt: new Date('2023-03-20'),
  },
  {
    id: '3',
    email: 'emily.chen@company.com',
    name: 'Emily Chen',
    role: 'employee',
    department: 'Engineering',
    position: 'Frontend Developer',
    createdAt: new Date('2023-05-10'),
  },
  {
    id: '4',
    email: 'michael.brown@company.com',
    name: 'Michael Brown',
    role: 'employee',
    department: 'Design',
    position: 'UI/UX Designer',
    createdAt: new Date('2023-02-15'),
  },
  {
    id: '5',
    email: 'sarah.wilson@company.com',
    name: 'Sarah Wilson',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Specialist',
    createdAt: new Date('2023-04-01'),
  },
  {
    id: '6',
    email: 'david.lee@company.com',
    name: 'David Lee',
    role: 'employee',
    department: 'Engineering',
    position: 'Backend Developer',
    createdAt: new Date('2023-06-15'),
  },
];

export const generateMockWorkEntries = (userId: string, count: number = 30): WorkEntry[] => {
  const entries: WorkEntry[] = [];
  const complexities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const tasksAssigned = Math.floor(Math.random() * 8) + 3;
    const tasksCompleted = Math.floor(Math.random() * tasksAssigned) + 1;
    const deadlinesMet = Math.floor(Math.random() * tasksCompleted) + 1;
    const workingHours = Math.floor(Math.random() * 4) + 6;
    const delayCount = Math.max(0, tasksAssigned - deadlinesMet - Math.floor(Math.random() * 2));
    
    const completionRate = tasksCompleted / tasksAssigned;
    const deadlineRate = deadlinesMet / tasksCompleted;
    const hoursEfficiency = Math.min(1, workingHours / 8);
    const productivityScore = Math.round((completionRate * 40 + deadlineRate * 40 + hoursEfficiency * 20));
    
    entries.push({
      id: `entry-${userId}-${i}`,
      userId,
      date,
      tasksAssigned,
      tasksCompleted,
      workingHours,
      deadlinesMet,
      delayCount,
      taskComplexity: complexities[Math.floor(Math.random() * 3)],
      productivityScore,
      createdAt: date,
    });
  }
  
  return entries;
};

export const calculatePerformanceMetrics = (entries: WorkEntry[]): {
  overallScore: number;
  taskCompletionRate: number;
  deadlineAdherence: number;
  averageWorkingHours: number;
  efficiencyIndex: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
} => {
  if (entries.length === 0) {
    return {
      overallScore: 0,
      taskCompletionRate: 0,
      deadlineAdherence: 0,
      averageWorkingHours: 0,
      efficiencyIndex: 0,
      trend: 'stable' as const,
      trendPercentage: 0,
    };
  }

  const totalAssigned = entries.reduce((sum, e) => sum + e.tasksAssigned, 0);
  const totalCompleted = entries.reduce((sum, e) => sum + e.tasksCompleted, 0);
  const totalDeadlinesMet = entries.reduce((sum, e) => sum + e.deadlinesMet, 0);
  const totalHours = entries.reduce((sum, e) => sum + e.workingHours, 0);
  const avgScore = entries.reduce((sum, e) => sum + (e.productivityScore || 0), 0) / entries.length;

  // Calculate trend (compare last 7 days to previous 7 days)
  const recent = entries.slice(0, 7);
  const previous = entries.slice(7, 14);
  
  const recentAvg = recent.reduce((sum, e) => sum + (e.productivityScore || 0), 0) / recent.length || 0;
  const previousAvg = previous.reduce((sum, e) => sum + (e.productivityScore || 0), 0) / previous.length || recentAvg;
  
  const trendPercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
  const trend: 'up' | 'down' | 'stable' = trendPercentage > 2 ? 'up' : trendPercentage < -2 ? 'down' : 'stable';

  return {
    overallScore: Math.round(avgScore),
    taskCompletionRate: Math.round((totalCompleted / totalAssigned) * 100),
    deadlineAdherence: Math.round((totalDeadlinesMet / totalCompleted) * 100),
    averageWorkingHours: Math.round((totalHours / entries.length) * 10) / 10,
    efficiencyIndex: Math.round((totalCompleted / totalHours) * 100) / 10,
    trend,
    trendPercentage: Math.round(Math.abs(trendPercentage)),
  };
};

export const getEmployeePerformanceData = (): EmployeePerformance[] => {
  return mockEmployees.map(employee => {
    const entries = generateMockWorkEntries(employee.id, 30);
    return {
      employee,
      metrics: calculatePerformanceMetrics(entries),
      recentEntries: entries.slice(0, 7),
    };
  });
};

export const getWeeklyChartData = (entries: WorkEntry[]) => {
  const last7Days = entries.slice(0, 7).reverse();
  return last7Days.map(entry => ({
    date: entry.date.toLocaleDateString('en-US', { weekday: 'short' }),
    score: entry.productivityScore || 0,
    tasksCompleted: entry.tasksCompleted,
    workingHours: entry.workingHours,
  }));
};

export const getDepartmentStats = () => {
  const data = getEmployeePerformanceData();
  const departments: Record<string, { count: number; totalScore: number }> = {};
  
  data.forEach(({ employee, metrics }) => {
    const dept = employee.department || 'Other';
    if (!departments[dept]) {
      departments[dept] = { count: 0, totalScore: 0 };
    }
    departments[dept].count++;
    departments[dept].totalScore += metrics.overallScore;
  });

  return Object.entries(departments).map(([name, { count, totalScore }]) => ({
    name,
    avgScore: Math.round(totalScore / count),
    employees: count,
  }));
};
