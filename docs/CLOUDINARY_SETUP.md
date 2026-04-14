# Cloudinary Setup Guide

## Quick Setup

### 1. Get Cloudinary Credentials

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up/login
2. Navigate to **Settings** (gear icon) > **API Keys**
3. Copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Update Environment Variables

Add to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Run Setup Script

```bash
npm run cloudinary:setup
```

This will:
- Create required folders (`seredityfy/`, `seredityfy/users/`, etc.)
- Create upload presets
- Verify connection

### 4. Start Redis (Required for Queue)

Make sure Redis is running for background job processing:

```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 redis
```

## Folder Structure

Cloudinary will create these folders automatically:
```
seredityfy/
├── users/          # User uploaded images
├── references/     # Reference images for generation
├── generated/      # AI generated images
└── thumbnails/    # Thumbnail versions
```

## Upload Limits

| Type | Max Size | Formats |
|------|----------|---------|
| Reference | 10MB | jpg, png, webp, gif |
| Generated | 20MB | jpg, png, webp |

## Testing Upload

You can test the upload API:

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.png"
```

## Troubleshooting

### "Cloudinary is not configured"
- Check that all 3 environment variables are set in `.env`
- Restart the dev server after adding variables

### "Upload failed"
- Verify your API credentials are correct
- Check if your Cloudinary account has sufficient credits
- Ensure the upload preset has correct permissions

### Queue not processing
- Make sure Redis is running
- Start the worker: `npm run worker`
