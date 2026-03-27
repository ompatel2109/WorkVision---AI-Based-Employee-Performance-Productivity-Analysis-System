import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Loader2, ArrowLeft, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function RequestResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast({
        title: 'Reset link sent',
        description: 'Initializing recovery sequence. Please check your inbox.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to send recovery link.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicTexts = [
    "Verify your identity.",
    "Secure credential recovery.",
    "Regain network access."
  ];

  // Animation variants
  const formContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const formItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0f172a] text-white p-4 sm:p-8 md:p-12 overflow-hidden font-sans selection:bg-indigo-500/30 relative">

      {/* Dynamic Interactive Outer Background (Slightly Lighter Dark Theme) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0f172a] pointer-events-none">
        {/* Massive slow-moving aurora blobs */}
        <motion.div
          animate={{ x: ["0%", "15%", "-10%", "0%"], y: ["0%", "15%", "-15%", "0%"], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/15 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div
          animate={{ x: ["0%", "-15%", "10%", "0%"], y: ["0%", "-15%", "15%", "0%"], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{ x: ["0%", "10%", "-10%", "0%"], y: ["0%", "-10%", "15%", "0%"], scale: [1, 1.3, 0.8, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[140px] mix-blend-screen"
        />

        {/* Slow drifting star particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
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
      </div>

      {/* THE SMALLER FLOATING BLOCK (CARD) */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex w-full xl:max-w-[1100px] lg:max-w-[950px] h-full lg:h-[700px] max-h-[95vh] bg-[#030712] rounded-[2rem] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_rgba(99,102,241,0.2)] overflow-hidden relative z-10 flex-col lg:flex-row text-white"
      >
        {/* Subtle top glare on the card container */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-20" />

        {/* LEFT PANEL - PROFESSIONAL ISOMETRIC GRID */}
        <div className="hidden lg:flex w-[55%] relative flex-col items-center justify-center border-r border-white/5 overflow-hidden">

          {/* Deep background color */}
          <div className="absolute inset-0 bg-[#020617] z-0" />

          {/* Animated Isometric Grid */}
          <div className="absolute inset-0 perspective-[1000px] flex items-center justify-center z-10 opacity-40 mix-blend-screen pointer-events-none">
            <motion.div
              animate={{ translateY: [0, 64] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute w-[300%] h-[300%] [transform:rotateX(60deg)_rotateZ(45deg)]"
              style={{
                backgroundImage: "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
                backgroundPosition: "center center"
              }}
            />
            {/* Fade out edges */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020617_80%)]" />
          </div>

          {/* Floating Glowing Orbs to add depth */}
          <motion.div
            animate={{ y: [-20, 20, -20], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[30%] w-[250px] h-[250px] bg-indigo-600/30 rounded-full blur-[80px] z-10"
          />
          <motion.div
            animate={{ y: [20, -20, 20], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] left-[30%] w-[300px] h-[300px] bg-sky-600/20 rounded-full blur-[100px] z-10"
          />

          {/* Core Content */}
          <div className="relative z-20 w-full max-w-md px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0f1e] border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] relative group">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img src={logoImg} alt="WorkVision" className="h-8 w-8 object-contain relative z-10" />
                  </div>
                  <span className="text-3xl font-extrabold tracking-tight text-white">WorkVision</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight mb-5 leading-[1.1]">
                Account <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-400 animate-text-shimmer bg-[200%_auto]">
                  Recovery
                </span>
              </h1>

              <div className="h-12 border-l-2 border-indigo-500/50 pl-4 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeStep}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    onAnimationComplete={() => setTimeout(() => setActiveStep((prev) => (prev + 1) % dynamicTexts.length), 4000)}
                    className="text-base text-slate-400 font-medium"
                  >
                    {dynamicTexts[activeStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Simulated abstract dashboard UI cards */}
            <div className="space-y-4 w-full">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm flex items-center gap-4 w-5/6 shadow-2xl"
              >
                <div className="min-w-[40px] h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-white text-sm font-bold tracking-wide mb-1">Step 1: Email Verification</span>
                  <span className="text-slate-400 text-xs">A secure recovery token will be sent to your inbox.</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - CLEAN FORM */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 relative z-10 bg-[#030712] overflow-y-auto">

          {/* Subtle right-side ambient light inside card */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full max-w-sm relative z-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Link to="/login" className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-slate-500 hover:text-white transition-colors mb-10 group">
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                Return to Login
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
              <div className="lg:hidden flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0f1e] border border-white/10 shadow-lg">
                      <img src={logoImg} alt="WorkVision" className="h-6 w-6 object-contain" />
                  </div>
                  <span className="text-2xl font-extrabold text-white">WorkVision</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">Reset Password</h2>
              <p className="text-slate-400 text-sm">Initiate secure credential recovery to regain access to your workspace.</p>
            </motion.div>

            {!isSubmitted ? (
                <motion.form
                variants={formContainer}
                initial="hidden"
                animate="show"
                onSubmit={handleSubmit}
                className="space-y-6"
                >
                <motion.div variants={formItem} className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Registered Email Address</Label>
                    <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-[#0a0f1e] border-white/5 text-white placeholder:text-slate-600 focus:bg-[#0f1526] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all rounded-xl pl-11 pr-10 shadow-inner"
                    />
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-indigo-500 rounded-tl-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-indigo-500 rounded-br-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                </motion.div>

                <motion.div variants={formItem} className="pt-2">
                    <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-white text-black hover:bg-slate-200 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center gap-2 overflow-hidden relative shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                    <div className="absolute inset-0 -translate-x-full rotate-[30deg] bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-shimmer" />

                    {isLoading ? (
                        <span className="flex items-center gap-2 relative z-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Transmitting...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 relative z-10">
                        Send Recovery Link
                        </span>
                    )}
                    </Button>
                </motion.div>
                </motion.form>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center py-4"
                >
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <CheckCircle2 className="h-8 w-8 text-indigo-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight text-white">Transmission Successful</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            If the address exists in our database, recovery instructions have been sent to <br/><span className="font-semibold text-white">{email}</span>
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 mt-4 h-11 transition-all"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Use a different address
                    </Button>
                </motion.div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}

