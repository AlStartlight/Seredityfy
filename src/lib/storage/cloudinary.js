import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadBase64Image(base64Data, mimeType = 'image/png', folder = 'seredityfy') {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${base64Data}`,
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' },
        ],
      }
    );

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

export async function uploadFromUrl(imageUrl, folder = 'seredityfy') {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary URL upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

export async function generateThumbnail(imageUrl, options = {}) {
  try {
    const {
      width = 300,
      height = 300,
      crop = 'fill',
      gravity = 'auto',
    } = options;

    const thumbnailUrl = cloudinary.url(imageUrl, {
      transformation: [
        { width },
        { height },
        { crop },
        { gravity },
        { quality: 'auto:low' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      success: true,
      thumbnailUrl,
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getImageMetadata(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        createdAt: result.created_at,
      },
    };
  } catch (error) {
    console.error('Cloudinary metadata error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function listImages(folder = 'seredityfy', maxResults = 100) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: maxResults,
    });

    return {
      success: true,
      images: result.resources.map((r) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width,
        height: r.height,
        createdAt: r.created_at,
      })),
      total: result.total_count,
    };
  } catch (error) {
    console.error('Cloudinary list error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function getOptimizedUrl(publicId, options = {}) {
  const { width, height, quality = 'auto', format = 'auto' } = options;

  return cloudinary.url(publicId, {
    transformation: [
      ...(width ? [{ width }] : []),
      ...(height ? [{ height }] : []),
      { quality },
      { fetch_format: format },
    ],
  });
}

export default {
  uploadBase64Image,
  uploadFromUrl,
  generateThumbnail,
  deleteImage,
  getImageMetadata,
  listImages,
  getOptimizedUrl,
  cloudinary,
};
