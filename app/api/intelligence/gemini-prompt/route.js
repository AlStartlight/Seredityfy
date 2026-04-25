import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Model candidates — dicoba berurutan sampai berhasil
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
];

async function tryGenerateWithFallback(genAI, parts) {
  for (const modelId of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(parts);
      const text = result.response.text().trim();
      if (text) {
        console.log(`[gemini-prompt] Success with model: ${modelId}`);
        return text;
      }
    } catch (err) {
      console.warn(`[gemini-prompt] ${modelId} failed:`, err.message?.slice(0, 100));
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let parts;

    if (imageUrl?.startsWith('data:')) {
      // Base64 data URL
      const commaIdx = imageUrl.indexOf(',');
      const meta = imageUrl.slice(0, commaIdx);        // "data:image/png;base64"
      const base64Data = imageUrl.slice(commaIdx + 1); // actual base64
      const mimeType = meta.replace('data:', '').replace(';base64', '');
      parts = [
        { text: PROMPT_TEMPLATE },
        { inlineData: { mimeType, data: base64Data } },
      ];
    } else if (imageUrl?.startsWith('http')) {
      // Remote URL — fetch and convert to base64
      try {
        const imageResp = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
        if (!imageResp.ok) throw new Error(`HTTP ${imageResp.status}`);
        const buffer = await imageResp.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = imageResp.headers.get('content-type') || 'image/png';
        parts = [
          { text: PROMPT_TEMPLATE },
          { inlineData: { mimeType, data: base64 } },
        ];
      } catch (fetchErr) {
        console.warn('[gemini-prompt] Image fetch failed, using description fallback:', fetchErr.message);
        // Fallback: text-only dengan URL sebagai konteks
        parts = [`${PROMPT_TEMPLATE}\n\nImage URL: ${imageUrl}`];
      }
    } else {
      // Text description only
      parts = [`${PROMPT_TEMPLATE}\n\nImage description: ${imageDescription}`];
    }

    const prompt = await tryGenerateWithFallback(genAI, parts);

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'All Gemini models failed to generate a prompt. Check your GEMINI_API_KEY in Vercel.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, prompt });

  } catch (err) {
    console.error('[gemini-prompt] error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
