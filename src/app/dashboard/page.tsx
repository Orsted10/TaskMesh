'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Home() {
  const [task, setTask] = useState('');
  const [isTaskDeclared, setIsTaskDeclared] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'rejected'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleDeclareTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setIsTaskDeclared(true);
    toast.success('Task declared. Awaiting proof of action.');
  };

  const simulateVerification = () => {
    setIsVerifying(true);
    // Simulate AI verification delay
    setTimeout(() => {
      setIsVerifying(false);
      // Randomly verify or reject for demo purposes
      const isSuccess = Math.random() > 0.5;
      if (isSuccess) {
        setVerificationStatus('verified');
        setFeedback('Task successfully completed. Good job.');
        toast.success('+50 EXP Gained!', {
          description: 'Task verified by AI Judge.',
        });
      } else {
        setVerificationStatus('rejected');
        setFeedback('This image does not prove the task was completed. Try again.');
        toast.error('Verification Failed', {
          description: 'The AI Judge rejected your proof.',
        });
      }
    }, 3000);
  };

  const handleReset = () => {
    setTask('');
    setIsTaskDeclared(false);
    setVerificationStatus('idle');
    setFeedback('');
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-zinc-950 text-zinc-50">
      {/* Sci-Fi Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
      
      <div className="z-10 w-full max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500">
            TaskMesh
          </h1>
          <p className="text-zinc-400 tracking-widest text-sm uppercase">Proof of Action Engine</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isTaskDeclared ? (
            <motion.div
              key="declare"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleDeclareTask} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-zinc-900 rounded-xl border border-zinc-800 focus-within:border-cyan-500/50 shadow-2xl overflow-hidden">
                  <Input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="What action will you take today?"
                    className="flex-1 border-0 bg-transparent h-16 sm:h-20 text-lg sm:text-2xl px-6 focus-visible:ring-0 placeholder:text-zinc-600"
                    autoFocus
                  />
                  <Button type="submit" size="lg" className="mr-3 h-12 sm:h-14 px-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-sm sm:text-base tracking-wide font-semibold">
                    INITIATE
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardDescription className="text-zinc-400 uppercase tracking-wider text-xs font-semibold">Active Quest</CardDescription>
                  <CardTitle className="text-2xl text-zinc-100">{task}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {verificationStatus === 'idle' && !isVerifying && (
                    <div className="border-2 border-dashed border-zinc-700/50 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors cursor-pointer group">
                      <div className="bg-zinc-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="font-medium text-zinc-300">Upload Proof of Action</p>
                      <p className="text-sm mt-1">Drag and drop, or click to browse</p>
                      
                      {/* Temporary button to simulate upload for demo */}
                      <Button onClick={simulateVerification} variant="secondary" className="mt-6 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20">
                        <Camera className="w-4 h-4 mr-2" /> Simulate Upload
                      </Button>
                    </div>
                  )}

                  {isVerifying && (
                    <div className="py-16 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                      <div className="text-center space-y-1">
                        <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest animate-pulse">AI Judge is analyzing...</p>
                        <p className="text-zinc-500 text-xs font-mono">Comparing image data against task parameters</p>
                      </div>
                    </div>
                  )}

                  {verificationStatus === 'verified' && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center text-center space-y-4"
                    >
                      <div className="bg-emerald-500/20 p-3 rounded-full">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-emerald-400 font-bold text-xl uppercase tracking-wider">Verified</h3>
                        <p className="text-emerald-500/80 mt-1">{feedback}</p>
                      </div>
                    </motion.div>
                  )}

                  {verificationStatus === 'rejected' && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col items-center text-center space-y-4"
                    >
                      <div className="bg-red-500/20 p-3 rounded-full">
                        <XCircle className="w-10 h-10 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-red-400 font-bold text-xl uppercase tracking-wider">Rejected</h3>
                        <p className="text-red-500/80 mt-1">{feedback}</p>
                      </div>
                    </motion.div>
                  )}

                </CardContent>
                {(verificationStatus === 'verified' || verificationStatus === 'rejected') && (
                  <CardFooter className="bg-zinc-950/50 p-4 border-t border-zinc-800">
                    <Button onClick={handleReset} variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                      RETURN TO TERMINAL
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
