// backend/routes/memorials.ts - FIXED WITH PROPER SERVICE TYPING
import { Hono } from 'hono';
import { db } from '../drizzle/db.js';
import { memorials, memories, users } from '../drizzle/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/bearAuth.js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateMemorialHTML } from '../utils/pdfTemplate.js';
import { inArray } from 'drizzle-orm';

const memorialsApp = new Hono();

// Define proper types for service info
interface ServiceInfo {
  venue?: string;
  address?: string;
  date?: string;
  time?: string;
  virtualLink?: string;
  virtualPlatform?: string;
}

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

// Get single memorial - FIXED WITH PROPER SERVICE TYPING
memorialsApp.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');

  try {
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

  // ADD THIS DEBUG LOGGING
    console.log('🗄️ Database memorial data:', {
      id: memorial?.id,
      name: memorial?.name,
      timelineLength: memorial && Array.isArray(memorial.timeline) ? memorial.timeline.length : 0,
      favoritesLength: memorial && Array.isArray(memorial.favorites) ? memorial.favorites.length : 0,
      familyTreeLength: memorial && Array.isArray(memorial.familyTree) ? memorial.familyTree.length : 0,
      galleryLength: memorial && Array.isArray(memorial.gallery) ? memorial.gallery.length : 0,
      memoryWallLength: memorial && Array.isArray(memorial.memoryWall) ? memorial.memoryWall.length : 0,
      serviceInfo: memorial?.serviceInfo
    });

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }
    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Get memories from the separate memories table
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, memorialId));

    // Parse service info with proper typing
    const serviceInfo: ServiceInfo = memorial.serviceInfo as ServiceInfo || {};
    
    // COMPREHENSIVE TRANSFORMATION - include ALL fields
    const transformedMemorial = {
      ...memorial,
      service: {
        venue: serviceInfo.venue || '',
        address: serviceInfo.address || '',
        date: serviceInfo.date || '',
        time: serviceInfo.time || '',
        virtualLink: serviceInfo.virtualLink || '',
        virtualPlatform: serviceInfo.virtualPlatform || 'zoom'
      },
      // Ensure ALL arrays are included with defaults
      timeline: memorial.timeline || [],
      favorites: memorial.favorites || [],
      familyTree: memorial.familyTree || [],
      gallery: memorial.gallery || [],
      memoryWall: memorial.memoryWall || [],
      memories: memorialMemories || [], // Use memories from separate table
      // Ensure all required fields have defaults
      name: memorial.name || '',
      profileImage: memorial.profileImage || '',
      birthDate: memorial.birthDate || '',
      deathDate: memorial.deathDate || '',
      location: memorial.location || '',
      obituary: memorial.obituary || '',
      isPublished: memorial.isPublished || false,
      customUrl: memorial.customUrl || '',
      theme: memorial.theme || 'default'
    };

    console.log('✅ Transformed memorial data for frontend:', {
      id: transformedMemorial.id,
      name: transformedMemorial.name,
      hasTimeline: Array.isArray(transformedMemorial.timeline) ? transformedMemorial.timeline.length : 0,
      hasFavorites: Array.isArray(transformedMemorial.favorites) ? transformedMemorial.favorites.length : 0,
      hasFamilyTree: Array.isArray(transformedMemorial.familyTree) ? transformedMemorial.familyTree.length : 0,
      hasGallery: Array.isArray(transformedMemorial.gallery) ? transformedMemorial.gallery.length : 0,
      hasMemoryWall: Array.isArray(transformedMemorial.memoryWall) ? transformedMemorial.memoryWall.length : 0,
      hasMemories: Array.isArray(transformedMemorial.memories) ? transformedMemorial.memories.length : 0,
      hasService: !!(transformedMemorial.service && transformedMemorial.service.venue)
    });

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});

