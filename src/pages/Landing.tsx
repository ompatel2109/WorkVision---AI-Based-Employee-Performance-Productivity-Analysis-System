import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Brain,
  Activity,
  UserPlus,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import logoImg from '@/assets/logo.png';

// Reusable Background Particle Component
const StarParticles = () => (
  <>
    {[...Array(40)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white relative z-0"
        style={{
          width: Math.random() * 3 + 1 + "px",
          height: Math.random() * 3 + 1 + "px",
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.4 + 0.1,
          boxShadow: "0 0 10px rgba(255,255,255,0.5)"
        }}
        animate={{
          y: [0, Math.random() * -150 - 50],
          x: [0, (Math.random() - 0.5) * 50],
          opacity: [0, Math.random() * 0.5 + 0.3, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: Math.random() * 15 + 10,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 20
        }}
      />
    ))}
  </>
);

const LandingNavbar = ({ user }: { user: any }) => (
  <nav className="absolute top-0 w-full z-50 border-b border-white/5 bg-transparent backdrop-blur-md">
    <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
      <Link to="/" className="flex items-center gap-4 group">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0f1e] border border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] relative transition-all group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <img src={logoImg} alt="WorkVision" className="h-9 w-9 object-contain relative z-10" />
        </div>
        <span className="font-extrabold text-3xl text-white tracking-tight">WorkVision</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to="/about" className="hidden sm:block text-sm font-semibold tracking-wide text-slate-300 hover:text-white transition-colors">
              About Us
            </Link>
            <Link to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/employee'}>
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl backdrop-blur-md transition-all h-11 px-6 font-semibold">
                Enter Dashboard
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link to="/about" className="hidden sm:block text-sm font-semibold tracking-wide text-slate-300 hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="/login" className="hidden sm:block text-sm font-semibold tracking-wide text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all hover:scale-105 h-11 px-6 font-bold">
                Get Started Free
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  </nav>
);

const journeySteps = [
  {
    icon: UserPlus,
    title: 'Initialize Identity',
    description: 'Create your professional profile and securely join your organization\'s dedicated workspace.',
    color: 'from-blue-500 to-indigo-500',
    blobColor: 'bg-blue-600/20'
  },
  {
    icon: Activity,
    title: 'Log Performance',
    description: 'Track daily tasks, active hours, and project milestones seamlessly with intuitive logging tools.',
    color: 'from-indigo-500 to-purple-500',
    blobColor: 'bg-indigo-600/20'
  },
  {
    icon: Brain,
    title: 'AI Intelligence',
    description: 'Our proprietary machine learning model analyzes your work patterns to generate a predictive productivity score.',
    color: 'from-purple-500 to-fuchsia-500',
    blobColor: 'bg-purple-600/20'
  },
  {
    icon: LayoutDashboard,
    title: 'Live Dashboard',
    description: 'Managers and employees access real-time leaderboards, performance trends, and dynamic insights.',
    color: 'from-fuchsia-500 to-pink-500',
    blobColor: 'bg-fuchsia-600/20'
  }
];

