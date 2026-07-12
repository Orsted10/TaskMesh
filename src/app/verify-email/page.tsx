"use client"

import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { Shield, KeyRound, Zap, Target } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { CustomCursor, GeometricParticles } from "@/components/gamified-ui"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

function VerifyEmailForm() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Email not found. Please try signing up again.")
      return
    }
    setLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Identity verified! Welcome to TaskMesh.")
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="space-y-2">
        <label className="font-teko text-xl tracking-wider text-foreground/70 uppercase">6-Digit Access Code</label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            required
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full bg-background border border-muted/30 p-3 pl-10 font-sans text-foreground focus:outline-none focus:border-primary transition-colors clip-angled-sm tracking-[0.5em] text-center text-2xl font-bold"
            placeholder="000000"
          />
        </div>
        <p className="text-sm text-foreground/60 text-center font-sans mt-2">
          Code sent to {email}
        </p>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading || token.length !== 6}
        className="w-full relative overflow-hidden bg-primary text-background p-4 font-teko text-3xl font-bold uppercase tracking-widest transition-all hover:bg-foreground hover:text-background clip-angled-br shadow-[0_5px_15px_rgba(255,70,85,0.4)] cursor-none disabled:opacity-50 border-none"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading ? "VERIFYING..." : "CONFIRM CLEARANCE"}
          {!loading && <Zap className="w-5 h-5" />}
        </span>
      </motion.button>
    </form>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen text-foreground bg-background overflow-hidden cursor-none selection:bg-primary/30 flex items-center justify-center relative">
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

      {/* OTP CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 bg-secondary border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] clip-angled-br group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Shield className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-[2px] bg-primary" />
            <span className="font-teko text-xl text-primary tracking-widest uppercase">Identity Check</span>
          </div>
          <h1 className="font-teko text-6xl font-black text-foreground uppercase tracking-tight mb-8">
            Verify Email
          </h1>

          <Suspense fallback={<div className="font-teko text-xl text-primary animate-pulse">Loading identity matrix...</div>}>
            <VerifyEmailForm />
          </Suspense>

        </div>
      </motion.div>
    </div>
  )
}
