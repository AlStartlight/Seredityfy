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

    if (generationMode === 'HYBRID' || generationMode === 'CHATGPT_ONLY') {
      const enhancementResult = await enhancePromptWithChatGPT(prompt);
      if (enhancementResult.success) {
        enhancedPrompt = enhancementResult.enhancedPrompt;
      }
    }

    if (referenceImage) {
      const analysisResult = await analyzeImageWithGPT4V(referenceImage);
      if (analysisResult.success) {
        imageAnalysis = analysisResult.description;
        enhancedPrompt = `${enhancedPrompt}. Style reference: ${analysisResult.description}`;
      }
    }

    const imageResult = await generateImageWithGemini(enhancedPrompt, {
      referenceImage,
      strength,
    });

    if (!imageResult.success) {
      return {
        success: false,
        error: imageResult.error || 'Image generation failed',
        prompt: enhancedPrompt,
      };
    }

    if (generationMode === 'HYBRID' || generationMode === 'CHATGPT_ONLY') {
      const embeddingResult = await generatePromptEmbedding(enhancedPrompt);
      if (embeddingResult.success) {
        promptEmbedding = embeddingResult.embedding;
      }
    }

    const metadata = await generateGeminiMetadata(prompt, imageResult.imageData);

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      imageData: imageResult.imageData,
      mimeType: imageResult.mimeType,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      metadata: {
        ...metadata,
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
export { generateImageWithGemini, generateImageMetadata } from './gemini';

export default {
  generateHybridImage,
  generateSimple,
};
