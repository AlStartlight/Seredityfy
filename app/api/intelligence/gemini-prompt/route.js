import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.5-flash-lite-preview-09-2025';

const PROMPT_TEMPLATE = `Analyze this image and convert it into a cinematic video prompt.

Follow this exact structure:
[Subject], camera: [movement], motion: [what moves], environment: [rain/wind/fog], lighting: [cinematic/neon/sunset], style: [style]

Requirements:
- Describe the main subject clearly
- Add camera movement (zoom in, push in, orbit, pan, tracking)
- Describe subject motion (walking, turning, breathing, cloth movement)
- Add environment animation (rain falling, clouds moving, particles, fog)
- Describe lighting changes (flickering, shifting, pulsing, god rays)
- End with style tag: ultra realistic, Unreal Engine 5 cinematic, or similar

Return ONLY the video prompt text, no explanation.`;

const GENERATION_CONFIG = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 0.95,
  thinkingConfig: {
    thinkingBudget: 0,
  },
  tools: [{ googleSearch: {} }],
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'OFF' },
  ],
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageUrl, imageDescription } = body;

    if (!imageUrl && !imageDescription) {
      return NextResponse.json(
        { success: false, error: 'Image URL or description is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GOOGLE_CLOUD_API_KEY or GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let parts;

    if (imageUrl?.startsWith('data:')) {
      const commaIdx = imageUrl.indexOf(',');
      const mimeType = imageUrl.slice(5, commaIdx).replace(';base64', '');
      const data = imageUrl.slice(commaIdx + 1);
      parts = [
        { text: PROMPT_TEMPLATE },
        { inlineData: { mimeType, data } },
      ];
    } else if (imageUrl?.startsWith('http')) {
      try {
        const imageResp = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
        if (!imageResp.ok) throw new Error(`HTTP ${imageResp.status}`);
        const buffer = await imageResp.arrayBuffer();
        const data = Buffer.from(buffer).toString('base64');
        const mimeType = imageResp.headers.get('content-type') || 'image/png';
        parts = [
          { text: PROMPT_TEMPLATE },
          { inlineData: { mimeType, data } },
        ];
      } catch (fetchErr) {
        console.warn('[gemini-prompt] Image fetch failed, using text fallback:', fetchErr.message);
        parts = [{ text: `${PROMPT_TEMPLATE}\n\nImage URL: ${imageUrl}` }];
      }
    } else {
      parts = [{ text: `${PROMPT_TEMPLATE}\n\nImage description: ${imageDescription}` }];
    }

    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
      config: GENERATION_CONFIG,
    });

    const prompt = resp.text?.trim();
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Model returned no text. Check your API key at https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }

    console.log(`[gemini-prompt] Success with ${MODEL}`);
    return NextResponse.json({ success: true, prompt });

  } catch (err) {
    const isDisabled = err.message?.includes('SERVICE_DISABLED') || err.message?.includes('has not been used') || err.status === 403;
    if (isDisabled) {
      console.error('[gemini-prompt] API key invalid or API disabled. Get a key at https://aistudio.google.com/apikey');
      return NextResponse.json(
        { success: false, error: 'Gemini API disabled. Set GOOGLE_CLOUD_API_KEY from https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }
    console.error('[gemini-prompt] error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
