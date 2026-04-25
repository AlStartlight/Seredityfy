import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Ordered by preference — first available wins
const MODELS = [
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

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

const SAFETY_OFF = [
  { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'OFF' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'OFF' },
];

async function tryModels(ai, parts) {
  for (const model of MODELS) {
    try {
      const resp = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: {
          maxOutputTokens: 65535,
          temperature: 1,
          topP: 0.95,
          safetySettings: SAFETY_OFF,
        },
      });
      const text = resp.text?.trim();
      if (text) {
        console.log(`[gemini-prompt] Success with ${model}`);
        return text;
      }
    } catch (err) {
      const msg = err.message || '';
      // Stop retrying on auth/key errors — no point trying other models
      if (msg.includes('SERVICE_DISABLED') || msg.includes('has not been used') || err.status === 403) {
        throw err;
      }
      console.warn(`[gemini-prompt] ${model} failed:`, msg.slice(0, 120));
    }
  }
  return null;
}

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

    const prompt = await tryModels(ai, parts);

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'All models failed to generate a prompt. Check GOOGLE_CLOUD_API_KEY.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, prompt });

  } catch (err) {
    const msg = err.message || '';
    const isDisabled = msg.includes('SERVICE_DISABLED') || msg.includes('has not been used') || err.status === 403;
    if (isDisabled) {
      console.error('[gemini-prompt] API key invalid or disabled. Get a key: https://aistudio.google.com/apikey');
      return NextResponse.json(
        { success: false, error: 'Gemini API key invalid or disabled. Set GOOGLE_CLOUD_API_KEY from https://aistudio.google.com/apikey' },
        { status: 500 }
      );
    }
    console.error('[gemini-prompt] error:', msg);
    return NextResponse.json(
      { success: false, error: msg || 'Internal server error' },
      { status: 500 }
    );
  }
}
