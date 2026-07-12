import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';

const SYSTEM_PROMPT = `
You are the ACTIO God-Mode AI Engine, a tactical, gamified quest generator.
Your job is to take raw, boring text (or scraped webpage content) and turn it into a highly structured, actionable "Quest" with specific steps.

You MUST map the quest to ONE of these 6 Core Stats:
- strength (Fitness, workouts, physical labor, sports)
- intelligence (Studying, coding, tech, finance, reading)
- charisma (Social, civic duties, networking, leadership)
- creativity (Art, music, design, writing)
- craftsmanship (DIY, cooking, repair, building)
- willpower (Chores, cleaning, habits, mental health, focus)

You MUST respond in pure, raw JSON format. No markdown blocks, no \`\`\`json, just the JSON object.
Ensure the "category" exactly matches one of the 6 words above in lowercase.

OUTPUT JSON FORMAT:
{
  "quest": {
    "title": "string (A badass, gamified title for the mission)",
    "description": "string (A brief tactical briefing of the mission)",
    "category": "string (one of the 6 core stats)",
    "difficulty": number (1 to 5, where 1 is trivial and 5 is extreme),
    "estimated_time_minutes": number
  },
  "steps": [
    {
      "order_index": number (starting at 1),
      "title": "string (Short tactical action name)",
      "instruction": "string (Clear, imperative instruction)",
      "estimated_time_seconds": number,
      "verification_type": "image",
      "ai_validation_prompt": "string (What the Vision AI should look for to prove this step is done)"
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured in Vercel settings.' }, { status: 500 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const body = await req.json();
    const { type, payload } = body;

    if (!payload) {
      return NextResponse.json({ error: 'Payload is required' }, { status: 400 });
    }

    let rawContent = payload;

    // Heavy-duty URL Scraper
    if (type === 'url') {
      try {
        const response = await fetch(payload);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Remove junk to save Groq tokens and make it highly efficient
        $('script, style, noscript, iframe, img, svg').remove();
        
        rawContent = $('body').text().replace(/\s+/g, ' ').trim();
        
        // Truncate to ~4000 chars to save tokens (highly efficient $1 limit optimization)
        if (rawContent.length > 4000) {
          rawContent = rawContent.substring(0, 4000) + '...';
        }
      } catch (err) {
        return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 400 });
      }
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Generate a quest from the following input:\n\n${rawContent}`,
        },
      ],
      model: 'llama-3.1-8b-instant', // Highly efficient and native JSON format support
      temperature: 0.2, // Low temp for highly structured, predictable JSON
      response_format: { type: 'json_object' },
    });

    let aiResponse = completion.choices[0]?.message?.content || '{}';
    
    // Attempt to strip markdown blocks if the model weirdly outputs them despite JSON mode
    if (aiResponse.includes('```')) {
      const match = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        aiResponse = match[1];
      }
    }

    // Attempt to parse to ensure it's valid JSON before returning
    const parsedJson = JSON.parse(aiResponse);

    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quest', details: error.message },
      { status: 500 }
    );
  }
}

