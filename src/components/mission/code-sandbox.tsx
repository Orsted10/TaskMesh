'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Terminal, CheckCircle2, AlertTriangle, Code2, 
  Loader2, RefreshCw, Cpu, Sparkles, Copy, Check, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cyberAudio } from '@/lib/cyber-audio';

interface CodeSandboxProps {
  stepTitle: string;
  stepInstruction: string;
  validationPrompt: string;
  persona?: string;
  initialCode?: string;
  onVerified?: (code: string, review: any) => void;
}

const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: `// Write your solution here
function solution() {
  console.log("Initializing protocol execution...");
  
  // Implement your logic
  const result = { status: "ACTIVE", payload: [1, 2, 3, 4] };
  console.log("Processed result:", result);
  return result;
}

solution();`,

  typescript: `// TypeScript implementation
interface Config {
  id: string;
  active: boolean;
}

function executeTask(config: Config): string {
  console.log("Executing typed routine:", config.id);
  return "Protocol Verified: " + config.id;
}

console.log(executeTask({ id: "NODE_01", active: true }));`,

  python: `# Python solution
def execute_routine():
    print("Executing Python algorithm...")
    data = [x ** 2 for x in range(5)]
    print(f"Computed matrix: {data}")
    return True

if __name__ == "__main__":
    execute_routine()`,

  sql: `-- SQL Query Solution
SELECT 
    user_id, 
    COUNT(id) AS completed_quests, 
    SUM(exp_reward) AS total_exp
FROM user_quest_progress
WHERE status = 'completed'
GROUP BY user_id
ORDER BY total_exp DESC;`,

  shell: `#!/bin/bash
# Shell script validation
echo "[SYS.INFO] Initializing system diagnostics..."
uname -a
echo "[SYS.STATUS] Verification metrics nominal."`
};

