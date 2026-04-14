const path = require('path');

// Add the project root to require paths
const projectRoot = path.resolve(__dirname, '../..');
require('module-alias').addAliases({
  '@': projectRoot,
  '@src': path.join(projectRoot, 'src'),
});

require('dotenv').config({ path: path.join(projectRoot, '.env') });

const Queue = require('bull');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI: GenAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const OpenAI = require('openai');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Gemini
const genAI = new GenAI(process.env.GEMINI_API_KEY || '');

// Redis config
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

const imageGenerationQueue = new Queue('image-generation', redisConfig);

// AI Functions
async function enhancePromptWithChatGPT(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, enhancedPrompt: prompt };
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert prompt engineer for AI image generation.' },
        { role: 'user', content: `Enhance this image generation prompt: "${prompt}"` },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    return {
      success: true,
      enhancedPrompt: completion.choices[0]?.message?.content?.trim() || prompt,
    };
  } catch (error) {
    console.error('ChatGPT enhancement error:', error);
    return { success: false, enhancedPrompt: prompt };
  }
}

async function generatePromptEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false };
  }
  try {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return {
      success: true,
      embedding: embedding.data[0].embedding,
    };
  } catch (error) {
    console.error('Embedding error:', error);
    return { success: false };
  }
}

async function generateImageWithOpenAI(prompt, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OPENAI_API_KEY not configured' };
  }
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    });

    const image = response.data[0];
    
    if (!image || !image.url) {
      return { success: false, error: 'No image generated' };
    }

    return {
      success: true,
      imageUrl: image.url,
      prompt: prompt,
      revisedPrompt: image.revised_prompt,
    };
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return { success: false, error: error.message };
  }
}

async function generateImageWithGemini(prompt, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY not configured' };
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            responseModalities: ['image', 'text'],
          },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'API error', text: JSON.stringify(data) };
    }

    const imageParts = data.candidates?.[0]?.content?.parts?.filter(
      (part) => part.inlineData?.mimeType?.startsWith('image/')
    );

    if (imageParts && imageParts.length > 0) {
      const imageData = imageParts[0].inlineData;
      return {
        success: true,
        imageData: imageData.data,
        mimeType: imageData.mimeType,
        text: data.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || '',
        prompt: prompt,
      };
    }

    return { success: false, error: 'No image generated', text: data.text };
  } catch (error) {
    console.error('Gemini generation error:', error);
    return { success: false, error: error.message };
  }
}

async function uploadBase64Image(base64Data, mimeType = 'image/png', folder = 'seredityfy') {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${base64Data}`,
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }],
      }
    );
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: error.message };
  }
}

async function uploadFromUrl(imageUrl, folder = 'seredityfy') {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }],
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload from URL error:', error);
    return { success: false, error: error.message };
  }
}

const COPYRIGHTED_TERMS = [
  'naruto', 'sasuke', 'sakura', 'kakashi', 'hinata', 'shikamaru',
  'rock lee', 'gaara', 'neji', 'itachi', 'madara', 'obito',
  'minato', 'jiraiya', 'orochimaru', 'tsunade', 'pain', 'konan',
  'deidara', 'sasori', 'hidan', 'kakuzu', 'kisame', 'haku', 'zabuza',
  'goku', 'vegeta', 'piccolo', 'trunks', 'gohan', 'frieza', 'cell', 'bulma',
  'ichigo', 'rukia', 'aizen', 'byakuya', 'renji',
  'natsu', 'lucy', 'gray', 'erza', 'wendy',
  'gon', 'killua', 'kurapika', 'leorio', 'hisoka',
  'luffy', 'zoro', 'sanji', 'nami', 'chopper', 'robin', 'franky', 'brook',
  'ace', 'sabo', 'whitebeard', 'blackbeard', 'kaido',
  'tanjiro', 'nezuko', 'zenitsu', 'inosuke',
  'gojo', 'sukuna', 'itadori', 'megumi',
  'midoriya', 'bakugo', 'todoroki', 'all might',
  'saitama', 'genos',
  'mob', 'reigen',
  'rimuru', 'veldora',
  'ainz', 'albedo', 'shalltear',
  'usagi', 'sailor',
  'subaru', 'emilia', 'ram', 'rem',
  'kirito', 'asuna',
  'light', 'ryuk',
  'eren', 'mikasa', 'levi',
  'kaneki',
  'pikachu', 'charizard', 'blastoise',
  'batman', 'superman', 'spiderman', 'ironman',
  'homer', 'bart',
  'loki', 'thor',
];

function sanitizePrompt(prompt) {
  let sanitized = prompt;
  let foundTerms = [];
  
  for (const term of COPYRIGHTED_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
    if (regex.test(sanitized)) {
      foundTerms.push(term);
      sanitized = sanitized.replace(regex, 'Warrior');
    }
  }
  
  if (foundTerms.length > 0) {
    console.warn(`[Worker] Blocked copyrighted terms: ${foundTerms.slice(0, 6).join(', ')}${foundTerms.length > 6 ? '...' : ''}`);
  }
  
  return sanitized;
}

async function generateHybridImage(data) {
  const { prompt, generationMode = 'HYBRID', referenceImage, strength = 0.7 } = data;
  const startTime = Date.now();

  try {
    if (referenceImage) {
      console.warn(`[Worker] Reference image provided but DALL-E 3 doesn't support image-to-image. Using text-to-image only.`);
    }

    let enhancedPrompt = prompt;
    
    enhancedPrompt = sanitizePrompt(prompt);

    if (generationMode === 'HYBRID' || generationMode === 'CHATGPT_ONLY') {
      const enhancementResult = await enhancePromptWithChatGPT(enhancedPrompt);
      if (enhancementResult.success) {
        enhancedPrompt = sanitizePrompt(enhancementResult.enhancedPrompt);
      }
    }

    console.log(`[Worker] Final prompt for generation: ${enhancedPrompt.substring(0, 200)}...`);
    let imageResult = await generateImageWithOpenAI(enhancedPrompt);

    if (!imageResult.success) {
      const geminiResult = await generateImageWithGemini(enhancedPrompt);
      if (geminiResult.success) {
        imageResult = geminiResult;
      }
    }

    if (!imageResult.success) {
      return { success: false, error: imageResult.error || 'Image generation failed', prompt: enhancedPrompt };
    }

    if (imageResult.imageUrl) {
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        imageUrl: imageResult.imageUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        metadata: {
          processingTime,
          generationMode,
          hasReferenceImage: !!referenceImage,
          provider: 'openai',
        },
        promptEmbedding: null,
      };
    }

    let promptEmbedding = null;
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
      originalPrompt: prompt,
      metadata: {
        processingTime,
        generationMode,
        hasReferenceImage: !!referenceImage,
        referenceStrength: strength,
      },
      promptEmbedding,
    };
  } catch (error) {
    console.error('Hybrid generation error:', error);
    return { success: false, error: error.message, prompt };
  }
}

