"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Shield, AlertTriangle } from "lucide-react"

function ErrorDetails() {
  const searchParams = useSearchParams()
  const [errorDesc, setErrorDesc] = useState("Unknown authentication error occurred.")

  useEffect(() => {
    // Supabase OAuth errors are often returned in the URL hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const desc = hashParams.get("error_description")
      if (desc) {
        setErrorDesc(decodeURIComponent(desc.replace(/\+/g, ' ')))
      }
    } else {
      const desc = searchParams.get("error_description")
      if (desc) {
        setErrorDesc(desc)
      }
    }
  }, [searchParams])

  return (
    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
      <p className="text-destructive font-mono text-sm break-all">
        {errorDesc}
      </p>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Authentication Error</h1>
          <p className="text-muted-foreground">
            We couldn't sign you in. This usually happens when the OAuth provider (like Google) is misconfigured in the Supabase Dashboard.
          </p>
        </div>

        <Suspense fallback={<div>Loading error details...</div>}>
          <ErrorDetails />
        </Suspense>

        <div className="pt-4">
          <Link 
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}
