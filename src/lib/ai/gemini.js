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

/**
 * Generate image menggunakan Gemini 3.1 Flash Image Preview (@google/genai SDK).
 * Prompt diterima sudah di-enhance oleh RAG + LangChain dari hybrid.js.
 */
export async function generateImageWithGemini(prompt, options = {}) {
  if (!GEMINI_API_KEY || !ai) {
    return { success: false, error: 'GEMINI_API_KEY is not configured' };
  }

  const { width = 1024, height = 1024 } = options;
  const aspectRatio = getAspectRatio(width, height);

  const req = {
    model: 'gemini-3.1-flash-image-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
