import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;

// New SDK — digunakan untuk image generation
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Legacy SDK — digunakan hanya untuk generateImageMetadata (text-only)
const legacyAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

function getAspectRatio(width, height) {
  const ratio = width / height;
  if (ratio >= 1.7) return '16:9';
  if (ratio <= 0.6) return '9:16';
  if (ratio >= 1.2) return '4:3';
  if (ratio <= 0.85) return '3:4';
  return '1:1';
}

const SAFETY_OFF = [
  { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'OFF' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'OFF' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'OFF' },
  { category: 'HARM_CATEGORY_HARASSMENT',         threshold: 'OFF' },
];

const REFERENCE_MODE_PROMPTS = {
  face: 'IMPORTANT: A reference image is provided. You MUST preserve the exact facial identity, features, skin tone, and expression from the reference person in the generated output. The person must look identical to the reference.',
  style: 'IMPORTANT: A reference image is provided. Match the artistic style, color palette, lighting, texture, and visual aesthetic from the reference image exactly.',
  composition: 'IMPORTANT: A reference image is provided. Mirror the composition, spatial layout, framing, and overall structure of the reference image.',
  full: 'IMPORTANT: A reference image is provided. Use it as a complete guide — preserve the facial identity, match the artistic style, and follow the composition and layout.',
};

async function fetchReferenceAsBase64(url) {
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return {
      data: Buffer.from(buf).toString('base64'),
      mimeType: res.headers.get('content-type') || 'image/jpeg',
    };
  } catch {
    return null;
  }
}

/**
 * Generate image menggunakan Gemini 3.1 Flash Image Preview (@google/genai SDK).
 * Prompt diterima sudah di-enhance oleh RAG + LangChain dari hybrid.js.
 */
export async function generateImageWithGemini(prompt, options = {}) {
  if (!GEMINI_API_KEY || !ai) {
    return { success: false, error: 'GEMINI_API_KEY is not configured' };
  }

  const { width = 1024, height = 1024, referenceImage = null, referenceMode = 'face' } = options;
  const aspectRatio = getAspectRatio(width, height);

  // Build parts: optional reference image + text prompt with instruction
  const parts = [];
  if (referenceImage) {
    const ref = await fetchReferenceAsBase64(referenceImage);
    if (ref) {
      const instruction = REFERENCE_MODE_PROMPTS[referenceMode] || REFERENCE_MODE_PROMPTS.face;
      parts.push({ text: instruction });
      parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } });
    }
  }
  parts.push({ text: prompt });

  const req = {
    model: 'gemini-3.1-flash-image-preview',
    contents: [{ role: 'user', parts }],
    config: {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ['TEXT', 'IMAGE'],
      thinkingConfig: {
        thinkingLevel: 'HIGH',
      },
      imageConfig: {
        aspectRatio,
      },
      safetySettings: SAFETY_OFF,
    },
  };

  try {
    // Batas 50s agar function selesai sebelum Vercel timeout di 60s
    const timeoutMs = 50_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let imageData = null;
    let mimeType = 'image/png';

    try {
      const streamingResp = await ai.models.generateContentStream(req);

      for await (const chunk of streamingResp) {
        if (controller.signal.aborted) break;
        const parts = chunk.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType;
            break;
          }
        }
        if (imageData) break;
      }
    } finally {
      clearTimeout(timer);
    }

    if (!imageData) {
      return { success: false, error: 'Gemini returned no image data' };
    }

    console.log('[Gemini] Image generated with gemini-3.1-flash-image-preview');
    return {
      success: true,
      imageData,
      mimeType,
      prompt,
      model: 'gemini-3.1-flash-image-preview',
    };

  } catch (err) {
    const isTimeout = err.name === 'AbortError' || err.message?.includes('abort');
    const isDisabled = err.message?.includes('SERVICE_DISABLED') || err.message?.includes('has not been used') || err.status === 403 || err.code === 403;
    if (isDisabled) {
      console.error('[Gemini] API disabled — get an AI Studio key at https://aistudio.google.com/apikey and set GEMINI_API_KEY');
      return { success: false, error: 'Gemini API disabled or key invalid. Use an AI Studio key from https://aistudio.google.com/apikey' };
    }
    console.error('[Gemini]', isTimeout ? 'Timeout (>50s)' : 'Error:', err.message);
    return { success: false, error: isTimeout ? 'Gemini generation timed out' : err.message };
  }
}

/**
 * Generate image metadata menggunakan Gemini text model (legacy SDK).
 */
export async function generateImageMetadata(prompt) {
  if (!GEMINI_API_KEY || !legacyAI) return defaultMetadata(prompt);

  try {
    const model = legacyAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`
      Generate metadata for an AI image from this prompt: "${prompt}"
      Return ONLY valid JSON (no markdown):
      {
        "tags": ["tag1"],
        "category": "portrait|landscape|abstract|sci-fi|fantasy|architecture|nature|character|art",
        "description": "max 100 chars",
        "style": "artistic style",
        "mood": "emotional tone",
        "colors": ["color1"],
        "quality_score": 7
      }
    `);

    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (err) {
    console.error('[Gemini] Metadata error:', err.message);
  }

  return defaultMetadata(prompt);
}

function defaultMetadata(prompt) {
  return {
    tags: [],
    category: 'abstract',
    description: prompt.slice(0, 100),
    style: 'digital art',
    mood: 'neutral',
    colors: [],
    quality_score: 7,
  };
}

export default { generateImageWithGemini, generateImageMetadata };
