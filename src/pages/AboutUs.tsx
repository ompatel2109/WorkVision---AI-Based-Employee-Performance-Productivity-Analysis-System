import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from "@/contexts/AuthContext";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Code2,
  BrainCircuit,
  Rocket,
  Lightbulb,
  Github,
  Linkedin,
  Mail,
  ArrowRight
} from 'lucide-react';
import logoImg from '@/assets/logo.png';

const developers = [
  {
    name: 'Om Patel',
    role: 'Lead Full-Stack Engineeer & AI Integrator',
    image: '/images/om.jpg',
    bio: 'Architected the robust Scikit-Learn backend and designed the seamless data flow. Passionate about machine learning pipelines and scalable systems.',
    socials: { github: '#', linkedin: '#', email: '#' },
    color: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-[0_0_40px_rgba(99,102,241,0.3)]'
  },
  {
    name: 'Vishvam Patel',
    role: 'Frontend Architect & UI/UX Visionary',
    image: '/images/vishvam.jpg',
    bio: 'Engineered the highly dynamic, premium react frontend. Obsessed with micro-interactions, framer-motion animations, and building pixel-perfect SaaS experiences.',
    socials: { github: '#', linkedin: '#', email: '#' },
    color: 'from-fuchsia-500 to-pink-500',
    shadow: 'shadow-[0_0_40px_rgba(236,72,153,0.3)]'
  }
];

const timeline = [
  {
    phase: 'Phase 1: Ideation',
    title: 'The Blueprint',
    description: 'Conceived the idea of a unified platform that bridges traditional task management with predictive AI to eliminate manual performance reviews.',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30'
  },
  {
    phase: 'Phase 2: Architecture',
    title: 'System Foundations',
    description: 'Designed the complex role-based routing (Admin, Manager, Employee), database schemas, and secured API endpoints for robust data handling.',
    icon: Code2,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/30'
  },
  {
    phase: 'Phase 3: Intelligence',
    title: 'AI Integration',
    description: 'Fed thousands of synthetic data points into Python-based Scikit-Learn models to train the initial iteration of our core productivity scoring engine.',
    icon: BrainCircuit,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10 border-fuchsia-500/30'
  },
  {
    phase: 'Phase 4: Polish',
    title: 'The Premium Experience',
    description: 'Overhauled the user interface with floating split-cards, interactive bento grids, and dynamic dashboard mockups to deliver a world-class SaaS feel.',
    icon: Rocket,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30'
  }
];

const AboutNavbar = ({ user }: { user: any }) => (
  <nav className="absolute top-0 w-full z-50 border-b border-white/5 bg-transparent backdrop-blur-md">
    <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
      <Link to="/" className="flex items-center gap-4 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a0f1e] border border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] relative transition-all group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <img src={logoImg} alt="WorkVision" className="h-8 w-8 object-contain relative z-10" />
        </div>
        <span className="font-extrabold text-2xl text-white tracking-tight">WorkVision</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="hidden sm:block text-sm font-semibold tracking-wide text-slate-300 hover:text-white transition-colors">
          Return Home
        </Link>
        {user ? (
          <Link to={user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/employee'}>
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl backdrop-blur-md transition-all h-11 px-6 font-semibold">
              Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl backdrop-blur-md transition-all h-11 px-6 font-semibold">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  </nav>
);

export default function AboutUs() {
  const { user } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-[#030712] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      <AboutNavbar user={user} />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 overflow-hidden text-center">
        <div className="absolute inset-0 z-0 bg-[#0a0f1e] pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[20%] w-[40vw] h-[40vw] bg-fuchsia-600/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
              The Minds Behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 animate-text-shimmer bg-[200%_auto]">
                WorkVision
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto">
              We are a duo of passionate developers dedicated to bridging the gap between human intuition and artificial intelligence in the modern workplace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- DEVELOPERS SECTION --- */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {developers.map((dev, idx) => (
              <motion.div
                key={dev.name}
                initial={{ opacity: 0, y: 50, rotateY: idx === 0 ? -10 : 10 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative perspective-[1000px] group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dev.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-700 rounded-[3rem]`} />
                
                <div className={`p-8 sm:p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl ${dev.shadow} relative overflow-hidden transition-transform duration-500 hover:-translate-y-2 h-full flex flex-col`}>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
                    {/* Portrait Image */}
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${dev.color} rounded-full blur-md opacity-50`} />
                      <img 
                        src={dev.image} 
                        alt={dev.name} 
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#0a0f1e] relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="text-center sm:text-left pt-2">
                      <h3 className="text-3xl font-extrabold mb-2">{dev.name}</h3>
                      <p className={`text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r ${dev.color} mb-4`}>
                        {dev.role}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <a href={dev.socials.github} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                        <a href={dev.socials.linkedin} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a href={dev.socials.email} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center">
                    <p className="text-slate-300 text-lg leading-relaxed text-center sm:text-left italic">
                      "{dev.bio}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DEVELOPMENT JOURNEY TIMELINE --- */}
      <section className="py-32 relative bg-[#0a0f1e] border-t border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-extrabold mb-4">Journey of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Development</span></h2>
            <p className="text-slate-400 text-lg">How we built the next-generation performance system.</p>
          </motion.div>

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Center Line connecting the dots */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-500/20 via-fuchsia-500/20 to-transparent md:-translate-x-1/2 rounded-full" />

            {timeline.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center justify-between mb-16 last:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  
                  <div className="hidden md:block w-[45%]" />

                  {/* Marker */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-[#030712] border-4 border-[#0a0f1e] z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400 animate-pulse" />
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-[45%] pl-20 md:pl-0 ${isEven ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                    <div className={`p-6 rounded-2xl border backdrop-blur-md ${item.bg} hover:bg-white/[0.05] transition-colors overflow-hidden relative group`}>
                       <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500/0 via-white/20 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className={`inline-flex items-center gap-2 mb-3 ${item.color}`}>
                         <item.icon className="w-5 h-5" />
                         <span className="text-sm font-bold tracking-widest uppercase">{item.phase}</span>
                       </div>
                       
                       <h4 className="text-2xl font-bold text-white mb-2">{item.title}</h4>
                       <p className="text-slate-400 leading-relaxed text-[15px]">
                         {item.description}
                       </p>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-12 rounded-[2rem] bg-gradient-to-br from-indigo-900/20 to-fuchsia-900/20 border border-white/10 backdrop-blur-md max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Experience the Result?</h2>
            <Link to="/register">
              <Button className="h-14 px-8 bg-white text-indigo-950 hover:bg-slate-200 font-bold rounded-xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Access WorkVision <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

