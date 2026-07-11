import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK
// It will automatically use the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskDescription, imageUrl } = body;

    if (!taskDescription || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing taskDescription or imageUrl' },
        { status: 400 }
      );
    }

    // Since we don't have direct upload functionality implemented with storage yet,
    // we assume imageUrl is a public URL. In a real app, you'd fetch the image buffer here 
    // and pass it as inlineData, or just pass the URL if the model supports it.
    // For this MVP API structure, we will prompt the model using the image URL if possible,
    // but the `@google/genai` SDK requires a base64 buffer or a File object for images not hosted by Google.
    
    // As a placeholder for Phase 1 MVP without file storage setup yet:
    const prompt = `You are a ruthless, highly critical AI judge for a productivity app called TaskMesh. 
    The user claimed to have completed this task: "${taskDescription}". 
    Look at the provided image. Did they actually complete it?
    Be extremely strict. If it looks fake, incomplete, or ambiguous, reject it.
    Return ONLY a raw JSON response (no markdown blocks, no text before or after) with this exact structure:
    {
      "verified": boolean,
      "feedback": "string explaining your snarky/ruthless reasoning in 2-3 sentences"
    }`;

    /* 
    // ACTUAL GEMINI CALL (Uncomment when real image uploads are handled)
    
    // Fetch image from URL and convert to base64
    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // or gemini-2.5-flash for speed
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    let textResponse = response.text || "{}";
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(textResponse);
    return NextResponse.json(result);
    */

    // Simulated Response for Demo
    const isSuccess = Math.random() > 0.5;
    return NextResponse.json({
      verified: isSuccess,
      feedback: isSuccess 
        ? "Fine. It looks like you actually did what you said you would. Don't let it go to your head." 
        : "Pathetic attempt. This image proves absolutely nothing. Try actually doing the work next time."
    });

  } catch (error) {
    console.error('AI Verification Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during verification' },
      { status: 500 }
    );
  }
}
