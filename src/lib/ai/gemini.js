import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  responseModalities: ['image', 'text'],
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function generateImageWithGemini(prompt, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig,
      safetySettings,
    });

    const enhancedPrompt = enhancePrompt(prompt);
    
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;

    const imageParts = response.candidates?.[0]?.content?.parts?.filter(
      (part) => part.inlineData?.mimeType?.startsWith('image/')
    );

    if (imageParts && imageParts.length > 0) {
      const imageData = imageParts[0].inlineData;
      return {
        success: true,
        imageData: imageData.data,
        mimeType: imageData.mimeType,
        text: response.text(),
        prompt: enhancedPrompt,
      };
    }

    return {
      success: false,
      error: 'No image generated',
      text: response.text(),
    };
  } catch (error) {
    console.error('Gemini generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image with Gemini',
    };
  }
}

function enhancePrompt(prompt) {
  const styleModifiers = [
    'highly detailed',
    'professional photography',
    '8k resolution',
    'cinematic lighting',
    'studio quality',
  ];
  
  const randomStyles = styleModifiers
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .join(', ');
  
  return `${prompt}, ${randomStyles}, award-winning, masterpiece`;
}

export async function generateImageMetadata(prompt, imageUrl) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const metadataPrompt = `
      Analyze this AI-generated image and provide detailed metadata in JSON format.
      Prompt used: "${prompt}"
      
      Provide:
      1. tags: array of relevant tags (max 10)
      2. category: one of [portrait, landscape, abstract, sci-fi, fantasy, architecture, nature, character, art]
      3. description: brief description (max 100 chars)
      4. style: artistic style detected
      5. mood: emotional tone
      6. colors: dominant colors (max 5)
      7. quality_score: 1-10 rating
      
      Return ONLY valid JSON, no markdown.
    `;

    const result = await model.generateContent([
      { text: metadataPrompt },
      { fileData: { mimeType: 'image/png', uri: imageUrl } }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      tags: [],
      category: 'abstract',
      description: prompt.slice(0, 100),
      style: 'digital art',
      mood: 'neutral',
      colors: [],
      quality_score: 7,
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
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
}

export default {
  generateImageWithGemini,
  generateImageMetadata,
};