export default function Landing() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const [activeStat, setActiveStat] = useState(0);
  const stats = [
    { label: "Predictive Accuracy", value: "94.2%" },
    { label: "Productivity Increase", value: "+27%" },
    { label: "Data Points Analyzed", value: "2M+" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#030712] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* Custom Landing Navbar */}
      <LandingNavbar user={user} />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0f1e] pointer-events-none">
          {/* Massive slow-moving aurora blobs */}
          <motion.div
            animate={{ x: ["0%", "10%", "-10%", "0%"], y: ["0%", "15%", "-15%", "0%"], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen"
          />
          <motion.div
            animate={{ x: ["0%", "-15%", "10%", "0%"], y: ["0%", "-15%", "15%", "0%"], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/15 rounded-full blur-[120px] mix-blend-screen"
          />
          <StarParticles />
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ y: yParallax, opacity: opacityFade }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-md mb-8 cursor-pointer hover:bg-indigo-500/20 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Next-Generation Performance Ecosystem</span>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05]">
              Intelligence for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-text-shimmer bg-[200%_auto]">
                Modern Teams
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light mb-12">
              Elevate your workforce with AI-driven productivity insights. Map performance trajectories, visualize real-time data, and build a high-performance culture.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/employee'}>
                  <Button className="h-14 px-8 bg-white text-black hover:bg-slate-200 font-bold rounded-xl transition-all hover:scale-[1.02] text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] group relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full rotate-[30deg] bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-shimmer" />
                    Enter Dashboard <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] text-lg shadow-[0_0_40px_rgba(99,102,241,0.5)] group relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full rotate-[30deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                      Initialize Profile <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl backdrop-blur-md transition-all text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      Secure Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom fading edge */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030712] to-transparent z-10" />
      </section>

      {/* --- BENTO GRID ABOUT SECTION --- */}
      <section className="py-24 sm:py-32 relative bg-[#030712] overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">WorkVision?</span></h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">An enterprise-grade analysis suite engineered to seamlessly map, measure, and magnify human productivity.</p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1 (Large) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-2 row-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-indigo-500/30 blur-[100px] rounded-full" 
              />
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="h-14 w-14 text-indigo-400 mb-6 relative z-10 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              </motion.div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">AI-Driven Engine</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                  Beneath the sleek interface lies a powerful Scikit-Learn backend. It continuously analyzes employee workload, hours, and task complexity, yielding pinpoint accurate performance scores and productivity predictions in real-time.
                </p>
              </div>

              {/* Decorative floating lines */}
              <div className="absolute bottom-10 right-10 flex flex-col gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <motion.div animate={{ width: ["40px", "80px", "40px"] }} transition={{ duration: 3, repeat: Infinity }} className="h-1 bg-indigo-400 rounded-full" />
                <motion.div animate={{ width: ["80px", "40px", "80px"] }} transition={{ duration: 3, repeat: Infinity }} className="h-1 bg-indigo-400 rounded-full" />
                <motion.div animate={{ width: ["60px", "100px", "60px"] }} transition={{ duration: 3, repeat: Infinity }} className="h-1 bg-indigo-400 rounded-full" />
              </div>
            </motion.div>

            {/* Box 2 (Small) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-hidden relative group flex flex-col justify-center items-center text-center hover:bg-white/[0.04] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="relative z-10"
              >
                <Layers className="h-12 w-12 text-purple-400 mb-4 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Deep Granularity</h3>
              <p className="text-slate-400 text-sm relative z-10">Filter by diverse departments, isolate top performers, and export detailed PDFs with a single click.</p>
            </motion.div>

            {/* Box 3 (Small) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-hidden relative group flex flex-col justify-center items-center text-center hover:bg-white/[0.04] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Shield className="h-12 w-12 text-sky-400 mb-4 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Role Architecture</h3>
              <p className="text-slate-400 text-sm relative z-10">Seamless tri-level access separation. Employees log work, Managers track teams, Admins control the system.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- THE JOURNEY / STEPS SECTION --- */}
      <section className="py-24 sm:py-32 relative bg-[#0a0f1e] overflow-hidden border-t border-white/5">
        {/* Subtle background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">The System <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Journey</span></h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">Experience a fully integrated workflow from profile creation to predictive AI analytics.</p>
          </motion.div>

          {/* Journey Steps - Alternating timeline */}
          <div className="max-w-5xl mx-auto relative">
            {/* Center connecting line */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-indigo-500/0 via-indigo-500/50 to-pink-500/0 -translate-x-1/2" />

            {journeySteps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block w-[45%]" />

                  {/* Center Node */}
                  <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0a0f1e] border-2 border-[#0f172a] shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 md:mb-0 group">
                    <div className={`absolute inset-0 rounded-2xl ${step.blobColor} blur-md opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <step.icon className="h-6 w-6 text-white relative z-10" />
                  </div>

                  {/* Content Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`w-full md:w-[45%] ${isEven ? 'md:pl-10 text-center md:text-left' : 'md:pr-10 text-center md:text-right'}`}
                  >
                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                      <div className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} w-32 h-32 ${step.blobColor} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                      
                      <div className="flex items-center gap-4 mb-4 justify-center md:justify-start" style={{ flexDirection: isEven ? 'row' : 'row-reverse' }}>
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-xs font-bold text-white shadow-lg`}>
                          0{index + 1}
                        </span>
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-lg relative z-10">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- LIVE DASHBOARD PREVIEW SIMULATION --- */}
      <section className="py-24 sm:py-32 relative bg-[#030712] overflow-hidden border-t border-white/5">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgxdjFIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30 [mask-image:linear-gradient(to_left,white,transparent)]" />
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">Designed for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Peak Performance</span></h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Experience a fluid, responsive dashboard that adapts to your role. Whether monitoring department metrics or logging daily tasks, everything is presented with crystal clarity.
              </p>

              {/* Dynamic Stats Carousel */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-8 relative overflow-hidden min-h-[140px] flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full"
                  >
                    <p className="text-sm uppercase tracking-widest font-bold text-indigo-400 mb-2">{stats[activeStat].label}</p>
                    <p className="text-5xl font-extrabold text-white">{stats[activeStat].value}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Glowing Abstract Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring", stiffness: 50 }}
              className="relative perspective-[2000px]"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-3xl" />
              
              <div className="relative bg-[#020617] border border-white/10 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden [transform:rotateX(5deg)_rotateY(-10deg)] transition-transform duration-700 hover:[transform:rotateX(0deg)_rotateY(0deg)]">
                
                {/* Mockup Header */}
                <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-white/[0.01]">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500/80" />
                     <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                     <div className="w-3 h-3 rounded-full bg-green-500/80" />
                   </div>
                   <div className="w-1/3 h-6 bg-white/5 rounded-full ml-10" />
                </div>

                {/* Mockup Body */}
                <div className="p-8 grid grid-cols-2 gap-6 h-[400px]">
                  {/* Chart Mock */}
                  <div className="col-span-2 h-40 bg-white/[0.02] rounded-xl border border-white/5 flex items-end justify-between p-6 gap-2">
                    {[30, 50, 40, 70, 60, 90, 80, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: "spring" }}
                        className="w-full bg-gradient-to-t from-indigo-600/50 to-indigo-400 rounded-t-sm"
                      />
                    ))}
                  </div>
                  
                  {/* Smaller Widgets */}
                  <div className="bg-white/[0.02] rounded-xl border border-white/5 p-6 flex flex-col justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <Target className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="h-4 w-1/2 bg-white/20 rounded-full mb-2" />
                      <div className="h-3 w-1/3 bg-white/10 rounded-full" />
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-xl border border-white/5 p-6 flex flex-col justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                      <TrendingUp className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <div className="h-4 w-2/3 bg-white/20 rounded-full mb-2" />
                      <div className="h-3 w-1/4 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 sm:py-32 relative bg-[#0a0f1e] overflow-hidden text-center border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0f1e] to-[#0a0f1e]" />
        
        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-12 md:p-20 rounded-[3rem] border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl shadow-[0_0_80px_rgba(99,102,241,0.1)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10 text-white">
              Ready to Accelerate?
            </h2>
            <p className="text-xl text-indigo-200/80 mb-10 relative z-10 max-w-2xl mx-auto">
              Deploy WorkVision today and transform how your organization measures, predicts, and rewards performance.
            </p>
            
            <div className="relative z-10">
              <Link to="/register">
                <Button className="h-16 px-10 bg-white text-indigo-950 hover:bg-slate-200 font-extrabold rounded-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 text-xl group relative overflow-hidden">
                   <div className="absolute inset-0 -translate-x-full rotate-[30deg] bg-gradient-to-r from-transparent via-indigo-900/10 to-transparent group-hover:animate-shimmer" />
                   Deploy Framework
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-[#020617] py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0f1e] border border-white/10 shadow-lg relative overflow-hidden">
                <img src={logoImg} alt="WorkVision" className="h-9 w-9 object-contain relative z-10" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">WorkVision</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                About Us
              </Link>
            </div>

            <p className="text-sm font-medium text-slate-500">
              © 2026 WorkVision Intelligence. Formulated for high performance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

