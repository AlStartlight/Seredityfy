import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Knowledge base: artistic styles, techniques, and descriptors for RAG retrieval
const STYLE_KNOWLEDGE = [
  'photorealistic portrait: sharp focus, studio lighting, 85mm lens, bokeh background, professional photography, skin texture detail',
  'cinematic landscape: golden hour, anamorphic lens flare, widescreen composition, atmospheric haze, epic scale, dramatic sky',
  'fantasy art: ethereal glow, magical particles, intricate details, vibrant colors, painterly style, otherworldly atmosphere',
  'cyberpunk scene: neon lights, rain-slicked streets, holographic signs, dystopian cityscape, chromatic aberration, night photography',
  'oil painting style: visible brushstrokes, rich texture, classical composition, warm palette, chiaroscuro lighting, museum quality',
  'anime illustration: clean linework, vibrant colors, dynamic pose, expressive eyes, cel shading, Japanese animation style',
  'abstract art: geometric shapes, bold color blocks, minimalist composition, textured canvas, contemporary fine art',
  'nature macro: extreme close-up, dew drops, shallow depth of field, natural bokeh, vivid colors, ultra sharp detail',
  'architectural visualization: clean lines, modern design, dramatic perspective, morning light, photorealistic rendering, CGI quality',
  'character design: full body, detailed costume, dynamic stance, concept art, video game style, highly detailed illustration',
  'surrealism: dreamlike scene, impossible physics, melting reality, Salvador Dali influence, subconscious imagery, symbolic',
  'watercolor painting: soft washes, organic bleeding edges, translucent layers, loose brushwork, paper texture visible',
  'sci-fi concept art: space environment, futuristic technology, bioluminescent elements, zero gravity, alien world, hard surface modeling',
  'vintage photography: film grain, sepia tones, vignette, retro aesthetic, 1970s color grading, analog warmth',
  'isometric illustration: clean geometry, flat design, bright colors, top-down perspective, detailed miniature world',
  'dark fantasy: gothic architecture, moonlight, fog, mysterious atmosphere, horror elements, Baroque influence, dramatic contrast',
];

let vectorStore = null;

async function getVectorStore() {
  if (vectorStore) return vectorStore;

  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });

    const docs = STYLE_KNOWLEDGE.map(
      (text, i) => new Document({ pageContent: text, metadata: { id: i } })
    );

    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    return vectorStore;
  } catch {
    return null;
  }
}

/**
 * Chunk the user prompt and retrieve relevant artistic context via RAG,
 * then assemble a rich, detailed prompt for image generation.
 */
export async function enhancePromptWithRAG(userPrompt) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, enhancedPrompt: userPrompt, error: 'OPENAI_API_KEY not set' };
  }

  try {
    // Step 1: Chunk the prompt (handles long or multi-concept prompts)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });
    const chunks = await splitter.splitText(userPrompt);

    // Step 2: Retrieve relevant style context for each chunk
    const store = await getVectorStore();
    let retrievedContext = '';

    if (store) {
      const allResults = await Promise.all(
        chunks.map(chunk => store.similaritySearch(chunk, 2))
      );
      const unique = new Map();
      allResults.flat().forEach(doc => {
        if (!unique.has(doc.pageContent)) unique.set(doc.pageContent, doc.pageContent);
      });
      retrievedContext = [...unique.values()].slice(0, 3).join('\n');
    }

    // Step 3: LangChain LLM assembles final prompt using retrieved context
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 300,
    });

    const template = PromptTemplate.fromTemplate(`
You are an expert AI image prompt engineer. Your job is to create a single, highly detailed image generation prompt.

User's original idea: {userPrompt}

Relevant artistic context (use what fits):
{context}

Rules:
- Combine the user's intent with appropriate artistic details
- Add lighting, composition, quality modifiers (8k, detailed, masterpiece)
- Keep it under 400 characters
- Return ONLY the enhanced prompt, no explanation

Enhanced prompt:`);

    const chain = template.pipe(llm);
    const result = await chain.invoke({
      userPrompt: chunks.join(' '),
      context: retrievedContext || 'photorealistic, highly detailed, professional quality',
    });

    const enhancedPrompt = result.content?.trim() || userPrompt;

    return {
      success: true,
      enhancedPrompt,
      originalPrompt: userPrompt,
      chunksProcessed: chunks.length,
      contextUsed: !!retrievedContext,
    };
  } catch (error) {
    console.warn('[RAG] Prompt enhancement failed:', error.message);
    return { success: false, enhancedPrompt: userPrompt, error: error.message };
  }
}
