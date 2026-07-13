import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { stepTitle, stepInstruction, userSkills } = await req.json();

    if (!stepInstruction) {
      return NextResponse.json({ error: 'Missing instruction' }, { status: 400 });
    }

    const systemPrompt = `You are a legendary, hyper-energetic, fun, and highly context-aware teacher inside the ACTIO RPG system. 
You are teaching a user how to complete a specific objective.

CRITICAL RULES:
1. ALWAYS be encouraging, fun, and slightly gamified.
2. CONTEXT AWARENESS: Look at the user's skills (out of 10,000 points). If they are a high-level master in this topic, banter with them! Tease them playfully for needing help on something basic, but still give them an elite-level tip. If they are a novice, be extremely supportive and break it down perfectly.
3. AGE AGNOSTIC BUT AWESOME: Teach in a way that feels cool for an 18-30 year old gamer, avoiding overly childish terms but staying super engaging.
4. Keep it concise. No huge walls of text. Use bullet points and bold text for key insights.
5. Provide actual, actionable knowledge to solve the specific step they are stuck on.`;

    const userPrompt = `USER'S CURRENT SKILLS: ${JSON.stringify(userSkills || {})}\n\nTEACH ME HOW TO DO THIS:\nTitle: ${stepTitle}\nInstruction: ${stepInstruction}\n\nGive me a crash course to complete this right now!`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
    });

    return NextResponse.json({ response: completion.choices[0]?.message?.content || 'Error generating teaching data.' });
  } catch (error: any) {
    console.error('Groq Teach Error:', error);
    return NextResponse.json({ error: 'Failed to teach', details: error.message }, { status: 500 });
  }
}
