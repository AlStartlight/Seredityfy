#!/usr/bin/env node

require('dotenv').config({ path: '.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function setupCloudinary() {
  console.log('🚀 Setting up Cloudinary...\n');

  console.log('1. Checking connection...');
  try {
    const ping = await cloudinary.api.ping();
    console.log('   ✓ Connected to Cloudinary');
  } catch (error) {
    console.error('   ✗ Connection failed:', error.message);
    console.log('\n   Please check your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  console.log('\n2. Creating folders...');
  const folders = [
    'seredityfy',
    'seredityfy/users',
    'seredityfy/references',
    'seredityfy/generated',
    'seredityfy/thumbnails',
  ];

  for (const folder of folders) {
    try {
      await cloudinary.api.create_folder(folder);
      console.log(`   ✓ Created: ${folder}`);
    } catch (error) {
      if (error.error?.code === 'folder_already_exists') {
        console.log(`   - Exists: ${folder}`);
      } else {
        console.error(`   ✗ Failed: ${folder}`, error.message);
      }
    }
  }

  console.log('\n3. Creating upload presets...');
  const presets = [
    {
      name: 'seredityfy_reference',
      folder: 'seredityfy/references',
      max_file_size: 10485760,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
    {
      name: 'seredityfy_generated',
      folder: 'seredityfy/generated',
      max_file_size: 20971520,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  ];

  for (const preset of presets) {
    try {
      await cloudinary.api.create_upload_preset(preset);
      console.log(`   ✓ Created preset: ${preset.name}`);
    } catch (error) {
      if (error.error?.message?.includes('already exists')) {
        console.log(`   - Exists: ${preset.name}`);
      } else {
        console.error(`   ✗ Failed: ${preset.name}`, error.message);
      }
    }
  }

  console.log('\n4. Fetching account info...');
  try {
    const info = await cloudinary.api.credentials();
    console.log(`   ✓ Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  } catch (error) {
    console.error('   ✗ Failed to fetch info');
  }

  console.log('\n✅ Cloudinary setup complete!\n');
  console.log('Environment variables to add to .env:');
  console.log(`
CLOUDINARY_CLOUD_NAME=${process.env.CLOUDINARY_CLOUD_NAME || '<your-cloud-name>'}
CLOUDINARY_API_KEY=${process.env.CLOUDINARY_API_KEY || '<your-api-key>'}
CLOUDINARY_API_SECRET=${process.env.CLOUDINARY_API_SECRET || '<your-api-secret>'}
`);
}

setupCloudinary().catch(console.error);
