const GEMINI_VEO_ENDPOINT = model =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const VERTEX_VEO_ENDPOINT = (project, location) =>
  `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/veo-3.1:predict`;

/* ── Mocks ─────────────────────────────────────────────────────────────── */
const MOCK_GENERATIONS = new Map();

function mockVeoGenerate({ prompt, imageUrl, duration }) {
  const id = `veo_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`;

  MOCK_GENERATIONS.set(id, {
    state: 'completed',
    videoUrl,
    thumbnailUrl: imageUrl,
  });

  return { success: true, generationId: id, state: 'completed', mockVideoUrl: videoUrl };
}

/* ── Auth helpers ──────────────────────────────────────────────────────── */
async function getAccessToken() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  }
  return null;
}

/* ── Gemini API Veo (if model is available on Gemini API) ──────────────── */
async function tryGeminiApiVeo({ prompt, imageBase64, imageMime, apiKey }) {
  const model = 'veo-3.1-generate-preview';

  try {
    const parts = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: imageMime || 'image/png', data: imageBase64 } });
    }

    const res = await fetch(GEMINI_VEO_ENDPOINT(model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['VIDEO', 'TEXT'],
          temperature: 0.9,
        },
      }),
    });

    if (!res.ok) {
      console.warn(`[Veo] ${model} failed: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const videoPart = data.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData?.mimeType?.startsWith('video/')
    );

    if (videoPart) {
      console.log(`[Veo] Video generated with ${model}`);
      return {
        success: true,
        videoBase64: videoPart.inlineData.data,
        mimeType: videoPart.inlineData.mimeType,
        state: 'completed',
      };
    }

    console.warn(`[Veo] No video in ${model} response`);
  } catch (err) {
    console.warn(`[Veo] ${model} error:`, err.message);
  }

  return null;
}

/* ── Vertex AI Veo 3.1 ─────────────────────────────────────────────────── */
async function tryVertexAiVeo({ prompt, imageBase64, imageMime, duration, aspectRatio }) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    console.warn('[Veo] GOOGLE_CLOUD_PROJECT not set, skipping Vertex AI');
    return null;
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('[Veo] No access token available for Vertex AI');
      return null;
    }

    const res = await fetch(VERTEX_VEO_ENDPOINT(project, location), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt,
          image: { bytesBase64Encoded: imageBase64 },
          ...(aspectRatio ? { aspectRatio } : {}),
          ...(duration ? { durationSeconds: duration } : {}),
        }],
        parameters: {
          sampleCount: 1,
          personGeneration: 'allow_adult',
          enhancePrompt: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Vertex AI error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const prediction = data.predictions?.[0];

    if (!prediction) throw new Error('No prediction returned');

    if (prediction.bytesBase64Encoded) {
      const videoData = `data:${prediction.mimeType || 'video/mp4'};base64,${prediction.bytesBase64Encoded}`;
      return {
        success: true,
        videoData,
        mimeType: prediction.mimeType || 'video/mp4',
        generationId: `vertex_${Date.now()}`,
        state: 'completed',
      };
    }

    if (prediction.gcsUri) {
      /* Proxy through server — browser can't access private GCS URIs */
      const videoRes = await fetch(prediction.gcsUri, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (videoRes.ok) {
        const videoBuffer = await videoRes.arrayBuffer();
        const base64 = Buffer.from(videoBuffer).toString('base64');
        return {
          success: true,
          videoData: `data:video/mp4;base64,${base64}`,
          state: 'completed',
        };
      }

      console.warn('[Veo] GCS fetch failed, returning URI anyway');
      return {
        success: true,
        videoUrl: prediction.gcsUri,
        state: 'completed',
      };
    }

    console.warn('[Veo] Unknown Vertex AI prediction format:', Object.keys(prediction));
    return null;
  } catch (err) {
    console.error('[Veo] Vertex AI error:', err.message);
    return null;
  }
}

/* ── Main export ───────────────────────────────────────────────────────── */
export async function generateVideoWithVeo({ prompt, imageUrl, aspectRatio = '16:9', duration = 8 }) {
  const apiKey = process.env.GEMINI_API_KEY;

  /* Try Gemini API Veo models first */
  if (apiKey) {
    let imageBase64 = null;
    let imageMime = 'image/png';

    if (imageUrl) {
      try {
        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            imageMime = match[1];
            imageBase64 = match[2];
          }
        }
      } catch {}
    }

    const geminiResult = await tryGeminiApiVeo({ prompt, imageBase64, imageMime, apiKey });
    if (geminiResult) return geminiResult;
  }

  /* Try Vertex AI Veo 3.1 */
  if (apiKey) {
    let imageBase64 = null;
    let imageMime = 'image/png';

    if (imageUrl) {
      try {
        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            imageMime = match[1];
            imageBase64 = match[2];
          }
        }
      } catch {}
    }

    const vertexResult = await tryVertexAiVeo({ prompt, imageBase64, imageMime, duration, aspectRatio });
    if (vertexResult) return vertexResult;
  }

  /* Fall back to mock */
  console.warn('[Veo] All real methods failed, using mock');
  return mockVeoGenerate({ prompt, imageUrl, duration });
}

export default { generateVideoWithVeo };
