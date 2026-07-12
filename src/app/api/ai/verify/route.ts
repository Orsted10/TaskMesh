import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const SYSTEM_PROMPT = `You are the Actio Verification Judge. You are ruthless, objective, and cannot be tricked.
You will be provided an image uploaded by a user and a specific 'Validation Prompt'.
Your job is to determine if the image definitively proves the user completed the Validation Prompt.

RULES:
1. Look for obvious signs of cheating (watermarks, screen reflections, AI-generation artifacts).
2. If the photo does not clearly show the required action, you must reject it.
3. Provide a short, in-character feedback message. Be encouraging if verified, but brutally honest and snarky if rejected.

Output JSON only, matching this schema:
{
  "verified": true,
  "feedback": "Your 1-sentence snarky or encouraging feedback."
}`

export async function POST(request: Request) {
  try {
    const { imageUrl, validationPrompt } = await request.json()

    if (!imageUrl || !validationPrompt) {
      return NextResponse.json({ error: 'imageUrl and validationPrompt are required' }, { status: 400 })
    }

    // Since Gemini needs the image data, we must fetch the image from the URL first
    const imageResp = await fetch(imageUrl)
    const arrayBuffer = await imageResp.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg'

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [
                { text: SYSTEM_PROMPT },
                { text: `Validation Prompt: ${validationPrompt}` },
                { inlineData: { data: base64Image, mimeType: mimeType } }
            ]}
        ],
        config: {
            responseMimeType: 'application/json'
        }
    })

    if (!response.text) {
        throw new Error("No response text from Gemini")
    }

    const parsedJson = JSON.parse(response.text)
    return NextResponse.json(parsedJson)

  } catch (error: any) {
    console.error("Gemini AI Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