// NEW: Get memorial for PDF preview (PUBLIC - no auth required) - FIXED
memorialsApp.get('/:id/pdf-data', async (c) => {
  const memorialId = c.req.param('id');

  try {
    // Try to find by ID or customUrl
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial) {
      // Try by customUrl
      const [memorialByUrl] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.customUrl, memorialId));

      if (!memorialByUrl) {
        return c.json({ error: 'Memorial not found' }, 404);
      }

      // Get memories for this memorial
      const memorialMemories = await db
        .select()
        .from(memories)
        .where(eq(memories.memorialId, memorialByUrl.id));

      // Parse service info with proper typing
      const serviceInfo: ServiceInfo = memorialByUrl.serviceInfo as ServiceInfo || {};

      const transformedMemorial = {
        ...memorialByUrl,
        service: serviceInfo,
        timeline: memorialByUrl.timeline || [],
        favorites: memorialByUrl.favorites || [],
        familyTree: memorialByUrl.familyTree || [],
        gallery: memorialByUrl.gallery || [],
        memoryWall: memorialByUrl.memoryWall || [],
        memories: memorialMemories || []
      };

      return c.json({ memorial: transformedMemorial });
    }

    // Get memories for this memorial
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, memorial.id));

    // Parse service info with proper typing
    const serviceInfo: ServiceInfo = memorial.serviceInfo as ServiceInfo || {};

    const transformedMemorial = {
      ...memorial,
      service: serviceInfo,
      timeline: memorial.timeline || [],
      favorites: memorial.favorites || [],
      familyTree: memorial.familyTree || [],
      gallery: memorial.gallery || [],
      memoryWall: memorial.memoryWall || [],
      memories: memorialMemories || []
    };

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});

// NEW: Stream PDF directly for preview (PUBLIC - no auth required)
memorialsApp.get('/:id/preview-pdf', async (c) => {
  const memorialId = c.req.param('id');
  let browser = null;

  try {
    // Fetch memorial data
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial) {
      // Try by customUrl
      const [memorialByUrl] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.customUrl, memorialId));

      if (!memorialByUrl) {
        return c.json({ error: 'Memorial not found' }, 404);
      }

      return generatePDFResponse(c, memorialByUrl);
    }

    return generatePDFResponse(c, memorial);

  } catch (error) {
    console.error('❌ PDF preview error:', error);
    return c.json({ 
      error: 'Failed to generate PDF preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Helper function to generate PDF response - FIXED WITH PROPER SERVICE TYPING
async function generatePDFResponse(c: any, memorial: any) {
  let browser = null;

  try {
    // Get memories for this memorial
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, memorial.id));

    // Parse service info with proper typing
    const serviceInfo: ServiceInfo = memorial.serviceInfo as ServiceInfo || {};

    const memorialData = {
      ...memorial,
      service: serviceInfo,
      timeline: memorial.timeline || [],
      favorites: memorial.favorites || [],
      familyTree: memorial.familyTree || [],
      gallery: memorial.gallery || [],
      memoryWall: memorial.memoryWall || [],
      memories: memorialMemories || []
    };

    console.log('🚀 Generating PDF with complete data:', {
      name: memorialData.name,
      timeline: Array.isArray(memorialData.timeline) ? memorialData.timeline.length : 0,
      favorites: Array.isArray(memorialData.favorites) ? memorialData.favorites.length : 0,
      family: Array.isArray(memorialData.familyTree) ? memorialData.familyTree.length : 0,
      gallery: Array.isArray(memorialData.gallery) ? memorialData.gallery.length : 0,
      memories: Array.isArray(memorialData.memories) ? memorialData.memories.length : 0
    });

    const html = generateMemorialHTML(memorialData);

    const isProduction = process.env.NODE_ENV === 'production';
    
    let executablePath;
    
    if (isProduction) {
      executablePath = await chromium.executablePath();
    } else {
      executablePath = process.env.CHROME_BIN || 
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }

    const args = isProduction
      ? [
          ...chromium.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ]
      : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ];

    browser = await puppeteer.launch({
      args,
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    await Promise.race([
      page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
              setTimeout(resolve, 3000);
            }))
        );
      }),
      new Promise(resolve => setTimeout(resolve, 8000))
    ]);

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
      timeout: 60000,
      displayHeaderFooter: false 
    });

    console.log('✅ PDF preview generated:', pdfBuffer.length, 'bytes');

    // Set headers for inline display (preview in browser)
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `inline; filename="${memorial.name.replace(/\s+/g, '-')}-memorial.pdf"`);
    c.header('Content-Length', pdfBuffer.length.toString());

    return c.body(new Uint8Array(pdfBuffer));

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
}

