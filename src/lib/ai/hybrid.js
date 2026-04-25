import { generateImageWithDALLE } from './chatgpt';
import { generateImageWithGemini, generateImageMetadata } from './gemini';
import { enhancePromptWithRAG } from './promptRag';

export async function generateHybridImage({
  prompt,
  userId = null,
  characterName = null,
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

  try {
    let finalPrompt = prompt;
    let ragMeta = {};

    // Step 1: RAG + LangChain + Character Consistency
    // Chunk → retrieve style context → extract/inject character → assemble dengan GPT-4o-mini
    try {
      const ragResult = await enhancePromptWithRAG(prompt, { userId, characterName });
      if (ragResult.success) {
        finalPrompt = ragResult.enhancedPrompt;
        ragMeta = {
          chunksProcessed: ragResult.chunksProcessed,
          characterDetected: ragResult.characterDetected,
          characterName: ragResult.characterName,
        };
        console.log(
          `[Hybrid] RAG done — chunks: ${ragResult.chunksProcessed}, ` +
          `character: ${ragResult.characterDetected}, name: ${ragResult.characterName}`
        );
      }
    } catch (ragErr) {
      console.warn('[Hybrid] RAG skipped, using raw prompt:', ragErr.message);
    }

    // Step 2: Gemini image generation (primary)
    let imageResult = await generateImageWithGemini(finalPrompt, { width, height });

    // Step 3: DALL-E 3 fallback jika Gemini gagal
    if (!imageResult.success) {
      console.warn('[Hybrid] Gemini failed, falling back to DALL-E 3:', imageResult.error);
      imageResult = await generateImageWithDALLE(finalPrompt, { width, height });
    }

    if (!imageResult.success) {
      return {
        success: false,
        error: imageResult.error || 'All image generators failed',
        prompt: finalPrompt,
      };
    }

    // DALL-E 3 kadang merevisi prompt — gunakan revised_prompt jika ada
    const usedPrompt = imageResult.revisedPrompt || finalPrompt;

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      imageData: imageResult.imageData,
      mimeType: imageResult.mimeType,
      prompt: usedPrompt,
      enhancedPrompt: usedPrompt,
      originalPrompt: prompt,
      metadata: {
        processingTime,
        generationMode,
        model,
        width,
        height,
        steps,
        guidanceScale,
        negativePrompt,
        hasReferenceImage: !!referenceImage,
        referenceStrength: strength,
        generator: imageResult.model || 'dall-e-3',
        rag: ragMeta,
      },
    };
  } catch (error) {
    console.error('[Hybrid] Generation error:', error);
    return {
      success: false,
      error: error.message || 'Generation failed',
      prompt,
    };
  }
}

export async function generateSimple(prompt) {
  const ragResult = await enhancePromptWithRAG(prompt);
  const enhanced = ragResult.success ? ragResult.enhancedPrompt : prompt;
  const imageResult = await generateImageWithGemini(enhanced)
    .then(r => r.success ? r : generateImageWithDALLE(enhanced));
  return {
    success: imageResult.success,
    imageData: imageResult.imageData,
    mimeType: imageResult.mimeType,
    enhancedPrompt: enhanced,
    error: imageResult.error,
  };
}

export { generateImageMetadata } from './gemini';

export default { generateHybridImage, generateSimple };
