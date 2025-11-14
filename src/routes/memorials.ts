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

    // COMPREHENSIVE DEBUGGING
    console.log('🔍 RAW DATABASE DATA ANALYSIS:', {
      id: memorial?.id,
      name: memorial?.name,
      // Check the actual data types and values
      timeline: {
        exists: !!memorial?.timeline,
        type: typeof memorial?.timeline,
        value: memorial?.timeline,
        isArray: Array.isArray(memorial?.timeline),
        length: Array.isArray(memorial?.timeline) ? memorial.timeline.length : 'N/A'
      },
      favorites: {
        exists: !!memorial?.favorites,
        type: typeof memorial?.favorites,
        value: memorial?.favorites,
        isArray: Array.isArray(memorial?.favorites),
        length: Array.isArray(memorial?.favorites) ? memorial.favorites.length : 'N/A'
      },
      familyTree: {
        exists: !!memorial?.familyTree,
        type: typeof memorial?.familyTree,
        value: memorial?.familyTree,
        isArray: Array.isArray(memorial?.familyTree),
        length: Array.isArray(memorial?.familyTree) ? memorial.familyTree.length : 'N/A'
      },
      gallery: {
        exists: !!memorial?.gallery,
        type: typeof memorial?.gallery,
        value: memorial?.gallery,
        isArray: Array.isArray(memorial?.gallery),
        length: Array.isArray(memorial?.gallery) ? memorial.gallery.length : 'N/A'
      },
      memoryWall: {
        exists: !!memorial?.memoryWall,
        type: typeof memorial?.memoryWall,
        value: memorial?.memoryWall,
        isArray: Array.isArray(memorial?.memoryWall),
        length: Array.isArray(memorial?.memoryWall) ? memorial.memoryWall.length : 'N/A'
      },
      serviceInfo: memorial?.serviceInfo
    });

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Get memories from the separate memories table
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, memorialId));

    console.log('📋 Memories from separate table:', memorialMemories.length);

    // Parse service info with proper typing
    const serviceInfo: ServiceInfo = memorial.serviceInfo as ServiceInfo || {};
    
    // ENHANCED TRANSFORMATION with proper array handling
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
      // CRITICAL FIX: Ensure arrays are properly parsed
      timeline: parseJSONArray(memorial.timeline),
      favorites: parseJSONArray(memorial.favorites),
      familyTree: parseJSONArray(memorial.familyTree),
      gallery: parseJSONArray(memorial.gallery),
      memoryWall: parseJSONArray(memorial.memoryWall),
      memories: memorialMemories || [],
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

    console.log('✅ FINAL TRANSFORMED DATA:', {
      id: transformedMemorial.id,
      name: transformedMemorial.name,
      timeline: Array.isArray(transformedMemorial.timeline) ? transformedMemorial.timeline.length : 'NOT ARRAY',
      favorites: Array.isArray(transformedMemorial.favorites) ? transformedMemorial.favorites.length : 'NOT ARRAY',
      familyTree: Array.isArray(transformedMemorial.familyTree) ? transformedMemorial.familyTree.length : 'NOT ARRAY',
      gallery: Array.isArray(transformedMemorial.gallery) ? transformedMemorial.gallery.length : 'NOT ARRAY',
      memoryWall: Array.isArray(transformedMemorial.memoryWall) ? transformedMemorial.memoryWall.length : 'NOT ARRAY',
      memories: Array.isArray(transformedMemorial.memories) ? transformedMemorial.memories.length : 'NOT ARRAY',
      hasService: !!(transformedMemorial.service && transformedMemorial.service.venue)
    });

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});

// HELPER FUNCTION to properly parse JSON arrays
function parseJSONArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('❌ Failed to parse JSON array:', error);
      return [];
    }
  }
  
  if (data === null || data === undefined) {
    return [];
  }
  
  return [];
}

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

// PUT /:id endpoint 

