// backend/routes/memorials.ts - RENDER OPTIMIZED
import { Hono } from 'hono';
import { db } from '../drizzle/db.js';
import { memorials } from '../drizzle/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/bearAuth.js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateMemorialHTML } from '../utils/pdfTemplate.js';

const memorialsApp = new Hono();

// Get user's memorials
memorialsApp.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  
  try {
    const userMemorials = await db
      .select()
      .from(memorials)
      .where(eq(memorials.userId, userId))
      .orderBy(desc(memorials.createdAt));

    return c.json({ memorials: userMemorials });
  } catch (error) {
    console.error('Error fetching memorials:', error);
    return c.json({ error: 'Failed to fetch memorials' }, 500);
  }
});

// Get single memorial
memorialsApp.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');

  try {
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

// In your GET /:id endpoint
const transformedMemorial = {
  ...memorial,
  service: memorial.serviceInfo || {
    venue: '',
    address: '',
    date: '',
    time: '',
    virtualLink: '',
    virtualPlatform: 'zoom'
  },
  // Ensure memoryWall is properly formatted
  memoryWall: memorial.memoryWall || [],
  // Ensure favorites have the right structure
  favorites: memorial.favorites || []
};

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});

// Create new memorial
memorialsApp.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  try {
    const [memorial] = await db
      .insert(memorials)
      .values({
        userId,
        name: body.name || 'New Memorial',
        profileImage: body.profileImage || '',
        birthDate: body.birthDate || '',
        deathDate: body.deathDate || '',
        location: body.location || '',
        obituary: body.obituary || '',
        timeline: body.timeline || [],
        favorites: body.favorites || [],
        familyTree: body.familyTree || [],
        gallery: body.gallery || [],
        memoryWall: body.memoryWall || [],
        serviceInfo: body.service || {
          venue: '',
          address: '',
          date: '',
          time: ''
        }
      })
      .returning();

    return c.json({ memorial }, 201);
  } catch (error) {
    console.error('Error creating memorial:', error);
    return c.json({ error: 'Failed to create memorial' }, 500);
  }
});

// Update memorial
memorialsApp.put('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');
  const body = await c.req.json();

  try {
    const [existingMemorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!existingMemorial || existingMemorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    const [updatedMemorial] = await db
      .update(memorials)
      .set({
        name: body.name,
        profileImage: body.profileImage,
        birthDate: body.birthDate,
        deathDate: body.deathDate,
        location: body.location,
        obituary: body.obituary,
        timeline: body.timeline,
        favorites: body.favorites,
        familyTree: body.familyTree,
        gallery: body.gallery,
        memoryWall: body.memoryWall,
        serviceInfo: body.service,
        theme: body.theme,
        customUrl: body.customUrl,
        updatedAt: new Date(),
      })
      .where(eq(memorials.id, memorialId))
      .returning();

    return c.json({ memorial: updatedMemorial });
  } catch (error) {
    console.error('Error updating memorial:', error);
    return c.json({ error: 'Failed to update memorial' }, 500);
  }
});

// Generate PDF - RENDER OPTIMIZED
memorialsApp.post('/generate-pdf', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  let browser = null;

  try {
    if (!body.data) {
      return c.json({ error: 'Memorial data is required' }, 400);
    }

    console.log('🚀 Starting PDF generation for:', body.data.name);

    // Generate HTML from template
    const html = generateMemorialHTML(body.data);

    // Configure Chromium for Render
    const isProduction = process.env.NODE_ENV === 'production';

    // Launch browser with Render-optimized config
    browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      },
      executablePath: isProduction 
        ? await chromium.executablePath('/tmp/chromium')
        : await chromium.executablePath(),
      headless: true,
    });

    console.log('✅ Browser launched');

    const page = await browser.newPage();

    // Set viewport (redundant but safe)
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    console.log('📄 Loading HTML content...');

    // Load HTML
    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    console.log('🖼️ Waiting for images...');

    // Wait for images (with timeout)
    await Promise.race([
      page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
              setTimeout(resolve, 3000); // Max 3s per image
            }))
        );
      }),
      new Promise(resolve => setTimeout(resolve, 8000)) // Max 8s total
    ]);

    console.log('📥 Generating PDF...');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      },
      timeout: 60000
    });

    console.log('✅ PDF generated successfully:', pdfBuffer.length, 'bytes');

    // Set headers
    c.header('Content-Type', 'application/pdf');
    c.header(
      'Content-Disposition',
      `attachment; filename="${body.data.name.replace(/\s+/g, '-')}-memorial.pdf"`
    );
    c.header('Content-Length', pdfBuffer.length.toString());

    return c.body(new Uint8Array(pdfBuffer));

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return c.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : '' : undefined
    }, 500);
  } finally {
    // Always close browser
    if (browser) {
      try {
        await browser.close();
        console.log('🔒 Browser closed');
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
});

// Publish memorial
memorialsApp.post('/:id/publish', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');

  try {
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    const [updatedMemorial] = await db
      .update(memorials)
      .set({
        isPublished: true,
        updatedAt: new Date()
      })
      .where(eq(memorials.id, memorialId))
      .returning();

    return c.json({ memorial: updatedMemorial });
  } catch (error) {
    console.error('Publish error:', error);
    return c.json({ error: 'Failed to publish memorial' }, 500);
  }
});

export { memorialsApp };