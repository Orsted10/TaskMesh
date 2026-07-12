import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are the Actio Quest Architect. Your job is to convert passive text into highly structured, engaging, actionable game-like quests.
You MUST output ONLY a raw JSON object matching this exact schema, with NO markdown formatting (do not wrap in \`\`\`json):
{
  "title": "A catchy, gamified title",
  "description": "A brief summary of the ultimate goal",
  "category": "tech|fitness|civic|culinary|art|life",
  "difficulty": 10,
  "steps": [
    {
      "title": "Actionable step title",
      "instruction": "Detailed, direct instruction.",
      "estimated_time_seconds": 300,
      "verification_type": "image|gps",
      "ai_validation_prompt": "A specific 1-sentence instruction for a Vision AI to verify this specific step was completed."
    }
  ]
}

RULES:
1. Break down the content into 3 to 10 logical, sequential steps.
2. Every step MUST be a physical or digital action the user can prove they did via photo.
3. The 'ai_validation_prompt' is critical. It must tell a future Vision AI EXACTLY what to look for in a photo to prove the user did this step. (e.g., "Look for a photo of a pan with browned ground beef.")`

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a quest from this content: ${content}` }
      ],
      model: 'llama3-8b-8192', // Using 8b for speed and extreme cost efficiency as requested
      temperature: 0.5,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error("No response from Groq")
    }

    const parsedJson = JSON.parse(responseText)
    return NextResponse.json(parsedJson)

  } catch (error: any) {
    console.error("Groq AI Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