// Process function
async function processImageGeneration(job) {
  const {
    imageId,
    prompt,
    userId,
    model,
    generationMode,
    width,
    height,
    steps,
    guidanceScale,
    negativePrompt,
    visibility,
    referenceImage,
    strength,
  } = job.data;

  console.log(`[Worker] Processing image ${imageId}${referenceImage ? ' (with reference)' : ''}`);

  try {
    await job.progress(10);

    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { status: 'PENDING' },
    });

    await job.progress(30);

    const result = await generateHybridImage({
      prompt,
      userId,
      model,
      generationMode,
      width,
      height,
      steps,
      guidanceScale,
      negativePrompt,
      referenceImage,
      strength,
    });

    if (!result.success) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: { status: 'FAILED' },
      });
      throw new Error(result.error || 'Generation failed');
    }

    await job.progress(60);

    let uploadResult;
    let finalImageUrl;
    
    if (result.imageUrl) {
      console.log(`[Worker] Uploading OpenAI image to Cloudinary from: ${result.imageUrl}`);
      uploadResult = await uploadFromUrl(result.imageUrl, `seredityfy/users/${userId || 'anonymous'}`);
      finalImageUrl = uploadResult.url;
    } else {
      uploadResult = await uploadBase64Image(
        result.imageData,
        result.mimeType || 'image/png',
        `seredityfy/users/${userId || 'anonymous'}`
      );
      finalImageUrl = uploadResult.url;
    }

    if (!uploadResult.success || !finalImageUrl) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: { status: 'FAILED' },
      });
      throw new Error('Failed to upload image');
    }
    
    console.log(`[Worker] Image uploaded to Cloudinary: ${finalImageUrl}`);

    await job.progress(80);

    const imageWidth = uploadResult.width || 1024;
    const imageHeight = uploadResult.height || 1024;

    await prisma.generatedImage.update({
      where: { id: imageId },
      data: {
        status: 'COMPLETED',
        imageUrl: finalImageUrl,
        thumbnailUrl: finalImageUrl,
        enhancedPrompt: result.prompt,
        metadata: result.metadata,
        width: imageWidth,
        height: imageHeight,
        visibility: visibility || 'PUBLIC',
      },
    });

    if (result.promptEmbedding) {
      await prisma.promptEmbedding.upsert({
        where: { imageId },
        create: {
          imageId,
          embedding: result.promptEmbedding,
          model: 'text-embedding-3-small',
        },
        update: {
          embedding: result.promptEmbedding,
        },
      });
    }

    if (userId) {
      await prisma.promptHistory.create({
        data: {
          userId,
          prompt,
          enhancedPrompt: result.prompt,
          model,
        },
      });
    }

    await job.progress(100);
    console.log(`[Worker] ✓ Image ${imageId} generated successfully`);

    return {
      success: true,
      imageId,
      imageUrl: uploadResult.url,
    };
  } catch (error) {
    console.error(`[Worker] ✗ Error processing image ${imageId}:`, error.message);

    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}

// Start worker
async function startWorker() {
  console.log('[Worker] Starting AI Image Generation Worker...');
  console.log('[Worker] Redis:', `${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`);

  imageGenerationQueue.process('generate', 2, processImageGeneration);

  imageGenerationQueue.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  imageGenerationQueue.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  imageGenerationQueue.on('progress', (job, progress) => {
    console.log(`[Worker] Job ${job.id} progress: ${progress}%`);
  });

  console.log('[Worker] ✓ Worker is ready and listening for jobs');
  console.log('[Worker] Press Ctrl+C to exit\n');
}

startWorker().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down...');
  await prisma.$disconnect();
  await imageGenerationQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] Shutting down...');
  await prisma.$disconnect();
  await imageGenerationQueue.close();
  process.exit(0);
});
