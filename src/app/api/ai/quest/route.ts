import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';

const SYSTEM_PROMPT = `
You are the ACTIO God-Mode AI Engine, a tactical, gamified quest generator.
Your job is to take raw, boring text (or scraped webpage content) and turn it into a highly structured, actionable "Campaign" containing multiple missions.

Based on the scope and difficulty of the task, you MUST generate an array of missions (a Campaign). 
If the task is MASSIVE (e.g., "Learn Python", "Build a Startup"), generate a multi-tier campaign (e.g., 1 Daily, 1 Medium, 1 Hard, 1 Boss).
If the task is SMALL (e.g., "Cook Fried Rice"), generate fewer, appropriate missions (e.g., 1 Easy, 1 Medium).

MISSION TIERS AVAILABLE:
Tutorial, Easy, Medium, Hard, Epic, Unique, Extreme, Legendary, Impossible
Boss Levels: Mini Boss, Side Boss, Boss, World Boss, Guild Boss
Time-Based: Hourly, Daily, Weekly, Monthly

You MUST map each quest to ONE of these 6 Core Stats: strength, intelligence, charisma, creativity, craftsmanship, willpower.

You MUST respond in pure, raw JSON format matching this EXACT schema:
{
  "campaign_title": "string (A badass title for the overall objective)",
  "campaign_description": "string",
  "quests": [
    {
      "title": "string (Gamified mission title)",
      "description": "string (Tactical briefing)",
      "category": "string (one of the 6 core stats)",
      "difficulty": number (1 to 5),
      "tier": "string (One of the MISSION TIERS)",
      "mission_type": "string (e.g., 'Standard', 'Boss', 'Daily')",
      "rewards": {
        "xp": number (100 to 5000 based on tier),
        "gold": number (10 to 1000),
        "specific_skills": [{"name": "string (e.g. 'Python', 'Cooking')", "value": number}]
      },
      "steps": [
        {
          "order_index": number,
          "title": "string (Short action name)",
          "instruction": "string",
          "ai_validation_prompt": "string (What the Vision AI should look for)"
        }
      ]
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const body = await req.json();
    const { type, payload } = body;

    if (!payload) {
      return NextResponse.json({ error: 'Payload is required' }, { status: 400 });
    }

    let rawContent = payload;

    // Heavy-duty URL Scraper
    if (type === 'url') {
      try {
        if (payload.includes('youtube.com') || payload.includes('youtu.be')) {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(payload)}&format=json`;
          const oembedRes = await fetch(oembedUrl);
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            rawContent = `YOUTUBE VIDEO TITLE: ${oembedData.title}\nAUTHOR: ${oembedData.author_name}\n\nINSTRUCTION: Create a campaign based on this video.`;
          }
        } else {
          const response = await fetch(payload, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          const html = await response.text();
          const $ = cheerio.load(html);
          const title = $('title').text() || '';
          $('script, style, noscript, iframe, img, svg').remove();
          let bodyText = $('body').text().replace(/\s+/g, ' ').trim();
          if (bodyText.length > 3000) bodyText = bodyText.substring(0, 3000) + '...';
          rawContent = `URL TITLE: ${title}\n\nWEBSITE CONTENT:\n${bodyText}`;
        }
      } catch (err) {
        return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 400 });
      }
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a campaign from the following input:\n\n${rawContent}` },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    let aiResponse = completion.choices[0]?.message?.content || '{}';
    if (aiResponse.includes('```')) {
      const match = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) aiResponse = match[1];
    }

    const parsedJson = JSON.parse(aiResponse);
    return NextResponse.json(parsedJson);
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'Failed to generate campaign', details: error.message }, { status: 500 });
  }
}
