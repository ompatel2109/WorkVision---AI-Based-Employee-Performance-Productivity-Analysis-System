export type UserRole = 'employee' | 'admin' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatar?: string;
  createdAt: Date;
}

export interface WorkEntry {
  id: string;
  userId: string;
  date: Date;
  tasksAssigned: number;
  tasksCompleted: number;
  workingHours: number;
  deadlinesMet: number;
  delayCount: number;
  taskComplexity: 'low' | 'medium' | 'high';
  notes?: string;
  productivityScore?: number;
  createdAt: Date;
}

export interface PerformanceMetrics {
  overallScore: number;
  taskCompletionRate: number;
  deadlineAdherence: number;
  averageWorkingHours: number;
  efficiencyIndex: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface EmployeePerformance {
  employee: User;
  metrics: PerformanceMetrics;
  recentEntries: WorkEntry[];
}