// Create new memorial - FIXED (no memories field needed)
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
          time: '',
          virtualLink: '',
          virtualPlatform: 'zoom'
        },
        theme: body.theme || 'default',
        customUrl: body.customUrl || '',
        isPublished: false
      })
      .returning();

    return c.json({ memorial }, 201);
  } catch (error) {
    console.error('Error creating memorial:', error);
    return c.json({ error: 'Failed to create memorial' }, 500);
  }
});

// Update memorial - FIXED (no memories field needed)

// backend/routes/memorials.ts - FIXED UPDATE ENDPOINT
memorialsApp.put('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');
  
  const body = await c.req.json();

  console.log('📥 UPDATE REQUEST - Complete analysis:', {
    memorialId,
    bodyKeys: Object.keys(body),
    timeline: Array.isArray(body.timeline) ? body.timeline.length : 'missing/not-array',
    favorites: Array.isArray(body.favorites) ? body.favorites.length : 'missing/not-array',
    familyTree: Array.isArray(body.familyTree) ? body.familyTree.length : 'missing/not-array',
    gallery: Array.isArray(body.gallery) ? body.gallery.length : 'missing/not-array',
    memoryWall: Array.isArray(body.memoryWall) ? body.memoryWall.length : 'missing/not-array'
  });

  try {
    // Get current memorial data FIRST - this is CRITICAL
    const [currentMemorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!currentMemorial || currentMemorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // COMPREHENSIVE DATA PRESERVATION - ALWAYS preserve existing data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // PRESERVE ALL FIELDS - Only update what's in the request, preserve the rest
    const allFields = [
      'name', 'profileImage', 'birthDate', 'deathDate', 'location', 
      'obituary', 'theme', 'customUrl', 'isPublished'
    ];

    allFields.forEach(field => {
      if (field in body) {
        // Update with new value if provided
        updateData[field] = body[field] !== undefined ? body[field] : currentMemorial[field as keyof typeof currentMemorial];
      } else {
        // PRESERVE existing value if not in request
        updateData[field] = currentMemorial[field as keyof typeof currentMemorial];
      }
    });

    // CRITICAL: Always preserve arrays - NEVER let them become undefined
    const arrayFields = ['timeline', 'favorites', 'familyTree', 'gallery', 'memoryWall'];
    arrayFields.forEach(field => {
      if (field in body) {
        // Update with new array if provided
        updateData[field] = Array.isArray(body[field]) ? body[field] : [];
      } else {
        // PRESERVE existing array if not in request
        updateData[field] = currentMemorial[field as keyof typeof currentMemorial] || [];
      }
    });

    // Handle service info separately - PRESERVE existing service info
    if (body.service || body.serviceInfo) {
      const currentService = currentMemorial.serviceInfo as ServiceInfo || {};
      const newService = body.service || body.serviceInfo || {};
      
      updateData.serviceInfo = {
        // Only update fields that are provided, preserve others
        venue: newService.venue !== undefined ? newService.venue : currentService.venue || '',
        address: newService.address !== undefined ? newService.address : currentService.address || '',
        date: newService.date !== undefined ? newService.date : currentService.date || '',
        time: newService.time !== undefined ? newService.time : currentService.time || '',
        virtualLink: newService.virtualLink !== undefined ? newService.virtualLink : currentService.virtualLink || '',
        virtualPlatform: newService.virtualPlatform !== undefined ? newService.virtualPlatform : currentService.virtualPlatform || 'zoom'
      };
    } else {
      // PRESERVE existing service info if not in request
      updateData.serviceInfo = currentMemorial.serviceInfo;
    }

    // VALIDATE: Ensure no data is lost
    console.log('🔍 DATA VALIDATION - Before vs After:', {
      before: {
        timeline: Array.isArray(currentMemorial.timeline) ? currentMemorial.timeline.length : 0,
        favorites: Array.isArray(currentMemorial.favorites) ? currentMemorial.favorites.length : 0,
        familyTree: Array.isArray(currentMemorial.familyTree) ? currentMemorial.familyTree.length : 0,
        gallery: Array.isArray(currentMemorial.gallery) ? currentMemorial.gallery.length : 0,
        memoryWall: Array.isArray(currentMemorial.memoryWall) ? currentMemorial.memoryWall.length : 0,
      },
      after: {
        timeline: Array.isArray(updateData.timeline) ? updateData.timeline.length : 0,
        favorites: Array.isArray(updateData.favorites) ? updateData.favorites.length : 0,
        familyTree: Array.isArray(updateData.familyTree) ? updateData.familyTree.length : 0,
        gallery: Array.isArray(updateData.gallery) ? updateData.gallery.length : 0,
        memoryWall: Array.isArray(updateData.memoryWall) ? updateData.memoryWall.length : 0,
      }
    });

    console.log('💾 FINAL UPDATE DATA:', {
      timelineLength: Array.isArray(updateData.timeline) ? updateData.timeline.length : 0,
      favoritesLength: Array.isArray(updateData.favorites) ? updateData.favorites.length : 0,
      familyTreeLength: Array.isArray(updateData.familyTree) ? updateData.familyTree.length : 0,
      galleryLength: Array.isArray(updateData.gallery) ? updateData.gallery.length : 0,
      memoryWallLength: Array.isArray(updateData.memoryWall) ? updateData.memoryWall.length : 0,
      hasServiceInfo: !!updateData.serviceInfo
    });

    const [updatedMemorial] = await db
      .update(memorials)
      .set(updateData)
      .where(eq(memorials.id, memorialId))
      .returning();

    return c.json({ memorial: updatedMemorial });

  } catch (error) {
    console.error('❌ Update error:', error);
    return c.json({ error: 'Failed to update memorial' }, 500);
  }
});

