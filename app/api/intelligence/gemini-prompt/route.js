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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let result;

    if (imageUrl && imageUrl.startsWith('data:')) {
      const [mimeType, base64Data] = imageUrl.split(',');
      const mime = mimeType.replace('data:', '').replace(';base64', '');

      result = await model.generateContent([
        { text: PROMPT_TEMPLATE },
        { inlineData: { mimeType: mime, data: base64Data } },
      ]);
    } else if (imageUrl && imageUrl.startsWith('http')) {
      const imageResp = await fetch(imageUrl);
      const imageBuffer = await imageResp.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const mime = imageResp.headers.get('content-type') || 'image/png';

      result = await model.generateContent([
        { text: PROMPT_TEMPLATE },
        { inlineData: { mimeType: mime, data: base64 } },
      ]);
    } else {
      result = await model.generateContent(
        `${PROMPT_TEMPLATE}\n\nImage description: ${imageDescription}`
      );
    }

    const prompt = result.response.text().trim();

    return NextResponse.json({ success: true, prompt });
  } catch (err) {
    console.error('[gemini-prompt]', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
