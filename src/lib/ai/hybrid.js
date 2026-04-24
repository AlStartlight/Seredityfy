import { enhancePromptWithChatGPT, generatePromptEmbedding, analyzeImageWithGPT4V } from './chatgpt';
import { generateImageWithGemini, generateImageMetadata as generateGeminiMetadata } from './gemini';

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

  try {
    let enhancedPrompt = prompt;
    let promptEmbedding = null;
    let imageAnalysis = null;

    // Step 1: Enhance prompt with ChatGPT
    if (generationMode === 'HYBRID' || generationMode === 'CHATGPT_ONLY') {
      const enhancementResult = await enhancePromptWithChatGPT(prompt);
      if (enhancementResult.success) {
        enhancedPrompt = enhancementResult.enhancedPrompt;
      }
    }

    // Step 2: Analyse reference image if provided
    if (referenceImage) {
      const analysisResult = await analyzeImageWithGPT4V(referenceImage);
      if (analysisResult.success) {
        imageAnalysis = analysisResult.description;
        enhancedPrompt = `${enhancedPrompt}. Style reference: ${analysisResult.description}`;
      }
    }

    // Step 3: Generate image with Google Imagen 3
    const imageResult = await generateImageWithGemini(enhancedPrompt, { width, height });

    if (!imageResult.success) {
      return {
        success: false,
        error: imageResult.error || 'Image generation failed',
        prompt: enhancedPrompt,
      };
    }

    // Use DALL-E's revised prompt if available
    if (imageResult.revisedPrompt) {
      enhancedPrompt = imageResult.revisedPrompt;
    }

    // Step 4: Generate prompt embedding
    if (generationMode === 'HYBRID' || generationMode === 'CHATGPT_ONLY') {
      const embeddingResult = await generatePromptEmbedding(enhancedPrompt);
      if (embeddingResult.success) {
        promptEmbedding = embeddingResult.embedding;
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      imageData: imageResult.imageData,
      mimeType: imageResult.mimeType,
      prompt: enhancedPrompt,
      enhancedPrompt,
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
        imageAnalysis,
        generator: 'imagen-3.0',
      },
      promptEmbedding,
    };
  } catch (error) {
    console.error('Hybrid generation error:', error);
    return {
      success: false,
      error: error.message || 'Hybrid generation failed',
      prompt,
    };
  }
}

export async function generateSimple(prompt) {
  const enhancedResult = await enhancePromptWithChatGPT(prompt);
  const imageResult = await generateImageWithGemini(
    enhancedResult.success ? enhancedResult.enhancedPrompt : prompt
  );

  return {
    success: imageResult.success,
    imageData: imageResult.imageData,
    mimeType: imageResult.mimeType,
    enhancedPrompt: enhancedResult.enhancedPrompt,
    error: imageResult.error,
  };
}

export { enhancePromptWithChatGPT, generatePromptEmbedding, analyzeImageWithGPT4V } from './chatgpt';
export { generateImageMetadata } from './gemini';

export default {
  generateHybridImage,
  generateSimple,
};
