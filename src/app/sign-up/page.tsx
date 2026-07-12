"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Mail, Lock, Zap, Target, User, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { CustomCursor, GeometricParticles } from "@/components/gamified-ui"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          dob: dob,
        }
      }
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Profile created! Check your email for the verification code.")
    router.push("/verify-email?email=" + encodeURIComponent(email))
  }

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen text-foreground bg-background overflow-hidden cursor-none selection:bg-primary/30 flex items-center justify-center relative py-20">
      <CustomCursor />
      <GeometricParticles />

      {/* CRT SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 mix-blend-overlay">
        <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* TACTICAL NAVBAR (Mini) */}
      <nav className="fixed top-0 w-full z-40 px-6 sm:px-12 py-6 flex justify-between items-center pointer-events-none">
        <Link href="/" className="flex items-center gap-3 pointer-events-auto group">
          <div className="w-10 h-10 bg-primary clip-angled-tl flex items-center justify-center shadow-[0_0_15px_rgba(255,70,85,0.5)] group-hover:bg-foreground transition-colors">
            <Target className="w-5 h-5 text-background" />
          </div>
          <span className="font-teko font-bold text-4xl tracking-widest text-foreground mt-2 uppercase drop-shadow-md group-hover:text-primary transition-colors">TaskMesh</span>
        </Link>
        <div className="pointer-events-auto bg-background/80 backdrop-blur-md px-4 py-2 clip-angled border border-muted/20">
          <ThemeToggle />
        </div>
      </nav>

      {/* REGISTER CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 bg-secondary border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] clip-angled-br group mt-10"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Shield className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-primary" />
            <span className="font-teko text-xl text-primary tracking-widest uppercase">New Operative</span>
          </div>
          <h1 className="font-teko text-6xl font-black text-foreground uppercase tracking-tight mb-6">
            Sign Up
          </h1>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-1">
              <label className="font-teko text-xl tracking-wider text-foreground/70 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-muted/30 p-3 pl-10 font-sans text-foreground focus:outline-none focus:border-primary transition-colors clip-angled-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-teko text-xl tracking-wider text-foreground/70 uppercase">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="date" 
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-background border border-muted/30 p-3 pl-10 font-sans text-foreground focus:outline-none focus:border-primary transition-colors clip-angled-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-teko text-xl tracking-wider text-foreground/70 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-muted/30 p-3 pl-10 font-sans text-foreground focus:outline-none focus:border-primary transition-colors clip-angled-sm"
                  placeholder="agent@taskmesh.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-teko text-xl tracking-wider text-foreground/70 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-muted/30 p-3 pl-10 font-sans text-foreground focus:outline-none focus:border-primary transition-colors clip-angled-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full relative overflow-hidden bg-primary text-background p-4 font-teko text-3xl font-bold uppercase tracking-widest transition-all hover:bg-foreground hover:text-background clip-angled-br shadow-[0_5px_15px_rgba(255,70,85,0.4)] cursor-none disabled:opacity-50 border-none mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? "ENCRYPTING..." : "CREATE PROFILE"}
                {!loading && <Zap className="w-5 h-5" />}
              </span>
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-muted/30" />
            <span className="font-teko text-xl text-muted-foreground tracking-widest">OR</span>
            <div className="h-[1px] flex-1 bg-muted/30" />
          </div>

          <motion.button
            onClick={handleGoogleAuth}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-background border border-muted/30 p-4 font-teko text-2xl font-bold text-foreground uppercase tracking-widest transition-colors hover:border-primary/50 hover:bg-muted/10 clip-angled-sm cursor-none flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            GOOGLE AUTH
          </motion.button>

          <p className="mt-8 text-center font-sans text-sm text-foreground/60">
            Already registered? <Link href="/sign-in" className="text-primary hover:underline font-bold cursor-none">Sign In Here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
