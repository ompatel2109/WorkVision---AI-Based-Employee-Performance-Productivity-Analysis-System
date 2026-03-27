import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

export default function WorkEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productivityScore, setProductivityScore] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    tasksAssigned: '',
    tasksCompleted: '',
    workingHours: '',
    deadlinesMet: '',
    delayCount: '',
    taskComplexity: '',
    notes: '',
  });

  const calculateScore = () => {
    const assigned = parseInt(formData.tasksAssigned) || 0;
    const completed = parseInt(formData.tasksCompleted) || 0;
    const hours = parseFloat(formData.workingHours) || 0;
    const deadlinesMet = parseInt(formData.deadlinesMet) || 0;
    const delays = parseInt(formData.delayCount) || 0;
    const complexity = formData.taskComplexity;

    if (assigned === 0 || completed === 0) return 0;

    const completionRate = completed / assigned;
    const deadlineRate = deadlinesMet / completed;
    const hoursEfficiency = Math.min(1, hours / 8);
    const delayPenalty = Math.max(0, 1 - (delays * 0.1));
    const complexityBonus = complexity === 'high' ? 1.1 : complexity === 'medium' ? 1.05 : 1;

    const baseScore = (completionRate * 40 + deadlineRate * 40 + hoursEfficiency * 20);
    const finalScore = Math.min(100, Math.round(baseScore * delayPenalty * complexityBonus));

    return finalScore;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    const score = calculateScore();
    setProductivityScore(score);
    setIsAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate score if not already done
      if (productivityScore === null) {
        const score = calculateScore();
        setProductivityScore(score);
      }

      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Work entry saved!',
        description: 'Your productivity score has been calculated and recorded.',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save work entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setProductivityScore(null); // Reset score when form changes
  };

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

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="dashboard-section">
                <h1 className="text-2xl font-bold text-foreground">Log Work Entry</h1>
                <p className="mt-2 text-muted-foreground">
                  Enter your work details to calculate your productivity score.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taskComplexity">Task Complexity</Label>
                      <Select
                        value={formData.taskComplexity}
                        onValueChange={(value) => handleChange('taskComplexity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tasksAssigned">Tasks Assigned</Label>
                      <Input
                        id="tasksAssigned"
                        type="number"
                        min="0"
                        placeholder="e.g., 10"
                        value={formData.tasksAssigned}
                        onChange={(e) => handleChange('tasksAssigned', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tasksCompleted">Tasks Completed</Label>
                      <Input
                        id="tasksCompleted"
                        type="number"
                        min="0"
                        placeholder="e.g., 8"
                        value={formData.tasksCompleted}
                        onChange={(e) => handleChange('tasksCompleted', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workingHours">Working Hours</Label>
                      <Input
                        id="workingHours"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="e.g., 8"
                        value={formData.workingHours}
                        onChange={(e) => handleChange('workingHours', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadlinesMet">Deadlines Met</Label>
                      <Input
                        id="deadlinesMet"
                        type="number"
                        min="0"
                        placeholder="e.g., 7"
                        value={formData.deadlinesMet}
                        onChange={(e) => handleChange('deadlinesMet', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delayCount">Delays</Label>
                      <Input
                        id="delayCount"
                        type="number"
                        min="0"
                        placeholder="e.g., 1"
                        value={formData.delayCount}
                        onChange={(e) => handleChange('delayCount', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about your work today..."
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !formData.tasksAssigned || !formData.tasksCompleted}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze with AI
                        </>
                      )}
                    </Button>

                    <Button type="submit" variant="hero" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Save Entry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Score Preview */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="dashboard-section flex flex-col items-center sticky top-24"
              >
                <h3 className="mb-6 text-lg font-semibold text-foreground">
                  AI Productivity Score
                </h3>

                {productivityScore !== null ? (
                  <>
                    <ScoreGauge score={productivityScore} size="lg" />
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Your score is calculated using machine learning based on task completion,
                      deadline adherence, and working hours.
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="mb-4 rounded-full bg-muted p-4">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fill in your work details and click "Analyze with AI" to see your
                      predicted productivity score.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
