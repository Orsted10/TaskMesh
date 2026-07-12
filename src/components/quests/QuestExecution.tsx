"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle2, XCircle, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { createClient } from "@/utils/supabase/client"

interface QuestStep {
  id: string
  title: string
  instruction: string
  ai_validation_prompt: string
  verification_type: string
}

export function QuestExecution({ steps, onComplete }: { steps: QuestStep[], onComplete: () => void }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const activeStep = steps[activeStepIndex]

  const triggerVictory = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF4655', '#FFFFFF', '#000000'] // TaskMesh colors
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsVerifying(true)
    setUploadProgress(10)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `proofs/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('quest-proofs')
        .upload(filePath, file)

      if (uploadError) throw new Error("Upload failed")
      
      setUploadProgress(50)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quest-proofs')
        .getPublicUrl(filePath)

      setUploadProgress(70)

      // 2. Call Gemini AI Verification API
      const aiResponse = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: publicUrl,
          validationPrompt: activeStep.ai_validation_prompt
        })
      })

      const aiData = await aiResponse.json()
      setUploadProgress(100)

      if (aiData.verified) {
        toast.success(`VERIFIED: ${aiData.feedback}`)
        triggerVictory()
        
        // Move to next step or complete
        if (activeStepIndex < steps.length - 1) {
          setActiveStepIndex(prev => prev + 1)
        } else {
          onComplete()
        }
      } else {
        toast.error(`REJECTED: ${aiData.feedback}`)
      }

    } catch (err: any) {
      toast.error(err.message || "Verification failed")
    } finally {
      setIsVerifying(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between font-teko text-2xl tracking-widest text-primary uppercase border-b border-primary/20 pb-4">
        <span>Active Execution Protocol</span>
        <span>Step {activeStepIndex + 1} / {steps.length}</span>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex
          const isPast = index < activeStepIndex

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isActive || isPast ? 1 : 0.4, y: 0 }}
              className={`p-6 border clip-angled transition-all duration-300 ${isActive ? 'bg-secondary border-primary/50 shadow-[0_0_15px_rgba(255,70,85,0.1)]' : 'bg-background border-muted/20'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border ${isPast ? 'bg-primary border-primary text-background' : isActive ? 'border-primary text-primary animate-pulse' : 'border-muted text-muted-foreground'}`}>
                  {isPast ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className={`font-teko text-3xl uppercase tracking-wider ${isActive ? 'text-foreground' : 'text-foreground/70'}`}>
                    {step.title}
                  </h3>
                  <p className="font-sans text-foreground/80">{step.instruction}</p>
                  
                  {isActive && (
                    <div className="pt-6 mt-4 border-t border-muted/20">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        id="proof-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={isVerifying}
                      />
                      <label 
                        htmlFor="proof-upload"
                        className={`flex items-center justify-center gap-3 w-full p-4 font-teko text-2xl uppercase tracking-widest border transition-all cursor-none ${isVerifying ? 'bg-muted border-muted text-muted-foreground' : 'bg-background hover:bg-primary hover:text-background border-primary text-primary hover:shadow-[0_0_20px_rgba(255,70,85,0.4)]'}`}
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            ANALYZING PROOF [{uploadProgress}%]
                          </>
                        ) : (
                          <>
                            <Camera className="w-6 h-6" />
                            UPLOAD PROOF OF ACTION
                          </>
                        )}
                      </label>
                      <p className="text-xs text-center mt-3 text-muted-foreground font-sans">
                        Requires: Clear visual proof matching AI Validation parameters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
