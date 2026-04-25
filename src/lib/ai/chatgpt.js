import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are an expert prompt engineer for AI image generation.
Your role is to enhance user prompts to get better, more detailed, and more visually stunning images.

Guidelines:
1. Add specific visual details (lighting, composition, atmosphere)
2. Include artistic style references when appropriate
3. Add technical quality modifiers (8k, detailed, sharp focus)
4. Enhance the mood and emotional impact
5. Keep the original intent of the user's prompt
6. Remove contradictory or confusing elements
7. Add appropriate style keywords

Always return enhanced prompts that are:
- More descriptive
- Technically optimized for AI image generation
- Visually compelling
- Maximum 500 characters`;

export async function enhancePromptWithChatGPT(userPrompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Enhance this image generation prompt:\n\n"${userPrompt}"\n\nEnhanced prompt:` },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const enhancedPrompt = completion.choices[0]?.message?.content?.trim();
    
    return {
      success: true,
      originalPrompt: userPrompt,
      enhancedPrompt: enhancedPrompt || userPrompt,
    };
  } catch (error) {
    console.error('ChatGPT enhancement error:', error);
    return {
      success: false,
      originalPrompt: userPrompt,
      enhancedPrompt: userPrompt,
      error: error.message,
    };
  }
}

export async function generatePromptEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return {
      success: true,
      embedding: embedding.data[0].embedding,
      model: 'text-embedding-3-small',
    };
  } catch (error) {
    console.error('Embedding generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function analyzeImageWithGPT4V(imageUrl) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide a detailed description suitable for AI image generation. Include: subject, style, lighting, composition, mood, and any notable features. Format as a detailed prompt.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    return {
      success: true,
      description: response.choices[0]?.message?.content,
    };
  } catch (error) {
    console.error('GPT-4V analysis error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// gpt-image-1 supported sizes: 1024x1024, 1536x1024, 1024x1536
function getDalleSize(width, height) {
  if (width > height) return '1536x1024';
  if (height > width) return '1024x1536';
  return '1024x1024';
}

// Map legacy DALL-E quality values to gpt-image-1 values
function mapQuality(quality) {
  const map = { standard: 'medium', hd: 'high' };
  return map[quality] ?? quality;
}

export async function generateImageWithDALLE(prompt, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const { width = 1024, height = 1024, quality = 'auto' } = options;
  const size = getDalleSize(width, height);

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      quality: mapQuality(quality),
      // response_format tidak didukung oleh gpt-image-1; b64_json selalu dikembalikan
    });

    const b64 = response.data[0]?.b64_json;
    if (!b64) {
      return { success: false, error: 'No image data returned from gpt-image-1' };
    }

    return {
      success: true,
      imageData: b64,
      mimeType: 'image/png',
      revisedPrompt: prompt,
    };
  } catch (error) {
    console.error('gpt-image-1 generation error:', error);
    return { success: false, error: error.message };
  }
}

export async function generateImageMetadataWithChatGPT(prompt, imageUrl) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate metadata for this AI image.
Prompt used: "${prompt}"

Return valid JSON with:
{
  "tags": ["tag1", "tag2", ...],
  "category": "one of: portrait, landscape, abstract, sci-fi, fantasy, architecture, nature, character, art, other",
  "description": "brief description max 100 chars",
  "style": "artistic style",
  "mood": "emotional tone",
  "colors": ["color1", "color2", ...],
  "quality_score": number 1-10,
  "nsfw_score": number 0-1
}`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      tags: [],
      category: 'other',
      description: prompt.slice(0, 100),
      style: 'digital art',
      mood: 'neutral',
      colors: [],
      quality_score: 7,
      nsfw_score: 0,
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      tags: [],
      category: 'other',
      description: prompt.slice(0, 100),
      style: 'digital art',
      mood: 'neutral',
      colors: [],
      quality_score: 7,
      nsfw_score: 0,
    };
  }
}

export default {
  enhancePromptWithChatGPT,
  generatePromptEmbedding,
  analyzeImageWithGPT4V,
  generateImageMetadataWithChatGPT,
};
