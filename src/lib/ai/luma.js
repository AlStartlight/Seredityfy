const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1';

export async function generateVideoWithLuma({ prompt, imageUrl, aspectRatio = '16:9', duration = 8 }) {
  const apiKey = process.env.LUMA_API_KEY;

  if (!apiKey) {
    console.warn('[Luma] No LUMA_API_KEY configured, falling back to mock');
    return mockGenerateVideo({ prompt, imageUrl, duration });
  }

  try {
    const res = await fetch(`${LUMA_API_BASE}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ray-2',
        prompt,
        image_url: imageUrl,
        aspect_ratio: aspectRatio,
        duration,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Luma API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return { success: true, generationId: data.id, state: data.state };
  } catch (err) {
    console.error('[Luma] API call failed:', err.message);
    console.warn('[Luma] Falling back to mock');
    return mockGenerateVideo({ prompt, imageUrl, duration });
  }
}

export async function pollLumaGeneration(generationId) {
  const apiKey = process.env.LUMA_API_KEY;

  if (!apiKey) {
    return pollMockGeneration(generationId);
  }

  try {
    const res = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);

    const data = await res.json();
    return {
      success: data.state === 'completed',
      state: data.state,
      videoUrl: data.assets?.video_url || null,
      thumbnailUrl: data.assets?.thumbnail_url || null,
      error: data.failure_reason || null,
    };
  } catch (err) {
    console.error('[Luma] Poll failed:', err.message);
    return { success: false, state: 'failed', error: err.message };
  }
}

/* ── Mock (simulated) ──────────────────────────────────────────────────── */

const MOCK_GENERATIONS = new Map();

async function mockGenerateVideo({ prompt, imageUrl, duration }) {
  const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`;

  MOCK_GENERATIONS.set(id, {
    state: 'completed',
    videoUrl,
    thumbnailUrl: imageUrl,
  });

  return { success: true, generationId: id, state: 'completed', mockVideoUrl: videoUrl };
}

async function pollMockGeneration(generationId) {
  const gen = MOCK_GENERATIONS.get(generationId);
  if (!gen) return { success: false, state: 'failed', error: 'Generation not found' };
  return {
    success: gen.state === 'completed',
    state: gen.state,
    videoUrl: gen.videoUrl,
    thumbnailUrl: gen.thumbnailUrl,
    error: null,
  };
}

export default { generateVideoWithLuma, pollLumaGeneration };
