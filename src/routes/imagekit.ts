// backend/routes/imagekit.ts
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/bearAuth.js';
import ImageKit from 'imagekit';

const imagekitApp = new Hono();

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Get authentication parameters for client-side upload
imagekitApp.get('/auth', authMiddleware, async (c) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    return c.json(authParams);
  } catch (error) {
    console.error('❌ ImageKit auth error:', error);
    return c.json({ error: 'Failed to get authentication parameters' }, 500);
  }
});

// Server-side upload endpoint
imagekitApp.post('/upload', authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    console.log('📤 Uploading to ImageKit:', file.name);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    const folder = (body.folder as string) || '/memorials/profiles';
    const fileName = `profile-${Date.now()}-${file.name}`;

    const result = await imagekit.upload({
      file: base64,
      fileName: fileName,
      folder: folder,
    });

    console.log('✅ ImageKit upload successful:', result.fileId);

    return c.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error) {
    console.error('❌ ImageKit upload error:', error);
    return c.json({ error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

export { imagekitApp };