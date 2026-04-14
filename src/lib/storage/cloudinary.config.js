import { v2 as cloudinary } from 'cloudinary';

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

cloudinary.config(cloudinaryConfig);

export function verifyCloudinaryConfig() {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  
  if (!isConfigured) {
    console.warn('⚠️  Cloudinary is not fully configured. Missing environment variables:');
    if (!process.env.CLOUDINARY_CLOUD_NAME) console.warn('  - CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) console.warn('  - CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) console.warn('  - CLOUDINARY_API_SECRET');
  }
  
  return isConfigured;
}

export async function testCloudinaryConnection() {
  if (!verifyCloudinaryConfig()) {
    return { success: false, error: 'Cloudinary not configured' };
  }

  try {
    const result = await cloudinary.api.ping();
    return { success: true, message: 'Cloudinary connected successfully', details: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createUploadFolder(folder = 'seredityfy') {
  try {
    const result = await cloudinary.api.create_folder(folder);
    return { success: true, folder: result };
  } catch (error) {
    if (error.error?.code === 'folder_already_exists') {
      return { success: true, folder: folder, message: 'Folder already exists' };
    }
    return { success: false, error: error.message };
  }
}

export async function getUploadPresets() {
  try {
    const result = await cloudinary.api.upload_presets();
    return { success: true, presets: result.presets };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createUploadPreset(name, settings = {}) {
  const {
    folder = 'seredityfy',
    maxFileSize = 10000000,
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation = { quality: 'auto', fetch_format: 'auto' },
  } = settings;

  try {
    const preset = await cloudinary.api.create_upload_preset({
      name,
      folder,
      max_file_size: maxFileSize,
      allowed_formats: allowedFormats,
      transformation,
      unsigned: false,
    });
    return { success: true, preset };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default cloudinary;
