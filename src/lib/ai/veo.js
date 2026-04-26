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

/* ── Google GenAI SDK — operations-based Veo 3.1 (primary) ────────────── */
async function tryGenAIVeoOperations({ prompt, imageUrl, durationSeconds, aspectRatio, apiKey }) {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const source = { prompt };

    // Attach image if URL is provided and publicly reachable
    if (imageUrl && !imageUrl.startsWith('data:')) {
      source.image = { url: imageUrl };
    }

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      source,
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio || '16:9',
        resolution: '720p',
        personGeneration: 'dont_allow',
        durationSeconds: durationSeconds || 8,
      },
    });

    // Poll until done — max 240s to stay within Vercel's 300s limit
    const deadline = Date.now() + 240_000;
    while (!operation.done && Date.now() < deadline) {
      console.log(`[Veo] ${operation.name} not ready, retrying in 10s…`);
      await new Promise(r => setTimeout(r, 10_000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      return { success: false, error: 'Veo generation timed out after 240s' };
    }

    const videos = operation.response?.generatedVideos;
    if (!videos?.length) {
      return { success: false, error: 'Veo returned no videos' };
    }

    const videoUri = videos[0]?.video?.uri;
    if (!videoUri) {
      return { success: false, error: 'Veo returned no video URI' };
    }

    // Download the video from Google's URI
    const videoRes = await fetch(`${videoUri}&key=${apiKey}`);
    if (!videoRes.ok) throw new Error(`Video download failed: ${videoRes.status}`);

    const buffer = await videoRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = videoRes.headers.get('content-type') || 'video/mp4';

    // Upload to Cloudinary for a persistent public URL
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
      console.log('[Veo] Uploaded to Cloudinary:', uploaded.secure_url);
      return { success: true, videoUrl: uploaded.secure_url, mimeType, state: 'completed' };
    } catch (cdnErr) {
      console.warn('[Veo] Cloudinary upload failed, returning base64 inline:', cdnErr.message);
      return {
        success: true,
        videoData: `data:${mimeType};base64,${base64}`,
        mimeType,
        state: 'completed',
      };
    }
  } catch (err) {
    console.warn('[Veo] GenAI operations error:', err.message);
    return null;
  }
}

/* ── Main export ───────────────────────────────────────────────────────── */
export async function generateVideoWithVeo({ prompt, imageUrl, aspectRatio = '16:9', duration = 8 }) {
  const apiKey = process.env.GEMINI_API_KEY;

  /* 1 — Try new GenAI operations API (veo-3.1-generate-preview) */
  if (apiKey) {
    const result = await tryGenAIVeoOperations({ prompt, imageUrl, durationSeconds: duration, aspectRatio, apiKey });
    if (result) return result;
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
