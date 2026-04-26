const GEMINI_VEO_ENDPOINT = model =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/**
 * GCS multi-region names ("us", "eu", "asia") are NOT valid Vertex AI
 * compute regions. Map them to the closest regional endpoint.
 * Veo 3.1 is currently only available in us-central1.
 */
const VERTEX_REGION_MAP = { us: 'us-central1', eu: 'europe-west1', asia: 'asia-northeast1' };
function normalizeVertexLocation(loc) {
  return VERTEX_REGION_MAP[loc] ?? loc;
}

const VERTEX_VEO_ENDPOINT = (project, location) => {
  const region = normalizeVertexLocation(location);
  return `https://${region}-aiplatform.googleapis.com/v1/projects/${project}/locations/${region}/publishers/google/models/veo-3.1:predict`;
};

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
async function tryVertexAiVeo({ prompt, imageBase64, duration, aspectRatio }) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const rawLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const location = normalizeVertexLocation(rawLocation);

  if (!project) {
    console.warn('[Veo] GOOGLE_CLOUD_PROJECT not set, skipping Vertex AI');
    return null;
  }

  if (/\s/.test(project)) {
    console.error(
      `[Veo] GOOGLE_CLOUD_PROJECT="${project}" looks like a display name (contains spaces). ` +
      'Set it to the project ID (e.g. my-project-123456). Skipping Vertex AI.'
    );
    return null;
  }

  if (rawLocation !== location) {
    console.warn(`[Veo] GOOGLE_CLOUD_LOCATION="${rawLocation}" is a GCS multi-region — using "${location}" for Vertex AI.`);
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
      /* gs://bucket/path → https://storage.googleapis.com/bucket/path */
      const httpsUri = prediction.gcsUri.startsWith('gs://')
        ? prediction.gcsUri.replace(/^gs:\/\/([^/]+)\/(.+)$/, 'https://storage.googleapis.com/$1/$2')
        : prediction.gcsUri;

      try {
        const videoRes = await fetch(httpsUri, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!videoRes.ok) {
          throw new Error(`GCS fetch ${videoRes.status}: ${await videoRes.text().catch(() => '')}`);
        }

        const videoBuffer = await videoRes.arrayBuffer();
        const base64 = Buffer.from(videoBuffer).toString('base64');
        const mimeType = videoRes.headers.get('content-type') || 'video/mp4';

        /* Upload to Cloudinary for a persistent public URL */
        try {
          const { v2: cloudinary } = await import('cloudinary');
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key:    process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          const uploadResult = await cloudinary.uploader.upload(
            `data:${mimeType};base64,${base64}`,
            { folder: 'seredityfy/videos', resource_type: 'video' }
          );
          console.log('[Veo] Uploaded to Cloudinary:', uploadResult.secure_url);
          return {
            success: true,
            videoUrl: uploadResult.secure_url,
            mimeType,
            state: 'completed',
          };
        } catch (cdnErr) {
          console.warn('[Veo] Cloudinary upload failed, returning inline base64:', cdnErr.message);
          return {
            success: true,
            videoData: `data:${mimeType};base64,${base64}`,
            mimeType,
            state: 'completed',
          };
        }
      } catch (gcsErr) {
        console.warn('[Veo] GCS download failed:', gcsErr.message);
        /* Last resort: return the raw GCS URI — will only work if bucket becomes public */
        return {
          success: true,
          videoUrl: httpsUri,
          state: 'completed',
        };
      }
    }

    console.warn('[Veo] Unknown Vertex AI prediction format:', Object.keys(prediction));
    return null;
  } catch (err) {
    console.error('[Veo] Vertex AI error:', err.message);
    return null;
  }
}

/* ── Helper: fetch any image URL → { bytesBase64Encoded, mimeType } ─────── */
async function imageUrlToBase64(imageUrl) {
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:(image\/[\w+]+);base64,(.+)$/);
      if (match) return { mimeType: match[1], bytesBase64Encoded: match[2] };
      return null;
    }
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return {
      mimeType: res.headers.get('content-type') || 'image/jpeg',
      bytesBase64Encoded: Buffer.from(buf).toString('base64'),
    };
  } catch {
    return null;
  }
}

