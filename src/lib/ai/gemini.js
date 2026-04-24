import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function getAspectRatio(width, height) {
  const ratio = width / height;
  if (ratio >= 1.6)  return '16:9';
  if (ratio >= 1.2)  return '4:3';
  if (ratio <= 0.65) return '9:16';
  if (ratio <= 0.85) return '3:4';
  return '1:1';
}

function enhancePrompt(prompt) {
  const styles = ['highly detailed', 'professional photography', '8k resolution', 'cinematic lighting', 'studio quality'];
  const pick = styles.sort(() => Math.random() - 0.5).slice(0, 2).join(', ');
  return `${prompt}, ${pick}, award-winning, masterpiece`;
}

/**
 * Generate image via Google Imagen 3 REST API.
 * Gemini's native image-generation (gemini-2.0-flash-exp) was removed.
 * Imagen 3 is Google's current stable image-generation model.
 */
export async function generateImageWithGemini(prompt, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured' };
  }

  const { width = 1024, height = 1024 } = options;
  const aspectRatio = getAspectRatio(width, height);
  const enhancedPrompt = enhancePrompt(prompt);

  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `imagen-3.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: enhancedPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio,
          safetyFilterLevel: 'BLOCK_SOME',
          personGeneration: 'ALLOW_ADULT',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error?.message || `Imagen API ${res.status}`;
      console.error('[Gemini/Imagen] Error:', msg);
      return { success: false, error: msg };
    }

    const prediction = data.predictions?.[0];
    const imageBase64 = prediction?.bytesBase64Encoded;
    const mimeType    = prediction?.mimeType || 'image/png';

    if (!imageBase64) {
      return { success: false, error: 'No image data returned from Imagen' };
    }

    return {
      success: true,
      imageData: imageBase64,
      mimeType,
      prompt: enhancedPrompt,
    };
  } catch (error) {
    console.error('[Gemini/Imagen] fetch error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function generateImageMetadata(prompt) {
  if (!process.env.GEMINI_API_KEY) return defaultMetadata(prompt);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings,
    });

    const metadataPrompt = `
      Generate metadata for an AI image created from this prompt: "${prompt}"
      Return ONLY valid JSON (no markdown):
      {
        "tags": ["tag1", "tag2"],
        "category": "portrait|landscape|abstract|sci-fi|fantasy|architecture|nature|character|art",
        "description": "max 100 chars",
        "style": "artistic style",
        "mood": "emotional tone",
        "colors": ["color1", "color2"],
        "quality_score": 7
      }
    `;

    const result = await model.generateContent(metadataPrompt);
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