// Generate PDF for download - FIXED WITH PROPER TYPING
memorialsApp.post('/generate-pdf', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  let browser = null;

  try {
    if (!body.data) {
      return c.json({ error: 'Memorial data is required' }, 400);
    }

    console.log('🚀 Starting PDF generation for:', body.data.name);
    console.log('📊 PDF data summary:', {
      timeline: Array.isArray(body.data.timeline) ? body.data.timeline.length : 0,
      favorites: Array.isArray(body.data.favorites) ? body.data.favorites.length : 0,
      family: Array.isArray(body.data.familyTree) ? body.data.familyTree.length : 0,
      gallery: Array.isArray(body.data.gallery) ? body.data.gallery.length : 0,
      memories: Array.isArray(body.data.memoryWall) ? body.data.memoryWall.length : 0
    });

    const html = generateMemorialHTML(body.data);

    const isProduction = process.env.NODE_ENV === 'production';
    
    let executablePath;
    
    if (isProduction) {
      executablePath = await chromium.executablePath();
    } else {
      executablePath = process.env.CHROME_BIN || 
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }

    const args = isProduction
      ? [
          ...chromium.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ]
      : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ];

    browser = await puppeteer.launch({
      args,
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    await Promise.race([
      page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
              setTimeout(resolve, 3000);
            }))
        );
      }),
      new Promise(resolve => setTimeout(resolve, 8000))
    ]);

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
      timeout: 60000,
      displayHeaderFooter: false 
    });

    console.log('✅ PDF generated successfully:', pdfBuffer.length, 'bytes');

    // Set headers for download
    c.header('Content-Type', 'application/pdf');
    c.header(
      'Content-Disposition',
      `attachment; filename="${body.data.name.replace(/\s+/g, '-').toLowerCase()}-memorial.pdf"`
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
    if (browser) {
      try {
        await browser.close();
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

// Add this debug endpoint to check user-memorial relationships
memorialsApp.get('/debug/user-memorials', authMiddleware, async (c) => {
  const userId = c.get('userId');
  
  try {
    // Get current user info
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    // Get memorials belonging to this user
    const userMemorials = await db
      .select()
      .from(memorials)
      .where(eq(memorials.userId, userId));

    // Also check if the memorials from your logs exist and who they belong to
    const memorialIdsFromLogs = [
      'b1b8c3b2-3405-4b85-a36a-4930e88ffe6d',
      '2e6bdd41-e7d9-4d70-bedd-63691cd5f6fe'
    ];

    const memorialOwners = await db
      .select({
        memorialId: memorials.id,
        memorialName: memorials.name,
        userId: memorials.userId,
        userEmail: users.email
      })
      .from(memorials)
      .leftJoin(users, eq(memorials.userId, users.id))
      .where(inArray(memorials.id, memorialIdsFromLogs));

    return c.json({
      currentUser: {
        id: currentUser?.id,
        email: currentUser?.email
      },
      userMemorials: userMemorials.map(m => ({ id: m.id, name: m.name })),
      memorialOwners: memorialOwners,
      summary: {
        userMemorialsCount: userMemorials.length,
        memorialsFromLogsCount: memorialOwners.length
      }
    });
  } catch (error) {
  console.error('Debug error:', error);
  const message = error instanceof Error ? error.message : String(error);
  return c.json({ error: message }, 500);
}

});

// NEW: Generate preview PDF with complete data (requires auth)
memorialsApp.post('/generate-preview-pdf', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  let browser = null;

  try {
    if (!body.data) {
      return c.json({ error: 'Memorial data is required' }, 400);
    }

    console.log('🚀 Generating PREVIEW PDF with complete data:', {
      name: body.data.name,
      timeline: Array.isArray(body.data.timeline) ? body.data.timeline.length : 0,
      favorites: Array.isArray(body.data.favorites) ? body.data.favorites.length : 0,
      family: Array.isArray(body.data.familyTree) ? body.data.familyTree.length : 0,
      gallery: Array.isArray(body.data.gallery) ? body.data.gallery.length : 0,
      memories: Array.isArray(body.data.memoryWall) ? body.data.memoryWall.length : 0
    });

    // Get memories for this memorial from database
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, body.memorialId));

    // Ensure all data is included
    const completeMemorialData = {
      ...body.data,
      memories: memorialMemories || [],
      timeline: body.data.timeline || [],
      favorites: body.data.favorites || [],
      familyTree: body.data.familyTree || [],
      gallery: body.data.gallery || [],
      memoryWall: body.data.memoryWall || []
    };

    const html = generateMemorialHTML(completeMemorialData);

    const isProduction = process.env.NODE_ENV === 'production';
    
    let executablePath;
    
    if (isProduction) {
      executablePath = await chromium.executablePath();
    } else {
      executablePath = process.env.CHROME_BIN || 
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }

    const args = isProduction
      ? [
          ...chromium.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ]
      : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ];

    browser = await puppeteer.launch({
      args,
      defaultViewport: {
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000
    });

    await Promise.race([
      page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
              setTimeout(resolve, 3000);
            }))
        );
      }),
      new Promise(resolve => setTimeout(resolve, 8000))
    ]);

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
      timeout: 60000,
      displayHeaderFooter: false 
    });

    console.log('✅ Preview PDF generated:', pdfBuffer.length, 'bytes');

    // Set headers for inline display (preview in browser)
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `inline; filename="${body.data.name.replace(/\s+/g, '-')}-memorial-preview.pdf"`);
    c.header('Content-Length', pdfBuffer.length.toString());

    return c.body(new Uint8Array(pdfBuffer));

  } catch (error) {
    console.error('❌ Preview PDF generation error:', error);
    return c.json({ 
      error: 'Failed to generate preview PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
});

//  PUBLIC MEMORIAL ROUTE
memorialsApp.get('/public/:id', async (c) => {
  const memorialId = c.req.param('id');

  try {
    // Try to find by ID or customUrl
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial) {
      // Try by customUrl
      const [memorialByUrl] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.customUrl, memorialId));

      if (!memorialByUrl) {
        return c.json({ error: 'Memorial not found' }, 404);
      }

      // Only return published memorials
      if (!memorialByUrl.isPublished) {
        return c.json({ error: 'Memorial is not published' }, 403);
      }

      return c.json({ memorial: memorialByUrl });
    }

    // Only return published memorials
    if (!memorial.isPublished) {
      return c.json({ error: 'Memorial is not published' }, 403);
    }

    return c.json({ memorial });
  } catch (error) {
    console.error('Error fetching public memorial:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});
export { memorialsApp };