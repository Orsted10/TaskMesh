import { NextResponse } from 'next/server';
import { getGroqClient, createGroqChatCompletion } from '@/lib/groq';
import { getPersonaConfig } from '@/lib/persona';

const BASE_VERIFY_PROMPT = `You are the ACTIO Zero-Trust Verification Arbiter. You are ruthless, objective, and cannot be tricked.
You are inspecting an image uploaded by an operative to prove completion of a specific task objective.

YOUR RESPONSIBILITIES:
1. Objectively examine the visual evidence. Look for concrete proof of the requested action or object.
2. Check for obvious signs of cheating (blank images, unrelated stock photos, screen photos that don't match, or low-effort bypasses).
3. If the image clearly demonstrates genuine effort matching the validation requirement, mark verified = true.
4. If the photo does not clearly show the required proof, mark verified = false.
5. Provide a confidence score from 0 to 100.
6. Provide a concise feedback statement in your designated persona character tone.

OUTPUT FORMAT:
Output JSON only matching this schema:
{
  "verified": boolean,
  "confidence": number,
  "feedback": "string (1-2 sentences in your persona tone explaining the verdict)",
  "analysis": "string (brief note on what key visual elements were identified or missing)"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawImage = body.image || body.imageUrl;
    const prompt = body.prompt || body.validationPrompt;
    const personaId = body.persona || 'drill_sergeant';

    if (!rawImage || !prompt) {
      return NextResponse.json(
        { error: 'Image and validation prompt are required' },
        { status: 400 }
      );
    }

    let formattedDataUri = '';

    if (rawImage.startsWith('data:image/')) {
      formattedDataUri = rawImage;
    } else if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      // Remote URL - fetch and encode
      const imgRes = await fetch(rawImage);
      if (!imgRes.ok) {
        throw new Error(`Failed to fetch image from URL: ${imgRes.statusText}`);
      }
      const arrayBuf = await imgRes.arrayBuffer();
      const mime = imgRes.headers.get('content-type') || 'image/jpeg';
      const base64 = Buffer.from(arrayBuf).toString('base64');
      formattedDataUri = `data:${mime};base64,${base64}`;
    } else {
      // Raw base64 string
      formattedDataUri = `data:image/jpeg;base64,${rawImage}`;
    }

    const persona = getPersonaConfig(personaId);
    const systemPromptWithPersona = `${BASE_VERIFY_PROMPT}\n\nACTIVE PERSONA DIRECTIVE:\n${persona.verifyToneDirective}`;

    const groq = getGroqClient();

    const completion = await createGroqChatCompletion(groq, {
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: systemPromptWithPersona },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `TASK VALIDATION CRITERIA:\n"${prompt}"\n\nInspect this submitted evidence image and determine if it satisfies the criteria.`
            },
            {
              type: 'image_url',
              image_url: { url: formattedDataUri }
            }
          ]
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    let content = completion.choices[0]?.message?.content || '{}';
    if (content.includes('```')) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) content = match[1];
    }

    const result = JSON.parse(content);

    return NextResponse.json({
      verified: Boolean(result.verified),
      confidence: typeof result.confidence === 'number' ? result.confidence : (result.verified ? 95 : 20),
      feedback: result.feedback || (result.verified ? 'Objective verified.' : 'Proof rejected.'),
      analysis: result.analysis || ''
    });

  } catch (error: any) {
    console.error('Zero-Trust AI Verification Error:', error);
    return NextResponse.json(
      { error: 'AI Verification engine failed', details: error.message },
      { status: 500 }
    );
  }
}
