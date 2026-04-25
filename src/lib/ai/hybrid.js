import { generateImageWithGemini } from './gemini';
import { generateImageWithDALLE } from './chatgpt';

export async function generateHybridImage({
  prompt,
  userId,
  model = 'seredityfy-v2',
  generationMode = 'HYBRID',
  width = 1024,
  height = 1024,
  steps = 30,
  guidanceScale = 8.5,
  negativePrompt = null,
  referenceImage = null,
  strength = 0.7,
}) {
  const startTime = Date.now();

  let imageResult = await generateImageWithGemini(prompt, { width, height });
  let generator = imageResult.model || 'gemini';

  if (!imageResult.success) {
    console.warn('[Hybrid] Gemini failed, falling back to DALL-E 3:', imageResult.error);
    imageResult = await generateImageWithDALLE(prompt, { width, height });
    generator = 'dalle-3';
  }

  if (!imageResult.success) {
    return { success: false, error: imageResult.error || 'Generation failed', prompt };
  }

  return {
    success: true,
    imageData: imageResult.imageData,
    mimeType: imageResult.mimeType,
    prompt,
    enhancedPrompt: imageResult.revisedPrompt || prompt,
    originalPrompt: prompt,
    metadata: {
      processingTime: Date.now() - startTime,
      generationMode,
      model,
      width,
      height,
      steps,
      guidanceScale,
      negativePrompt,
      hasReferenceImage: !!referenceImage,
      referenceStrength: strength,
      generator,
    },
  };
}

export async function generateSimple(prompt) {
  const result = await generateImageWithGemini(prompt);
  return {
    success: result.success,
    imageData: result.imageData,
    mimeType: result.mimeType,
    enhancedPrompt: prompt,
    error: result.error,
  };
}

export { generateImageMetadata } from './gemini';
export default { generateHybridImage, generateSimple };