/* ── Helper: download Veo video URI → upload Cloudinary → return URL ────── */
async function downloadAndUploadVideo(videoUri, apiKey) {
  const videoRes = await fetch(`${videoUri}&key=${apiKey}`, { signal: AbortSignal.timeout(30_000) });
  if (!videoRes.ok) throw new Error(`Video download failed: ${videoRes.status}`);
  const buffer = await videoRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = videoRes.headers.get('content-type') || 'video/mp4';

  try {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const uploaded = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${base64}`,
      { folder: 'seredityfy/videos', resource_type: 'video' }
    );
    return { videoUrl: uploaded.secure_url, mimeType };
  } catch {
    return { videoData: `data:${mimeType};base64,${base64}`, mimeType };
  }
}

/* ── Start Veo operation (non-blocking) — returns operationName immediately */
// veo-3.1-generate-preview via Gemini API is text-to-video only.
// The prompt is already image-enriched by Gemini upstream, so no image source needed.
export async function startVeoOperation({ prompt, durationSeconds = 8, aspectRatio = '16:9', resolution = '720p' }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY not configured' };

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      source: { prompt },
      config: {
        numberOfVideos: 1,
        aspectRatio,
        resolution,
        durationSeconds,
      },
    });

    console.log('[Veo] Operation started:', operation.name);
    return { success: true, operationName: operation.name, done: !!operation.done };
  } catch (err) {
    console.warn('[Veo] startVeoOperation error:', err.message);
    return { success: false, error: err.message };
  }
}

/* ── Poll an existing Veo operation — call once per client poll tick ─────── */
export async function pollVeoOperation(operationName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { done: false, error: 'GEMINI_API_KEY not configured' };

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const operation = await ai.operations.getVideosOperation({
      operation: { name: operationName },
    });

    if (!operation.done) return { done: false };

    const videos = operation.response?.generatedVideos;
    if (!videos?.length) return { done: true, success: false, error: 'Veo returned no videos' };

    const videoUri = videos[0]?.video?.uri;
    if (!videoUri) return { done: true, success: false, error: 'Veo returned no video URI' };

    const result = await downloadAndUploadVideo(videoUri, apiKey);
    return { done: true, success: true, ...result };
  } catch (err) {
    console.warn('[Veo] pollVeoOperation error:', err.message);
    return { done: false, error: err.message };
  }
}

/* ── Main export ───────────────────────────────────────────────────────── */
export async function generateVideoWithVeo({ prompt, imageUrl, aspectRatio = '16:9', resolution = '720p', duration = 8 }) {
  const apiKey = process.env.GEMINI_API_KEY;

  /* 1 — Try new GenAI operations API (veo-3.1-generate-preview) — async start only */
  if (apiKey) {
    const started = await startVeoOperation({ prompt, imageUrl, durationSeconds: duration, aspectRatio, resolution });
    if (started.success) return { success: true, pending: true, operationName: started.operationName };
  }

  /* 2 — Try legacy Gemini REST API */
  if (apiKey) {
    let imageBase64 = null;
    let imageMime = 'image/png';

    if (imageUrl) {
      try {
        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) { imageMime = match[1]; imageBase64 = match[2]; }
        }
      } catch {}
    }

    const geminiResult = await tryGeminiApiVeo({ prompt, imageBase64, imageMime, apiKey });
    if (geminiResult) return geminiResult;
  }

  /* 3 — Try Vertex AI Veo 3.1 */
  if (apiKey) {
    let imageBase64 = null;

    if (imageUrl) {
      try {
        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) imageBase64 = match[2];
        }
      } catch {}
    }

    const vertexResult = await tryVertexAiVeo({ prompt, imageBase64, duration, aspectRatio });
    if (vertexResult) return vertexResult;
  }

  console.error('[Veo] All generation methods failed. Check GEMINI_API_KEY, GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_SERVICE_ACCOUNT_KEY.');
  return {
    success: false,
    error: 'Video generation unavailable. Check server configuration.',
  };
}

export default { generateVideoWithVeo };