// FIXED PUT endpoint - handle customUrl properly
memorialsApp.put('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');
  const body = await c.req.json();

  console.log('📥 UPDATE REQUEST:', {
    memorialId,
    receivedFields: Object.keys(body)
  });

  try {
    // Get current memorial data
    const [currentMemorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!currentMemorial || currentMemorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // CRITICAL FIX: Only update fields that are sent in the request
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update simple text fields only if they're in the request AND not empty strings for customUrl
    if ('name' in body) updateData.name = body.name;
    if ('profileImage' in body) updateData.profileImage = body.profileImage;
    if ('birthDate' in body) updateData.birthDate = body.birthDate;
    if ('deathDate' in body) updateData.deathDate = body.deathDate;
    if ('location' in body) updateData.location = body.location;
    if ('obituary' in body) updateData.obituary = body.obituary;
    if ('theme' in body) updateData.theme = body.theme;
    
    // FIX: Only update customUrl if it's not empty and actually changed
    if ('customUrl' in body && body.customUrl && body.customUrl !== currentMemorial.customUrl) {
      updateData.customUrl = body.customUrl;
    }
    
    if ('isPublished' in body) updateData.isPublished = body.isPublished;

    // Update arrays only if they're in the request
    if ('timeline' in body) {
      updateData.timeline = Array.isArray(body.timeline) ? body.timeline : [];
    }
    if ('favorites' in body) {
      updateData.favorites = Array.isArray(body.favorites) ? body.favorites : [];
    }
    if ('familyTree' in body) {
      updateData.familyTree = Array.isArray(body.familyTree) ? body.familyTree : [];
    }
    if ('gallery' in body) {
      updateData.gallery = Array.isArray(body.gallery) ? body.gallery : [];
    }
    if ('memoryWall' in body) {
      updateData.memoryWall = Array.isArray(body.memoryWall) ? body.memoryWall : [];
    }

    // Handle service info
    if ('service' in body || 'serviceInfo' in body) {
      const currentService = currentMemorial.serviceInfo as ServiceInfo || {};
      const newService = body.service || body.serviceInfo || {};
      
      updateData.serviceInfo = {
        venue: newService.venue !== undefined ? newService.venue : currentService.venue || '',
        address: newService.address !== undefined ? newService.address : currentService.address || '',
        date: newService.date !== undefined ? newService.date : currentService.date || '',
        time: newService.time !== undefined ? newService.time : currentService.time || '',
        virtualLink: newService.virtualLink !== undefined ? newService.virtualLink : currentService.virtualLink || '',
        virtualPlatform: newService.virtualPlatform !== undefined ? newService.virtualPlatform : currentService.virtualPlatform || 'zoom'
      };
    }

    console.log('💾 Updating these fields:', Object.keys(updateData));

    // Perform the update
    const [updatedMemorial] = await db
      .update(memorials)
      .set(updateData)
      .where(eq(memorials.id, memorialId))
      .returning();

    console.log('✅ Memorial updated successfully');

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
//debug log
// Add this debug endpoint to check raw database data
memorialsApp.get('/:id/debug-raw', authMiddleware, async (c) => {
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

    // Return raw database data without transformation
    return c.json({
      rawData: {
        id: memorial.id,
        name: memorial.name,
        timeline: {
          raw: memorial.timeline,
          type: typeof memorial.timeline,
          isArray: Array.isArray(memorial.timeline),
          parsed: parseJSONArray(memorial.timeline),
          parsedLength: parseJSONArray(memorial.timeline).length
        },
        favorites: {
          raw: memorial.favorites,
          type: typeof memorial.favorites,
          isArray: Array.isArray(memorial.favorites),
          parsed: parseJSONArray(memorial.favorites),
          parsedLength: parseJSONArray(memorial.favorites).length
        },
        familyTree: {
          raw: memorial.familyTree,
          type: typeof memorial.familyTree,
          isArray: Array.isArray(memorial.familyTree),
          parsed: parseJSONArray(memorial.familyTree),
          parsedLength: parseJSONArray(memorial.familyTree).length
        },
        gallery: {
          raw: memorial.gallery,
          type: typeof memorial.gallery,
          isArray: Array.isArray(memorial.gallery),
          parsed: parseJSONArray(memorial.gallery),
          parsedLength: parseJSONArray(memorial.gallery).length
        },
        memoryWall: {
          raw: memorial.memoryWall,
          type: typeof memorial.memoryWall,
          isArray: Array.isArray(memorial.memoryWall),
          parsed: parseJSONArray(memorial.memoryWall),
          parsedLength: parseJSONArray(memorial.memoryWall).length
        },
        serviceInfo: memorial.serviceInfo
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return c.json({ error: 'Debug failed' }, 500);
  }
});
export { memorialsApp };