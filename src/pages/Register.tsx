import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BarChart3, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(email, password, name, role);
      toast({
        title: 'Account created!',
        description: 'Welcome to PerformanceAI.',
      });
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Decorative */}
      <div 
        className="hidden lg:block lg:w-1/2"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="flex h-full flex-col items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center"
          >
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
              <BarChart3 className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground">
              Join the Future of Performance Management
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-primary-foreground/80">
              Start tracking your productivity and get AI-powered insights 
              to help you perform at your best.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">PerformanceAI</span>
            </div>

            <h1 className="mt-8 text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Start tracking your performance today.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="employee"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                      role === 'employee'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="employee" id="employee" className="sr-only" />
                    <span className="text-2xl mb-2">👤</span>
                    <span className="font-medium text-foreground">Employee</span>
                    <span className="text-xs text-muted-foreground">Track my work</span>
                  </Label>
                  <Label
                    htmlFor="admin"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                      role === 'admin'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="admin" id="admin" className="sr-only" />
                    <span className="text-2xl mb-2">👔</span>
                    <span className="font-medium text-foreground">Manager</span>
                    <span className="text-xs text-muted-foreground">Manage team</span>
                  </Label>
                </RadioGroup>
              </div>

              <Button type="submit" variant="hero" className="w-full h-11" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
