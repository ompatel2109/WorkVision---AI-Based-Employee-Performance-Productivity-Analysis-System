import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'AI-Powered Analytics',
    description: 'Advanced machine learning models analyze performance patterns and predict productivity scores.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Compare employee performance, identify top performers, and spot areas for improvement.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and monitor task completion rates, deadlines, and working hours with precision.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Trends',
    description: 'Visualize progress over time with interactive charts and detailed reports.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security ensures your performance data stays protected.',
  },
  {
    icon: Zap,
    title: 'Real-time Insights',
    description: 'Get instant feedback on work entries with AI-calculated productivity scores.',
  },
];

const benefits = [
  'Track tasks, deadlines, and working hours',
  'AI-powered productivity scoring',
  'Role-based access for employees and managers',
  'Interactive performance dashboards',
  'Employee comparison and reporting',
  'Trend analysis and predictions',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                AI-Powered Performance Tracking
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Transform Employee Performance with{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Intelligent Analytics
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground sm:text-xl"
            >
              Leverage machine learning to analyze productivity, track performance trends, 
              and empower your team to achieve their full potential.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Optimize Performance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our comprehensive suite of tools helps you understand, measure, and improve 
              employee productivity.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-xl border border-border/50 bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-y border-border/50 bg-muted/30 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Built for Modern IT Companies
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Whether you're a startup or enterprise, our platform scales with your needs 
                and provides actionable insights to boost team productivity.
              </p>
              
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link to="/register">
                  <Button variant="hero" size="lg">
                    Start Tracking Performance
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-xl border border-border/50 bg-card p-6 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  Live Dashboard Preview
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="font-medium">Overall Score</span>
                    <span className="text-2xl font-bold text-success">87</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">Tasks Completed</p>
                      <p className="mt-1 text-xl font-bold text-foreground">24/28</p>
                    </div>
                    <div className="rounded-lg bg-secondary/10 p-4">
                      <p className="text-sm text-muted-foreground">On-time Delivery</p>
                      <p className="mt-1 text-xl font-bold text-foreground">92%</p>
                    </div>
                  </div>
                  <div className="h-32 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
                    <p className="text-sm text-muted-foreground">Performance Trend</p>
                    <div className="mt-4 flex items-end justify-between gap-2">
                      {[40, 55, 45, 70, 65, 80, 87].map((height, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t bg-gradient-to-t from-primary to-secondary"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl"
            style={{ background: 'var(--gradient-hero)' }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,_hsla(175,60%,40%,0.3)_0%,_transparent_60%)]" />
            <div className="relative px-6 py-16 text-center sm:px-12 sm:py-24">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Transform Your Team's Performance?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
                Join companies using AI-powered analytics to unlock their team's potential.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/register">
                  <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">PerformanceAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PerformanceAI. AI-powered employee analytics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