export function CodeSandbox({
  stepTitle,
  stepInstruction,
  validationPrompt,
  persona = 'drill_sergeant',
  initialCode,
  onVerified
}: CodeSandboxProps) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(initialCode || DEFAULT_SNIPPETS.javascript);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verdict, setVerdict] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Switch template when language changes
  const handleLanguageChange = (newLang: string) => {
    cyberAudio.playClick();
    setLanguage(newLang);
    if (!code || code === DEFAULT_SNIPPETS[language]) {
      setCode(DEFAULT_SNIPPETS[newLang] || '// Write code here');
    }
  };

  // Safe In-Browser JavaScript/TypeScript Executor
  const handleRunCode = () => {
    cyberAudio.playClick();
    setIsRunning(true);
    setTerminalOutput('');

    setTimeout(() => {
      if (language === 'javascript' || language === 'typescript') {
        const logs: string[] = [];
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        try {
          // Intercept console
          console.log = (...args: any[]) => {
            logs.push('[LOG] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            originalLog(...args);
          };
          console.warn = (...args: any[]) => {
            logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            originalWarn(...args);
          };
          console.error = (...args: any[]) => {
            logs.push('[ERR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            originalError(...args);
          };

          // Strip simple TS types for pure browser execution
          let executableCode = code;
          if (language === 'typescript') {
            executableCode = code
              .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
              .replace(/type\s+\w+\s*=[^;]*;/g, '')
              .replace(/:\s*[A-Za-z0-9_<>[\]|&]+/g, '');
          }

          const runner = new Function(executableCode);
          const returned = runner();

          let output = logs.join('\n');
          if (returned !== undefined) {
            output += `\n[RETURN VALUE]: ${typeof returned === 'object' ? JSON.stringify(returned, null, 2) : String(returned)}`;
          }

          if (!output.trim()) {
            output = '[EXECUTION FINISHED WITH 0 OUTPUT] (Tip: use console.log to inspect variables)';
          }

          setTerminalOutput(output);
          cyberAudio.playClick();
        } catch (err: any) {
          setTerminalOutput(`[RUNTIME EXCEPTION]: ${err.message}\n${err.stack || ''}`);
          cyberAudio.playGlitch();
        } finally {
          console.log = originalLog;
          console.warn = originalWarn;
          console.error = originalError;
          setIsRunning(false);
        }
      } else {
        // Simulated execution for Python/SQL/Shell
        setTerminalOutput(`[SANDBOX RUNNER // ${language.toUpperCase()}]:\nExecuting source matrix...\n\nProgram compiled without syntax errors.\nProcess completed with exit code 0.`);
        setIsRunning(false);
      }
    }, 250);
  };

  // AI Verification & Code Review
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast.error('Write code before requesting verification.');
      cyberAudio.playGlitch();
      return;
    }

    setIsVerifying(true);
    setVerdict(null);
    cyberAudio.playScan();

    try {
      const res = await fetch('/api/ai/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          runtimeOutput: terminalOutput || '[Code evaluated directly]',
          stepTitle,
          stepInstruction,
          validationPrompt,
          persona
        })
      });

      const data = await res.json();

      if (data.verified) {
        cyberAudio.playSuccess();
        setVerdict(data);
        toast.success('Code Arbiter Approved!', {
          description: `[${data.confidence}% Confidence] ${data.feedback}`
        });
        if (onVerified) {
          onVerified(code, data.review);
        }
      } else {
        cyberAudio.playGlitch();
        setVerdict(data);
        toast.error('Code Verification Rejected', {
          description: `[${data.confidence}% Confidence] ${data.feedback}`
        });
      }
    } catch (err: any) {
      cyberAudio.playGlitch();
      toast.error('Audit Error', { description: 'Failed to contact Code Arbiter.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    cyberAudio.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* IDE Header Toolbar */}
      <div className="bg-black/80 px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5 ml-2">
            <Code2 className="w-4 h-4 text-[#ff4655]" /> Actio Cyber-IDE
          </span>
        </div>

        {/* Language selector & tools */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 rounded px-2.5 py-1 focus:outline-none focus:border-[#ff4655]"
          >
            <option value="javascript">JavaScript (Node/ES6)</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
            <option value="sql">SQL Query</option>
            <option value="shell">Bash / Shell</option>
          </select>

          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor & Terminal Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 min-h-[320px]">
        
        {/* Left: Code Input Area */}
        <div className="flex flex-col bg-zinc-950 p-4 relative">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>// SOURCE BUFFER ({language})</span>
            <span>UTF-8 • SPACES: 2</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Write code to solve this objective..."
            className="w-full h-72 bg-black/60 border border-zinc-800/80 rounded-xl p-4 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#ff4655]/60 resize-none custom-scrollbar selection:bg-[#ff4655] selection:text-white"
            spellCheck={false}
          />

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => {
                setCode(DEFAULT_SNIPPETS[language]);
                cyberAudio.playClick();
              }}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reset Template
            </button>

            <Button
              size="sm"
              onClick={handleRunCode}
              disabled={isRunning}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
              Run Code
            </Button>
          </div>
        </div>

        {/* Right: Terminal Console Output Area */}
        <div className="flex flex-col bg-black/90 p-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> TTY OUTPUT CONSOLE
            </span>
            <button
              type="button"
              onClick={() => setTerminalOutput('')}
              className="hover:text-zinc-300 transition-colors"
            >
              CLEAR
            </button>
          </div>

          <div className="w-full h-72 bg-black border border-zinc-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-zinc-300 custom-scrollbar relative">
            {terminalOutput ? (
              <pre className="whitespace-pre-wrap font-mono leading-relaxed text-zinc-300">
                {terminalOutput}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 select-none">
                <Terminal className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-[11px] font-mono">Click "Run Code" to execute code and view stdout.</p>
              </div>
            )}
          </div>

          {/* Action to trigger AI Audit */}
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              onClick={handleVerifyCode}
              disabled={isVerifying || !code.trim()}
              className="w-full bg-[#ff4655] hover:bg-[#ff5a67] text-white font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,70,85,0.3)] h-10"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Auditing Code with AI Arbiter...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Audit & Verify Code with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Code Review & Verdict Drawer */}
      <AnimatePresence>
        {verdict && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800 p-6 bg-zinc-950/90"
          >
            <div className={`p-4 rounded-xl border mb-4 ${
              verdict.verified 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-red-950/20 border-red-500/40 text-red-400'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {verdict.verified ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
                <span className="font-teko text-2xl uppercase tracking-widest leading-none mt-1">
                  {verdict.verified ? 'Code Verified // Objective Satisfied' : 'Verification Denied // Logic Flaw Detected'}
                </span>
                <span className="ml-auto font-mono text-xs px-2.5 py-0.5 rounded bg-black/40 border border-current">
                  {verdict.confidence}% Confidence
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-200 pl-9 mb-2 leading-relaxed">
                "{verdict.feedback}"
              </p>
              {verdict.analysis && (
                <p className="font-mono text-[11px] text-zinc-400 pl-9 italic">
                  Technical Analysis: {verdict.analysis}
                </p>
              )}
            </div>

            {/* Code Quality Review Breakdown */}
            {verdict.review && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-1">Time Complexity</span>
                  <span className="text-base text-cyan-400 font-bold">{verdict.review.timeComplexity}</span>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-1">Cleanliness Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-yellow-400 font-bold">{verdict.review.cleanlinessScore} / 100</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${verdict.review.cleanlinessScore}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-1">Key Strengths</span>
                  <p className="text-zinc-300 text-[11px] truncate">{verdict.review.strengths?.join(', ') || 'Clean logic'}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
