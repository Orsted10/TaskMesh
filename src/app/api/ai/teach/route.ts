import { NextResponse } from 'next/server';
import { getGroqClient, createGroqChatCompletion } from '@/lib/groq';
import { getPersonaConfig } from '@/lib/persona';

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
    }

    const groq = getGroqClient();
    const { stepTitle, stepInstruction, userSkills, persona } = await req.json();

    if (!stepInstruction) {
      return NextResponse.json({ error: 'Missing instruction' }, { status: 400 });
    }

    const activePersona = getPersonaConfig(persona);

    const systemPrompt = `You are a legendary, hyper-energetic, fun, and highly context-aware mentor inside the ACTIO RPG system. 
You are coaching a user on how to complete a specific objective.

ACTIVE MENTOR PERSONA:
${activePersona.teachToneDirective}

CRITICAL RULES:
1. Always stay in character with your persona.
2. CONTEXT AWARENESS: Look at the user's skills (out of 10,000 points). If they are a high-level master in this topic, banter with them! Tease them playfully for needing help on something basic, but still give them an elite-level tip. If they are a novice, be extremely supportive and break it down perfectly.
3. Keep it concise, punchy, and actionable. No huge walls of text. Use markdown bullet points and bold text for key insights.
4. Provide actual, actionable knowledge to solve the specific step they are stuck on immediately.`;

    const userPrompt = `USER'S CURRENT SKILLS: ${JSON.stringify(userSkills || {})}\n\nCOACH ME ON THIS OBJECTIVE:\nTitle: ${stepTitle}\nInstruction: ${stepInstruction}\n\nGive me an instant tactical briefing to execute this step right now!`;

    const completion = await createGroqChatCompletion(groq, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ response: completion.choices[0]?.message?.content || 'Error generating teaching data.' });
  } catch (error: any) {
    console.error('Groq Teach Error:', error);
    return NextResponse.json({ error: 'Failed to teach', details: error.message }, { status: 500 });
  }
}
