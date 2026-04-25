import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { extractCharacter, buildCharacterCard, saveCharacter, getCharacter } from './characterStore';

// Knowledge base gaya visual untuk RAG retrieval
const STYLE_KNOWLEDGE = [
  'photorealistic portrait: sharp focus, studio lighting, 85mm lens, bokeh background, professional photography, skin texture detail, high resolution',
  'cinematic landscape: golden hour, anamorphic lens flare, widescreen composition, atmospheric haze, epic scale, dramatic sky, volumetric light',
  'fantasy art: ethereal glow, magical particles, intricate details, vibrant colors, painterly style, otherworldly atmosphere, concept art quality',
  'cyberpunk scene: neon lights, rain-slicked streets, holographic signs, dystopian cityscape, chromatic aberration, night photography, blade runner aesthetic',
  'oil painting style: visible brushstrokes, rich texture, classical composition, warm palette, chiaroscuro lighting, museum quality, renaissance influence',
  'anime illustration: clean linework, vibrant colors, dynamic pose, expressive eyes, cel shading, Japanese animation style, manga influence',
  'abstract art: geometric shapes, bold color blocks, minimalist composition, textured canvas, contemporary fine art, Mondrian influence',
  'nature macro: extreme close-up, dew drops, shallow depth of field, natural bokeh, vivid colors, ultra sharp detail, National Geographic quality',
  'architectural visualization: clean lines, modern design, dramatic perspective, morning light, photorealistic rendering, CGI quality, interior design',
  'character design: full body, detailed costume, dynamic stance, concept art, video game style, highly detailed illustration, character sheet',
  'surrealism: dreamlike scene, impossible physics, melting reality, Salvador Dali influence, subconscious imagery, symbolic elements',
  'watercolor painting: soft washes, organic bleeding edges, translucent layers, loose brushwork, paper texture, impressionistic style',
  'sci-fi concept art: space environment, futuristic technology, bioluminescent elements, zero gravity, alien world, hard surface modeling',
  'vintage photography: film grain, sepia tones, vignette, retro aesthetic, 1970s color grading, analog warmth, nostalgia',
  'dark fantasy: gothic architecture, moonlight, fog, mysterious atmosphere, horror elements, Baroque influence, dramatic contrast',
  'isometric illustration: clean geometry, flat design, bright colors, top-down perspective, detailed miniature world, game asset style',
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
 * Pipeline lengkap:
 * 1. Chunk prompt → 2. RAG retrieve style context → 3. Character extraction & consistency
 * 4. Assemble final prompt dengan GPT → siap untuk DALL-E 3
 */
export async function enhancePromptWithRAG(prompt, options = {}) {
  const { userId = null, characterName = null } = options;

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, enhancedPrompt: prompt, error: 'OPENAI_API_KEY not set' };
  }

  try {
    // Step 1: Chunk prompt — tangani prompt panjang atau multi-konsep
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 20,
    });
    const chunks = await splitter.splitText(prompt);

    // Step 2: RAG — retrieve style context relevan untuk setiap chunk
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

    // Step 3: Character consistency
    let characterCard = '';
    let detectedCharacter = null;

    if (userId) {
      // Coba ambil karakter tersimpan dulu
      const savedChar = await getCharacter(userId, characterName);
      if (savedChar) {
        characterCard = buildCharacterCard(savedChar);
        console.log('[RAG] Using saved character:', savedChar.name);
      } else {
        // Ekstrak karakter dari prompt dan simpan untuk sesi berikutnya
        detectedCharacter = await extractCharacter(prompt);
        if (detectedCharacter) {
          characterCard = buildCharacterCard(detectedCharacter);
          await saveCharacter(userId, detectedCharacter);
          console.log('[RAG] New character detected and saved:', detectedCharacter.name);
        }
      }
    } else {
      // Tanpa userId, tetap ekstrak karakter tapi tidak disimpan
      detectedCharacter = await extractCharacter(prompt);
      if (detectedCharacter) {
        characterCard = buildCharacterCard(detectedCharacter);
      }
    }

    // Step 4: LangChain LLM rakit prompt final
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 400,
    });

    const template = PromptTemplate.fromTemplate(`
You are an expert DALL-E 3 prompt engineer. Create a single detailed image generation prompt.

Original idea: {prompt}

{characterSection}

Relevant artistic styles (use what fits):
{context}

Rules:
- If character info is provided, include ALL character details exactly as specified for visual consistency
- Add lighting, composition, atmosphere, and technical quality modifiers
- End with quality tags: masterpiece, highly detailed, 8k resolution
- Keep under 450 characters total
- Return ONLY the final prompt, no explanation or quotes

Final prompt:`);

    const chain = template.pipe(llm);
    const result = await chain.invoke({
      prompt: chunks.join(' '),
      characterSection: characterCard
        ? `Character to maintain consistency:\n${characterCard}`
        : 'No specific character.',
      context: retrievedContext || 'photorealistic, professional quality, highly detailed',
    });

    const enhancedPrompt = result.content?.trim() || prompt;

    return {
      success: true,
      enhancedPrompt,
      originalPrompt: prompt,
      chunksProcessed: chunks.length,
      characterDetected: !!(characterCard),
      characterName: detectedCharacter?.name || characterName || null,
    };
  } catch (error) {
    console.warn('[RAG] Enhancement failed:', error.message);
    return { success: false, enhancedPrompt: prompt, error: error.message };
  }
}
