"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion"
import { Shield, Sparkles, BookOpen, Map, FileKey, Users, Hexagon, Crosshair, Target, Zap, User, Crown, Building } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { EpicBossBattle, TiltCard, ScrollExpBar, MouseGlow, CustomCursor, MarqueeTicker, GeometricParticles } from "@/components/gamified-ui"

// ==========================================
// SPOTLIGHT CARD FOR PRICING
// ==========================================
function SpotlightCard({ children, className, delay = 0, isPro = false }: { children: React.ReactNode, className?: string, delay?: number, isPro?: boolean }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: isPro ? 0.9 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay, type: "spring", bounce: 0.4 }}
      onMouseMove={handleMouseMove}
      className={`relative group overflow-hidden transition-all duration-300 hover:-translate-y-2 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-30 mix-blend-screen"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${isPro ? 'rgba(255, 70, 85, 0.15)' : 'rgba(255, 255, 255, 0.07)'},
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </motion.div>
  )
}

export default function RPGPage() {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"])
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div 
      className="min-h-screen text-foreground bg-background overflow-hidden cursor-none selection:bg-primary/30" 
      ref={containerRef}
    >
      {mounted && <CustomCursor />}
      <ScrollExpBar progress={smoothProgress} />
      <MouseGlow />
      <GeometricParticles />
      
      {/* CRT SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 mix-blend-overlay">
        <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* VERTICAL SYSTEM TEXT */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-primary/20 font-teko text-2xl tracking-[0.5em] pointer-events-none z-0 whitespace-nowrap mix-blend-exclusion">
        SYS.REQ. // ACTIO_PROTOCOL // V.1.0.0
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 rotate-90 origin-center text-accent/20 font-teko text-2xl tracking-[0.5em] pointer-events-none z-0 whitespace-nowrap mix-blend-exclusion">
        SECURE_CONNECTION_ESTABLISHED
      </div>

      {/* TACTICAL NAVBAR */}
      <nav className="fixed top-0 w-full z-40 px-6 sm:px-12 py-6 flex flex-col md:flex-row justify-between items-center pointer-events-none gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary clip-angled-tl flex items-center justify-center pointer-events-auto shadow-[0_0_15px_rgba(255,70,85,0.5)]">
            <Hexagon className="w-5 h-5 text-background" />
          </div>
          <span className="font-teko font-bold text-4xl tracking-widest text-foreground mt-2 uppercase drop-shadow-md">TaskMesh</span>
        </div>
        
        <div className="flex items-center gap-8 pointer-events-auto bg-background/80 backdrop-blur-md px-6 py-2 clip-angled border border-muted/20">
          <Link href="#intel" className="font-teko text-xl tracking-widest text-foreground hover:text-primary transition-colors cursor-none">
             // INTEL
          </Link>
          <Link href="#arsenal" className="font-teko text-xl tracking-widest text-foreground hover:text-primary transition-colors cursor-none">
             // ARSENAL
          </Link>
          <Link href="#pricing" className="font-teko text-xl tracking-widest text-foreground hover:text-primary transition-colors cursor-none">
             // GUILDS
          </Link>
          <Link href="/login" className="font-teko text-xl tracking-widest text-foreground/80 hover:text-primary transition-colors cursor-none ml-4 flex items-center gap-2">
             <Shield className="w-4 h-4" /> LOGIN
          </Link>
          <div className="ml-4 pl-4 border-l border-muted/20">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ZONE 1: THE LOBBY (HERO) */}
      <section className="relative w-full min-h-[100vh] flex items-center justify-center pt-32 z-10 overflow-hidden">
        
        {/* 3D Grid Floor */}
        <motion.div 
          style={{ y: gridY }}
          className="absolute bottom-0 w-full h-[50vh] bg-gradient-to-t from-background to-transparent z-0 pointer-events-none mix-blend-overlay"
        >
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'bottom',
            opacity: 0.05
          }} />
        </motion.div>

        {/* Massive Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0 opacity-[0.03] pointer-events-none">
          <h1 className="font-teko text-[25vw] font-black text-foreground leading-none whitespace-nowrap tracking-tighter mix-blend-difference">
            OVERRIDE
          </h1>
        </div>
        
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto px-6"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-secondary text-primary font-teko text-2xl tracking-widest uppercase clip-angled mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-muted/20"
          >
            <Sparkles className="w-5 h-5" />
            <span>SYSTEM OVERRIDE // ACTIVE</span>
          </motion.div>
          
          <h1 className="font-teko text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter text-foreground mb-4 leading-[0.8] uppercase relative group">
            <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-foreground transition-all duration-500">Play Your</span> <br/>
            <span className="text-primary">Reality.</span>
          </h1>
          
          <p className="text-xl sm:text-3xl text-foreground/80 font-bold max-w-3xl mx-auto mb-12 leading-relaxed font-sans">
            A multiplayer productivity RPG. Conquer tutorial hell through gamified quests, cryptographic proof of action, and real-world civic bounties.
          </p>

          <Link href="/dashboard" className="group z-20">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden bg-primary text-background px-16 py-6 font-teko text-4xl font-bold uppercase tracking-widest transition-all hover:bg-foreground hover:text-background clip-angled-br shadow-[0_10px_30px_rgba(255,70,85,0.4)] cursor-none group/btn border-none"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite]" />
              <span className="relative z-10 flex items-center gap-4 mt-2">
                Deploy Now
                <div className="w-2 h-2 bg-current animate-pulse" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <MarqueeTicker text="WARNING: ENEMY DETECTED /// PREPARE FOR COMBAT ///" />

      {/* ZONE 2: THE EPIC BOSS BATTLE */}
      <section id="intel" className="relative z-10 py-32 px-6 bg-secondary overflow-hidden">
        <div className="absolute top-10 right-10 font-teko text-[20rem] font-black text-primary/[0.03] leading-none pointer-events-none mix-blend-exclusion">
          01
        </div>
        
        <div className="max-w-[90rem] mx-auto flex flex-col xl:flex-row items-center gap-8 relative z-10">
          <div className="flex-[0.8] space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[2px] bg-primary" />
              <span className="font-teko text-2xl text-primary tracking-widest">THE CORE LOOP</span>
            </div>
            <h2 className="font-teko text-6xl md:text-8xl font-black tracking-tight text-foreground uppercase leading-[0.8]">
              Defeat The <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 drop-shadow-md">Boss</span>
            </h2>
            <p className="text-xl text-foreground font-sans font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Every task is an enemy. Play the live interactive RPG demo. Manage your HP, defend against ultimates, and collect Mythic loot when the boss is defeated!
            </p>
          </div>

          <div className="flex-[2.5] w-full">
            <EpicBossBattle />
          </div>
        </div>
      </section>

      <MarqueeTicker text="INITIATING ARSENAL DEPLOYMENT /// WEAPONS HOT ///" reverse={true} />

      {/* ZONE 3: THE ARSENAL */}
      <section id="arsenal" className="relative z-10 py-32 px-6 bg-background">
        <div className="absolute top-10 left-10 font-teko text-[20rem] font-black text-foreground/[0.02] leading-none pointer-events-none mix-blend-exclusion">
          02
        </div>

        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="text-center">
            <h2 className="font-teko text-6xl sm:text-8xl md:text-[9rem] font-black tracking-tight text-foreground uppercase mb-4 leading-none">
              Your Arsenal
            </h2>
            <p className="text-2xl text-muted max-w-3xl mx-auto font-bold font-sans">
              Built on high-performance edge networks. Powered by Vision AI. Your tools for destroying procrastination.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <TiltCard index="01">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-20 h-20 bg-primary clip-angled-tl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,70,85,0.5)]">
                    <BookOpen className="w-10 h-10 text-white relative z-20" />
                  </div>
                  <h3 className="font-teko text-5xl font-bold mb-4 text-foreground uppercase tracking-wide">Escape Tutorial Hell</h3>
                  <p className="text-foreground/80 leading-relaxed text-xl font-sans font-medium">
                    Millions are trapped watching endless tutorials. TaskMesh converts passive URLs into interactive quest environments. You don't watch; you play, and the AI verifies your code.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard index="02">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-20 h-20 bg-foreground clip-angled-br flex items-center justify-center mb-8">
                    <FileKey className="w-10 h-10 text-background relative z-20" />
                  </div>
                  <h3 className="font-teko text-5xl font-bold mb-4 text-foreground uppercase tracking-wide">Proof of Action</h3>
                  <p className="text-foreground/80 leading-relaxed text-xl font-sans font-medium">
                    In a world of ChatGPT-written cover letters, employers need trust. Every completed quest here is cryptographically verified by Vision AI. An undeniable portfolio.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard index="03">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-20 h-20 bg-blue-500 clip-angled flex items-center justify-center mb-8">
                    <Target className="w-10 h-10 text-white relative z-20" />
                  </div>
                  <h3 className="font-teko text-5xl font-bold mb-4 text-foreground uppercase tracking-wide">Cryptographic Reputation</h3>
                  <p className="text-foreground/80 leading-relaxed text-xl font-sans font-medium">
                    Your skills aren't just a claim, they are mathematically proven on-chain. Build a permanent, verifiable history of your problem-solving capabilities.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard index="04">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-20 h-20 bg-purple-500 clip-angled-tl flex items-center justify-center mb-8">
                    <Zap className="w-10 h-10 text-white relative z-20" />
                  </div>
                  <h3 className="font-teko text-5xl font-bold mb-4 text-foreground uppercase tracking-wide">Real-World Bounties</h3>
                  <p className="text-foreground/80 leading-relaxed text-xl font-sans font-medium">
                    Complete quests and get paid. Companies post real-world civic bounties and open-source tasks directly to TaskMesh. Code, verify, and earn.
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ZONE 4: PRICING & GUILDS */}
      <section id="pricing" className="relative z-10 py-32 px-6 bg-secondary border-t border-muted/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-4 font-teko text-2xl text-primary tracking-widest uppercase">
              <Crosshair className="w-5 h-5" /> RECRUITMENT ACTIVE
            </div>
            <h2 className="font-teko text-6xl sm:text-8xl font-black tracking-tight text-foreground uppercase leading-[0.8]">
              Join A Guild
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
            {/* Free Tier */}
            <SpotlightCard 
              delay={0.1}
              className="bg-secondary border border-muted/20 clip-angled-br p-8 hover:border-primary/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,70,85,0)_0%,rgba(255,70,85,0.05)_50%,rgba(255,70,85,0)_100%)] h-[200%] w-full -translate-y-full group-hover:animate-[scan_4s_linear_infinite] pointer-events-none z-0" />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />

              <User className="absolute top-8 right-8 w-12 h-12 text-muted/20 group-hover:text-primary/20 transition-colors duration-500" />
              
              <h3 className="font-teko text-4xl font-bold text-foreground uppercase mb-2 relative z-10 group-hover:text-white transition-colors">Solo Player</h3>
              <div className="font-teko text-5xl font-black text-primary mb-6 relative z-10 group-hover:animate-pulse">FREE</div>
              <ul className="space-y-4 mb-8 font-mono text-sm text-foreground/80 relative z-10">
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[50ms]"><span className="text-primary mt-0.5">»</span> <span>Access to basic quests</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[100ms]"><span className="text-primary mt-0.5">»</span> <span>Solo Boss Battles</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[150ms]"><span className="text-primary mt-0.5">»</span> <span>Standard Loot Drops</span></li>
                <li className="flex items-start gap-2 text-foreground/40 group-hover:translate-x-1 transition-transform duration-300 delay-[200ms]"><span className="mt-0.5">×</span> <span>No Guild features</span></li>
              </ul>
              <button className="w-full relative z-10 py-4 bg-background text-foreground border border-muted/20 font-teko text-2xl uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors cursor-none hover:shadow-[0_0_20px_rgba(255,70,85,0.5)]">
                Deploy Solo
              </button>
            </SpotlightCard>

            {/* Pro Tier */}
            <SpotlightCard 
              isPro={true}
              className="bg-[#0f1923] border-2 border-primary clip-angled p-8 transform md:-translate-y-6 shadow-[0_0_40px_rgba(255,70,85,0.4)] hover:shadow-[0_0_60px_rgba(255,70,85,0.6)]"
            >
              {/* Animated Scanline Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-80" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,70,85,0)_0%,rgba(255,70,85,0.1)_50%,rgba(255,70,85,0)_100%)] h-[200%] w-full -translate-y-full group-hover:animate-[scan_3s_linear_infinite] pointer-events-none z-0" />
              
              <div className="absolute -inset-1 border-2 border-primary opacity-0 group-hover:opacity-100 blur-sm pointer-events-none transition-opacity duration-500 z-10" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 shadow-[0_0_20px_rgba(255,70,85,1)]" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 shadow-[0_0_20px_rgba(255,70,85,1)]" />

              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/30 transition-colors" />
              <Crown className="absolute top-8 right-8 w-16 h-16 text-primary/20 group-hover:text-primary/40 group-hover:rotate-12 transition-all duration-500 z-10" />
              
              <div className="bg-primary text-white text-xs font-bold font-mono inline-block px-3 py-1 mb-4 relative z-10 border border-white/20 shadow-[0_0_10px_rgba(255,70,85,0.8)] group-hover:animate-pulse">
                [ RECOMMENDED ]
              </div>
              <h3 className="font-teko text-5xl font-bold text-white uppercase mb-2 relative z-10 transition-all">
                <span className="group-hover:animate-[glitch_0.3s_linear_infinite]">Guild Master</span>
              </h3>
              <div className="font-teko text-6xl font-black text-primary mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(255,70,85,0.5)]">$15<span className="text-3xl text-white/50">/MO</span></div>
              <ul className="space-y-4 mb-8 font-mono text-sm text-white/80 relative z-10">
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[50ms]"><span className="text-primary mt-0.5">»</span> <span>Create & Manage Guilds</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[100ms]"><span className="text-primary mt-0.5">»</span> <span>Multiplayer Raid Bosses</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[150ms]"><span className="text-primary mt-0.5">»</span> <span className="font-bold text-white group-hover:text-primary transition-colors">Increased Mythic Drop Rate</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[200ms]"><span className="text-primary mt-0.5">»</span> <span>Custom Avatar Cosmetics</span></li>
              </ul>
              <button className="w-full relative z-20 py-5 bg-primary text-white font-teko text-3xl uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-none shadow-[0_0_20px_rgba(255,70,85,0.6)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] group-hover:scale-[1.02]">
                Form Guild
              </button>
            </SpotlightCard>

            {/* Enterprise Tier */}
            <SpotlightCard 
              delay={0.3}
              className="bg-secondary border border-muted/20 clip-angled-tl p-8 hover:border-cyan-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,204,0)_0%,rgba(0,255,204,0.05)_50%,rgba(0,255,204,0)_100%)] h-[200%] w-full -translate-y-full group-hover:animate-[scan_4s_linear_infinite] pointer-events-none z-0" />
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />

              <Building className="absolute top-8 right-8 w-12 h-12 text-muted/20 group-hover:text-cyan-500/20 transition-colors duration-500" />
              
              <h3 className="font-teko text-4xl font-bold text-foreground uppercase mb-2 relative z-10 group-hover:text-white transition-colors">Corporation</h3>
              <div className="font-teko text-5xl font-black text-cyan-500 mb-6 relative z-10 group-hover:animate-pulse">CUSTOM</div>
              <ul className="space-y-4 mb-8 font-mono text-sm text-foreground/80 relative z-10">
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[50ms]"><span className="text-cyan-500 mt-0.5">»</span> <span>Private Enterprise Server</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[100ms]"><span className="text-cyan-500 mt-0.5">»</span> <span>Custom Bounties (Civic/Corp)</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[150ms]"><span className="text-cyan-500 mt-0.5">»</span> <span>API Access & Webhooks</span></li>
                <li className="flex items-start gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-[200ms]"><span className="text-cyan-500 mt-0.5">»</span> <span>24/7 Dedicated Support</span></li>
              </ul>
              <button className="w-full relative z-10 py-4 bg-background text-foreground border border-muted/20 font-teko text-2xl uppercase tracking-widest group-hover:bg-cyan-500 group-hover:text-white transition-colors cursor-none hover:shadow-[0_0_20px_rgba(0,255,204,0.5)]">
                Contact Ops
              </button>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ZONE 5: FINAL CTA & FOOTER */}
      <section className="relative bg-primary pt-32 pb-16 clip-angled-tl z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center mb-32">
          <h2 className="font-teko text-7xl md:text-9xl lg:text-[11rem] font-black text-background uppercase leading-[0.8] mb-12 drop-shadow-[0_10px_0_rgba(0,0,0,0.2)]">
            Ready To <br/> Deploy?
          </h2>
          
          <button className="px-16 py-8 bg-primary text-white font-teko text-4xl font-bold uppercase tracking-widest clip-angled hover:scale-110 hover:bg-white hover:text-black transition-all duration-300 cursor-none shadow-[0_0_40px_rgba(255,70,85,0.6)] hover:shadow-[0_0_60px_rgba(255,255,255,0.8)] group">
            <span className="relative z-10">Enter Dashboard</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-secondary py-12 px-6 border-t border-muted/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-foreground font-black text-3xl tracking-wider uppercase">
            <Hexagon className="w-8 h-8 fill-primary stroke-primary" />
            TaskMesh
          </div>
          <div className="flex gap-8 font-mono text-sm text-muted">
            <Link href="#" className="hover:text-primary transition-colors cursor-none">Privacy_Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors cursor-none">Terms_Of_Service</Link>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-foreground text-background font-mono text-xs px-4 py-2 font-bold flex items-center gap-2 clip-angled shadow-[0_0_15px_rgba(0,255,204,0.2)]">
              SYSTEM STATUS: <span className="text-accent animate-pulse">ONLINE</span>
            </div>
            <div className="font-teko text-xl text-muted tracking-widest uppercase">
              © 2026 TaskMesh. Play your life.
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  )
}
