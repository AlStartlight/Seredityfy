import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CHARACTER_TTL = 60 * 60 * 24 * 7; // 7 hari

/**
 * Ekstrak deskripsi karakter dari prompt menggunakan GPT.
 * Mengembalikan null jika prompt tidak mengandung karakter.
 */
export async function extractCharacter(prompt) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 250,
    });

    const template = PromptTemplate.fromTemplate(`
Analyze this image prompt and extract character details if a specific character exists.

Prompt: {prompt}

If a character exists, return a JSON object with these fields:
{{
  "hasCharacter": true,
  "name": "character name or 'unnamed character'",
  "gender": "male/female/non-binary/unknown",
  "age": "young/adult/elderly/unknown",
  "hairColor": "hair color and style",
  "eyeColor": "eye color",
  "skinTone": "skin tone description",
  "bodyType": "body type",
  "clothing": "detailed clothing description",
  "distinctiveFeatures": "scars, tattoos, accessories, etc.",
  "style": "art style if specified (anime, realistic, cartoon, etc.)"
}}

If NO character exists (just scenery, objects, abstract), return:
{{"hasCharacter": false}}

Return ONLY valid JSON, no explanation.`);

    const chain = template.pipe(llm);
    const result = await chain.invoke({ prompt });
    const content = result.content?.trim();

    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.hasCharacter ? parsed : null;
  } catch (err) {
    console.warn('[CharacterStore] Extract failed:', err.message);
    return null;
  }
}

/**
 * Bangun "character card" — deskripsi konsisten untuk diinjeksi ke setiap prompt.
 */
export function buildCharacterCard(character) {
  if (!character) return '';

  const parts = [
    character.name !== 'unnamed character' ? `character named ${character.name}` : 'a character',
    character.gender !== 'unknown' ? character.gender : '',
    character.age !== 'unknown' ? `(${character.age})` : '',
    character.hairColor ? `with ${character.hairColor} hair` : '',
    character.eyeColor ? `and ${character.eyeColor} eyes` : '',
    character.skinTone ? `${character.skinTone} skin` : '',
    character.bodyType ? `${character.bodyType} build` : '',
    character.clothing ? `wearing ${character.clothing}` : '',
    character.distinctiveFeatures ? `${character.distinctiveFeatures}` : '',
  ].filter(Boolean);

  return `[CHARACTER CONSISTENCY: ${parts.join(', ')}]`;
}

/**
 * Simpan karakter ke Redis dengan key berbasis userId + characterName.
 */
export async function saveCharacter(userId, character) {
  if (!character) return;
  const key = `character:${userId}:${character.name?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;
  try {
    await redis.set(key, JSON.stringify(character), { ex: CHARACTER_TTL });
    console.log('[CharacterStore] Saved character:', key);
  } catch (err) {
    console.warn('[CharacterStore] Save failed:', err.message);
  }
}

/**
 * Ambil karakter yang tersimpan untuk user.
 * Mengembalikan karakter pertama yang ditemukan jika ada.
 */
export async function getCharacter(userId, characterName) {
  try {
    const key = characterName
      ? `character:${userId}:${characterName.toLowerCase().replace(/\s+/g, '-')}`
      : `character:${userId}:default`;

    const data = await redis.get(key);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  } catch (err) {
    console.warn('[CharacterStore] Get failed:', err.message);
    return null;
  }
}

/**
 * List semua karakter tersimpan untuk user.
 */
export async function listCharacters(userId) {
  try {
    const pattern = `character:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (!keys.length) return [];

    const chars = await Promise.all(keys.map(k => redis.get(k)));
    return chars.filter(Boolean).map(c => (typeof c === 'string' ? JSON.parse(c) : c));
  } catch (err) {
    console.warn('[CharacterStore] List failed:', err.message);
    return [];
  }
}
