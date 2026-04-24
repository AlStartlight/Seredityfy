import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function enhancePrompt(prompt) {
  const styles = ['highly detailed', 'professional photography', '8k resolution', 'cinematic lighting', 'studio quality'];
  const pick = styles.sort(() => Math.random() - 0.5).slice(0, 2).join(', ');
  return `${prompt}, ${pick}, award-winning, masterpiece`;
}

/**
 * Generate image via Gemini AI Studio v1alpha endpoint.
 *
 * Image generation via responseModalities is only available on the v1alpha
 * endpoint — NOT v1beta. The SDK defaults to v1beta which causes 404s.
 * We call the REST API directly to control the version.
 *
 * Tried models in order (first success wins):
 *   1. gemini-2.0-flash-preview-image-generation  (preview stable)
 *   2. gemini-2.0-flash-exp                        (experimental)
 *   3. gemini-2.0-flash                            (stable, may support image output)
 */
export async function generateImageWithGemini(prompt, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured' };
  }

  const enhancedPrompt = enhancePrompt(prompt);

  const models = [
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
  ];

  const body = JSON.stringify({
    contents: [{ parts: [{ text: enhancedPrompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      temperature: 0.9,
    },
    safetySettings: safetySettings.map(s => ({
      category: s.category,
      threshold: s.threshold,
    })),
  });

  for (const modelId of models) {
    try {
      // v1alpha exposes the experimental image-generation capability
      const url =
        `https://generativelanguage.googleapis.com/v1alpha/models/` +
        `${modelId}:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn(`[Gemini] ${modelId} → ${res.status}: ${data.error?.message}`);
        continue; // try next model
      }

      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart) {
        console.log(`[Gemini] Image generated with ${modelId}`);
        return {
          success: true,
          imageData: imagePart.inlineData.data,
          mimeType:  imagePart.inlineData.mimeType,
          prompt:    enhancedPrompt,
          model:     modelId,
        };
      }

      console.warn(`[Gemini] ${modelId} returned no image parts — parts:`, JSON.stringify(parts).slice(0, 200));
    } catch (err) {
      console.warn(`[Gemini] ${modelId} fetch error:`, err.message);
    }
  }

  return {
    success: false,
    error: 'All Gemini image-generation models failed. Check API key and quota.',
  };
}

export async function generateImageMetadata(prompt) {
  if (!process.env.GEMINI_API_KEY) return defaultMetadata(prompt);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', safetySettings });

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
