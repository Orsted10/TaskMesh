import { NextResponse } from 'next/server';
import { getGroqClient, createGroqChatCompletion } from '@/lib/groq';
import { getPersonaConfig } from '@/lib/persona';

const CODE_VERIFIER_SYSTEM_PROMPT = `You are the ACTIO Code Arbiter and Tactical Technical Lead.
Your role is to evaluate source code written by an operative, along with its live runtime output, against a specific task objective.

CRITICAL EVALUATION PROTOCOL:
1. CODE FUNCTIONALITY: Examine the source code for correctness, logical flow, syntax, and proper programming conventions.
2. RUNTIME VALIDATION: Check the provided runtime console/terminal output. Does it demonstrate that the required task was executed and satisfied?
3. CHEAT DETECTION: Reject empty boilerplate, dummy console.logs that bypass real logic, or code that clearly doesn't address the requested problem.
4. CODE REVIEW: Provide an objective assessment including an estimated Time Complexity, a Cleanliness Score (0-100), key strengths, and actionable optimizations.
5. PERSONA COHESION: Deliver your feedback in the assigned persona character tone.

OUTPUT FORMAT:
Output JSON only, matching this exact schema:
{
  "verified": boolean,
  "confidence": number,
  "feedback": "string (1-2 sentences in your persona character tone)",
  "analysis": "string (technical summary of how the code behaves)",
  "review": {
    "cleanlinessScore": number,
    "timeComplexity": "string (e.g. O(1), O(n), O(n log n))",
    "strengths": ["string"],
    "suggestions": ["string"]
  }
}`;

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const {
      code,
      language = 'javascript',
      runtimeOutput = '',
      stepTitle = 'Coding Objective',
      stepInstruction = '',
      validationPrompt = '',
      persona = 'drill_sergeant'
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Source code is required for code verification' }, { status: 400 });
    }

    const activePersona = getPersonaConfig(persona);
    const personaDirective = `ACTIVE ARBITER PERSONA:\n${activePersona.verifyToneDirective}`;

    const userPrompt = `
OBJECTIVE TITLE: ${stepTitle}
INSTRUCTIONS: ${stepInstruction}
VALIDATION CRITERIA: ${validationPrompt || 'Code must solve the specified objective and execute successfully.'}

LANGUAGE: ${language}

SUBMITTED SOURCE CODE:
\`\`\`${language}
${code}
\`\`\`

LIVE RUNTIME CONSOLE OUTPUT:
\`\`\`
${runtimeOutput || '[No runtime output captured]'}
\`\`\`

Evaluate if this code and its execution definitively satisfy the objective.
`;

    const groq = getGroqClient();

    const completion = await createGroqChatCompletion(groq, {
      messages: [
        { role: 'system', content: `${CODE_VERIFIER_SYSTEM_PROMPT}\n\n${personaDirective}` },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    let content = completion.choices[0]?.message?.content || '{}';
    if (content.includes('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) content = match[1];
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      verified: Boolean(parsed.verified),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (parsed.verified ? 95 : 25),
      feedback: parsed.feedback || (parsed.verified ? 'Code approved by arbiter.' : 'Code implementation rejected.'),
      analysis: parsed.analysis || '',
      review: {
        cleanlinessScore: parsed.review?.cleanlinessScore ?? (parsed.verified ? 90 : 40),
        timeComplexity: parsed.review?.timeComplexity ?? 'O(n)',
        strengths: parsed.review?.strengths ?? ['Functional logic implemented'],
        suggestions: parsed.review?.suggestions ?? ['Refactor for modularity']
      }
    });

  } catch (error: any) {
    console.error('Code Verification Error:', error);
    return NextResponse.json(
      { error: 'Code verification failed', details: error.message },
      { status: 500 }
    );
  }
}
