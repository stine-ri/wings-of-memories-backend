
// backend/routes/memorials.ts - COMPLETELY FIXED VERSION
import { Hono } from 'hono';
import { db } from '../drizzle/db.js';
import { memorials, memories, users } from '../drizzle/schema.js';
import { eq, desc, or , sql} from 'drizzle-orm';
import { authMiddleware } from '../middleware/bearAuth.js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { generateMemorialHTML } from '../utils/pdfTemplate.js';
import { inArray } from 'drizzle-orm';
import sharp from 'sharp';

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
// Helper function to optimize images before PDF generation
async function optimizeImageUrl(imageUrl: string): Promise<string> {
  try {
    // Skip if already optimized or is a data URL
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    console.log('🖼️ Optimizing image:', imageUrl.substring(0, 50) + '...');

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MemorialPDFBot/1.0)'
      },
      signal: AbortSignal.timeout(5000) // 5s timeout per image
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to fetch image, using original URL');
      return imageUrl;
    }

    const buffer = await response.arrayBuffer();

    // Compress and resize image
    const optimizedBuffer = await sharp(Buffer.from(buffer))
      .resize(1200, 1200, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80, 
        progressive: true 
      })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = optimizedBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;

  } catch (error) {
    console.warn('⚠️ Image optimization failed:', error);
    return imageUrl; // Fallback to original URL
  }
}

// Helper to optimize all images in memorial data
async function optimizeMemorialImages(memorial: any): Promise<any> {
  const optimized = { ...memorial };

  try {
    // Optimize profile image
    if (optimized.profileImage && optimized.profileImage.startsWith('http')) {
      optimized.profileImage = await optimizeImageUrl(optimized.profileImage);
    }

    // Optimize gallery images (limit to first 20 to avoid timeout)
    if (Array.isArray(optimized.gallery)) {
      console.log(`🖼️ Optimizing ${Math.min(optimized.gallery.length, 20)} gallery images...`);
      const galleryToOptimize = optimized.gallery.slice(0, 20);
      optimized.gallery = await Promise.all(
        galleryToOptimize.map(async (item: any) => {
          if (item.url && item.url.startsWith('http')) {
            return { ...item, url: await optimizeImageUrl(item.url) };
          }
          return item;
        })
      );
    }

    // Optimize timeline images
    if (Array.isArray(optimized.timeline)) {
      optimized.timeline = await Promise.all(
        optimized.timeline.map(async (event: any) => {
          if (event.image && event.image.startsWith('http')) {
            return { ...event, image: await optimizeImageUrl(event.image) };
          }
          return event;
        })
      );
    }

    // Optimize family tree photos
    if (Array.isArray(optimized.familyTree)) {
      optimized.familyTree = await Promise.all(
        optimized.familyTree.map(async (member: any) => {
          if (member.photo && member.photo.startsWith('http')) {
            return { ...member, photo: await optimizeImageUrl(member.photo) };
          }
          return member;
        })
      );
    }

    console.log('✅ Image optimization complete');
    return optimized;

  } catch (error) {
    console.error('❌ Image optimization error:', error);
    return memorial; // Return original if optimization fails
  }
}

// Helper function to ensure complete memorial data
const ensureCompleteMemorialData = (memorial: any) => {
  return {
    ...memorial,
    id: memorial.id || '',
    name: memorial.name || 'Unnamed Memorial',
    profileImage: memorial.profileImage || '',
    birthDate: memorial.birthDate || '',
    deathDate: memorial.deathDate || '',
    location: memorial.location || '',
    obituary: memorial.obituary || '',
    timeline: Array.isArray(memorial.timeline) ? memorial.timeline : [],
    favorites: Array.isArray(memorial.favorites) ? memorial.favorites : [],
    familyTree: Array.isArray(memorial.familyTree) ? memorial.familyTree : [],
    gallery: Array.isArray(memorial.gallery) ? memorial.gallery : [],
    memoryWall: Array.isArray(memorial.memoryWall) ? memorial.memoryWall : [],
    service: memorial.service || {
      venue: '',
      address: '',
      date: '',
      time: '',
      virtualLink: '',
      virtualPlatform: 'zoom'
    },
    memories: Array.isArray(memorial.memories) ? memorial.memories : [],
    isPublished: Boolean(memorial.isPublished),
    customUrl: memorial.customUrl || '',
    theme: memorial.theme || 'default'
  };
};

// Helper function to generate PDF response
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
      tributes: memorial.memoryWall || [], 
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

// Helper function to parse family tree data
function parseFamilyTreeData(familyTreeData: any): any[] {
  if (!familyTreeData) return [];
  
  // If it's already an array, return it
  if (Array.isArray(familyTreeData)) {
    return familyTreeData;
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof familyTreeData === 'string') {
    try {
      // Clean the string if needed (remove extra quotes, etc.)
      let cleanString = familyTreeData.trim();
      if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
        cleanString = cleanString.slice(1, -1);
      }
      
      const parsed = JSON.parse(cleanString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('❌ Failed to parse familyTree string:', error);
      console.error('String value:', familyTreeData);
      return [];
    }
  }
  
  // If it's an object (but not array), wrap it
  if (typeof familyTreeData === 'object' && familyTreeData !== null && !Array.isArray(familyTreeData)) {
    return [familyTreeData];
  }
  
  return [];
}

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

// ✅ FIXED: Helper function to clean memorial identifier
function cleanMemorialIdentifier(identifier: string): string {
  // Remove "memorial-" prefix if it exists
  if (identifier.startsWith('memorial-')) {
    return identifier.replace('memorial-', '');
  }
  return identifier;
}

// ✅ FIXED: Public memorial route with proper identifier handling
// ✅ FIXED: Public memorial route with proper family tree parsing
memorialsApp.get('/public/:identifier', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);

  console.log('🔍 Public memorial request for:', { raw: rawIdentifier, cleaned: identifier });

  try {
    let memorial = null;

    // Try to find by ID first
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));

      if (memorialById) {
        memorial = memorialById;
        console.log('✅ Found by ID:', memorial.id);
      }
    } catch (error) {
      console.log('⚠️ ID search failed, trying customUrl:', error);
    }

    // If not found by ID, try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));

        if (memorialByUrl) {
          memorial = memorialByUrl;
          console.log('✅ Found by customUrl:', memorial.customUrl);
        }
      } catch (error) {
        console.log('⚠️ CustomUrl search failed:', error);
      }
    }

    if (!memorial) {
      console.log('❌ Memorial not found:', identifier);
      return c.json({ 
        error: 'Memorial not found',
        details: `No memorial found with identifier: ${identifier}`
      }, 404);
    }

    // ✅ CRITICAL FIX: Parse family tree data
    const familyTreeData = parseFamilyTreeData(memorial.familyTree);
    
    console.log('✅ Family tree parsing:', {
      rawType: typeof memorial.familyTree,
      rawIsArray: Array.isArray(memorial.familyTree),
      rawValue: memorial.familyTree,
      parsedLength: familyTreeData.length,
      parsedFirstItem: familyTreeData[0]
    });

    // Get memories for this memorial
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, memorial.id));

    // Parse service info
    const serviceInfo = memorial.serviceInfo || {};

    // Add relative time to tributes
    const memoryWall = Array.isArray(memorial.memoryWall) 
      ? memorial.memoryWall.map((tribute: any) => ({
          ...tribute,
          relativeTime: getRelativeTime(new Date(tribute.createdAt || new Date()))
        }))
      : [];

    // Return complete memorial data
    const transformedMemorial = {
      ...memorial,
      service: serviceInfo,
      serviceInfo: serviceInfo,
      timeline: Array.isArray(memorial.timeline) ? memorial.timeline : [],
      favorites: Array.isArray(memorial.favorites) ? memorial.favorites : [],
      familyTree: familyTreeData, // ✅ Use properly parsed data
      gallery: Array.isArray(memorial.gallery) ? memorial.gallery : [],
      memoryWall: memoryWall,
      tributes: memoryWall,
      memories: memorialMemories || []
    };

    console.log('✅ Returning memorial with:', {
      name: transformedMemorial.name,
      familyTreeMembers: transformedMemorial.familyTree.length,
      timelineEvents: transformedMemorial.timeline.length,
      galleryImages: transformedMemorial.gallery.length,
      tributes: transformedMemorial.tributes.length
    });

    return c.json({ 
      memorial: transformedMemorial,
      _debug: {
        familyTree: {
          parsedCount: familyTreeData.length,
          members: familyTreeData.map(m => ({ id: m.id, name: m.name, relation: m.relation }))
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching public memorial:', error);
    return c.json({ 
      error: 'Failed to fetch memorial',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
// Test endpoint for family tree debugging
memorialsApp.get('/debug/family-tree/:identifier', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);

  try {
    let memorial = null;

    // Try by ID
    try {
      const [memorialById] = await db
        .select({
          id: memorials.id,
          name: memorials.name,
          familyTreeRaw: memorials.familyTree,
          familyTreeType: sql<string>`pg_typeof(${memorials.familyTree})`.as('type')
        })
        .from(memorials)
        .where(eq(memorials.id, identifier));

      if (memorialById) memorial = memorialById;
    } catch (error) {
      console.log('ID search failed');
    }

    // Try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select({
            id: memorials.id,
            name: memorials.name,
            familyTreeRaw: memorials.familyTree,
            familyTreeType: sql<string>`pg_typeof(${memorials.familyTree})`.as('type')
          })
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));

        if (memorialByUrl) memorial = memorialByUrl;
      } catch (error) {
        console.log('CustomUrl search failed');
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Parse the data
    const parsedFamilyTree = parseFamilyTreeData(memorial.familyTreeRaw);

    return c.json({
      success: true,
      memorial: {
        id: memorial.id,
        name: memorial.name
      },
      familyTree: {
        raw: memorial.familyTreeRaw,
        rawType: memorial.familyTreeType,
        parsed: parsedFamilyTree,
        parsedCount: parsedFamilyTree.length,
        parsedMembers: parsedFamilyTree.map(m => ({
          id: m.id,
          name: m.name,
          relation: m.relation,
          image: m.image ? 'has image' : 'no image'
        }))
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
// ✅ FIXED: Get memorial for PDF preview with proper identifier handling
memorialsApp.get('/:id/pdf-data', async (c) => {
  const rawId = c.req.param('id');
  const memorialId = cleanMemorialIdentifier(rawId);

  console.log('📊 PDF data request for:', { raw: rawId, cleaned: memorialId });

  try {
    let memorial = null;

    // Try to find by ID first
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, memorialId));

      if (memorialById) {
        memorial = memorialById;
        console.log('✅ Found by ID for PDF data:', memorial.id);
      }
    } catch (error) {
      console.log('⚠️ ID search failed for PDF data, trying customUrl:', error);
    }

    // If not found by ID, try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, memorialId));

        if (memorialByUrl) {
          memorial = memorialByUrl;
          console.log('✅ Found by customUrl for PDF data:', memorial.customUrl);
        }
      } catch (error) {
        console.log('⚠️ CustomUrl search failed for PDF data:', error);
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
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
      tributes: memorial.memoryWall || [],  
      memories: memorialMemories || []
    };

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('Error fetching memorial for PDF data:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});

// ✅ FIXED: Stream PDF directly for preview with proper identifier handling
memorialsApp.get('/:id/preview-pdf', async (c) => {
  const rawId = c.req.param('id');
  const memorialId = cleanMemorialIdentifier(rawId);
  let browser = null;

  console.log('📄 PDF preview request for:', { raw: rawId, cleaned: memorialId });

  try {
    let memorial = null;

    // Try to find by ID first
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, memorialId));

      if (memorialById) {
        memorial = memorialById;
        console.log('✅ Found by ID for PDF preview:', memorial.id);
      }
    } catch (error) {
      console.log('⚠️ ID search failed for PDF preview, trying customUrl:', error);
    }

    // If not found by ID, try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, memorialId));

        if (memorialByUrl) {
          memorial = memorialByUrl;
          console.log('✅ Found by customUrl for PDF preview:', memorial.customUrl);
        }
      } catch (error) {
        console.log('⚠️ CustomUrl search failed for PDF preview:', error);
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    return await generatePDFResponse(c, memorial);

  } catch (error) {
    console.error('❌ PDF preview error:', error);
    return c.json({ 
      error: 'Failed to generate PDF preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ✅ FIXED: Legacy public memorial route for compatibility
memorialsApp.get('/public/:id', async (c) => {
  const rawId = c.req.param('id');
  const memorialId = cleanMemorialIdentifier(rawId);

  try {
    let memorial = null;

    // Try to find by ID first
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, memorialId));

      if (memorialById) {
        memorial = memorialById;
      }
    } catch (error) {
      console.log('ID search failed:', error);
    }

    // If not found by ID, try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, memorialId));

        if (memorialByUrl) {
          memorial = memorialByUrl;
        }
      } catch (error) {
        console.log('CustomUrl search failed:', error);
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
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

// Get all public memorials with search and filters
memorialsApp.get('/public', async (c) => {
  try {
    // Get query parameters
    const searchQuery = c.req.query('search')?.toLowerCase() || '';
    const sortBy = c.req.query('sortBy') || 'recent'; // recent, oldest, name
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    console.log('🔍 Public memorials search:', { searchQuery, sortBy, limit, offset });

    // Get all published memorials
    let query = db
      .select()
      .from(memorials)
      .where(eq(memorials.isPublished, true));

    // Fetch all results first for filtering
    const allMemorials = await query;

    // Filter by search query if provided
    let filteredMemorials = allMemorials;
    if (searchQuery) {
      filteredMemorials = allMemorials.filter(memorial => {
        const nameMatch = memorial.name?.toLowerCase().includes(searchQuery);
        const locationMatch = memorial.location?.toLowerCase().includes(searchQuery);
        const obituaryMatch = memorial.obituary?.toLowerCase().includes(searchQuery);
        
        return nameMatch || locationMatch || obituaryMatch;
      });
    }

    // Sort memorials
    filteredMemorials.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Apply pagination
    const total = filteredMemorials.length;
    const paginatedMemorials = filteredMemorials.slice(offset, offset + limit);

    // Transform memorials for frontend
    const transformedMemorials = paginatedMemorials.map(memorial => ({
      id: memorial.id,
      name: memorial.name,
      profileImage: memorial.profileImage,
      birthDate: memorial.birthDate,
      deathDate: memorial.deathDate,
      location: memorial.location,
      obituary: memorial.obituary ? memorial.obituary.substring(0, 150) + '...' : '',
      customUrl: memorial.customUrl,
      createdAt: memorial.createdAt,
      theme: memorial.theme
    }));

    console.log('✅ Found', total, 'published memorials, returning', paginatedMemorials.length);

    return c.json({
      memorials: transformedMemorials,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching public memorials:', error);
    return c.json({
      error: 'Failed to fetch memorials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// =============================================================================
// PROTECTED ROUTES (Authentication required)
// =============================================================================

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
    
    // Use the helper to ensure complete data
    const transformedMemorial = ensureCompleteMemorialData({
      ...memorial,
      service: serviceInfo,
      memories: memorialMemories || []
    });

    console.log('✅ Returning complete memorial data:', {
      id: transformedMemorial.id,
      name: transformedMemorial.name,
      hasAllData: true
    });

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return c.json({ error: 'Failed to fetch memorial' }, 500);
  }
});

// Create new memorial - FIXED (no memories field needed)
memorialsApp.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  try {

    // Accept both memoryWall and tributes
    const memoryWallData = body.memoryWall || body.tributes || [];

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
         memoryWall: memoryWallData,
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
  updateData.gallery = Array.isArray(body.gallery) ? body.gallery.map((img: any) => ({
    id: img.id || crypto.randomUUID(),
    url: img.url || '',
    category: img.category || 'Other Memories',
    caption: img.caption || img.description || '', // Capture both caption and description
    description: img.description || img.caption || '', // Ensure description exists
    alt: img.alt || img.caption || img.description || '',
    title: img.title || img.caption || img.description || '',
    uploadedAt: img.uploadedAt || new Date().toISOString()
  })) : [];
}
   if ('memoryWall' in body || 'tributes' in body) {
      const tributesData = body.tributes || body.memoryWall || [];
      updateData.memoryWall = Array.isArray(tributesData) ? tributesData : [];
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

// Add this DELETE endpoint (put it near other routes)
memorialsApp.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');

  try {
    // First verify the memorial belongs to the user
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // First delete associated memories
    await db
      .delete(memories)
      .where(eq(memories.memorialId, memorialId));

    // Then delete the memorial
    await db
      .delete(memorials)
      .where(eq(memorials.id, memorialId));

    console.log(`✅ Memorial ${memorialId} deleted successfully`);

    return c.json({ 
      success: true, 
      message: 'Memorial deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete memorial error:', error);
    return c.json({ 
      error: 'Failed to delete memorial',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
//editing and adding tributes
// backend/routes/memorials.ts - ADD THESE NEW ROUTES

// Helper function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

// NEW ROUTE: Add public tribute (no auth required)
// backend/routes/memorials.ts - Update the public tribute route

memorialsApp.post('/public/:identifier/tributes', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);
  const body = await c.req.json();

  console.log('💐 Public tribute submission for:', identifier, 'sessionId:', body.sessionId);

  try {
    // Validate required fields
    if (!body.authorName || !body.message) {
      return c.json({ 
        error: 'Author name and message are required' 
      }, 400);
    }

    // Find memorial by ID or customUrl
    let memorial = null;
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));
      if (memorialById) memorial = memorialById;
    } catch (error) {
      console.log('Trying customUrl...');
    }

    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));
        if (memorialByUrl) memorial = memorialByUrl;
      } catch (error) {
        console.log('CustomUrl search failed');
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Check if memorial allows public tributes
    if (!memorial.isPublished) {
      return c.json({ 
        error: 'This memorial is not accepting tributes' 
      }, 403);
    }

    // Create new tribute WITH sessionId
    const newTribute = {
      id: crypto.randomUUID(),
      authorName: body.authorName,
      authorLocation: body.authorLocation || '',
      message: body.message,
      authorImage: body.authorImage || '',
      createdAt: new Date().toISOString(),
      isPublic: true,
      sessionId: body.sessionId || null, // Store the session ID
      isAnonymous: body.authorName === 'Anonymous'
    };

    // Get current memoryWall/tributes
    const currentTributes = Array.isArray(memorial.memoryWall) 
      ? memorial.memoryWall 
      : [];

    // Add new tribute
    const updatedTributes = [...currentTributes, newTribute];

    // Update memorial with new tribute
    const [updatedMemorial] = await db
      .update(memorials)
      .set({
        memoryWall: updatedTributes,
        updatedAt: new Date()
      })
      .where(eq(memorials.id, memorial.id))
      .returning();

    console.log('✅ Public tribute added with sessionId:', newTribute.sessionId);

    // Return the new tribute with relative time
    return c.json({
      success: true,
      tribute: {
        ...newTribute,
        relativeTime: getRelativeTime(new Date(newTribute.createdAt))
      }
    }, 201);

  } catch (error) {
    console.error('❌ Error adding public tribute:', error);
    return c.json({ 
      error: 'Failed to add tribute',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Add new endpoints for editing and deleting tributes with session validation
memorialsApp.put('/public/:identifier/tributes/:tributeId', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);
  const tributeId = c.req.param('tributeId');
  const body = await c.req.json();

  console.log('✏️ Editing tribute:', { identifier, tributeId, sessionId: body.sessionId });

  try {
    // Find memorial
    let memorial = null;
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));
      if (memorialById) memorial = memorialById;
    } catch (error) {
      console.log('Trying customUrl...');
    }

    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));
        if (memorialByUrl) memorial = memorialByUrl;
      } catch (error) {
        console.log('CustomUrl search failed');
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Get current tributes
    const currentTributes = Array.isArray(memorial.memoryWall) 
      ? memorial.memoryWall 
      : [];

    // Find the tribute to edit
    const tributeIndex = currentTributes.findIndex((t: any) => t.id === tributeId);
    if (tributeIndex === -1) {
      return c.json({ error: 'Tribute not found' }, 404);
    }

    const tribute = currentTributes[tributeIndex];

    // Verify session ID matches (only creator can edit)
    if (tribute.sessionId !== body.sessionId) {
      return c.json({ 
        error: 'Unauthorized to edit this tribute',
        details: 'Session ID does not match'
      }, 403);
    }

    // Update the tribute
    const updatedTribute = {
      ...tribute,
      authorName: body.authorName || tribute.authorName,
      authorLocation: body.authorLocation || tribute.authorLocation,
      message: body.message || tribute.message,
      authorImage: body.authorImage || tribute.authorImage,
      updatedAt: new Date().toISOString()
    };

    // Replace in array
    currentTributes[tributeIndex] = updatedTribute;

    // Update memorial
    const [updatedMemorial] = await db
      .update(memorials)
      .set({
        memoryWall: currentTributes,
        updatedAt: new Date()
      })
      .where(eq(memorials.id, memorial.id))
      .returning();

    console.log('✅ Tribute updated successfully');

    return c.json({
      success: true,
      tribute: {
        ...updatedTribute,
        relativeTime: getRelativeTime(new Date(updatedTribute.createdAt || new Date()))
      }
    });

  } catch (error) {
    console.error('❌ Error editing tribute:', error);
    return c.json({ 
      error: 'Failed to edit tribute',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

memorialsApp.delete('/public/:identifier/tributes/:tributeId', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);
  const tributeId = c.req.param('tributeId');
  const body = await c.req.json();

  console.log('🗑️ Deleting tribute:', { identifier, tributeId, sessionId: body.sessionId });

  try {
    // Find memorial
    let memorial = null;
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));
      if (memorialById) memorial = memorialById;
    } catch (error) {
      console.log('Trying customUrl...');
    }

    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));
        if (memorialByUrl) memorial = memorialByUrl;
      } catch (error) {
        console.log('CustomUrl search failed');
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Get current tributes
    const currentTributes = Array.isArray(memorial.memoryWall) 
      ? memorial.memoryWall 
      : [];

    // Find the tribute to delete
    const tributeIndex = currentTributes.findIndex((t: any) => t.id === tributeId);
    if (tributeIndex === -1) {
      return c.json({ error: 'Tribute not found' }, 404);
    }

    const tribute = currentTributes[tributeIndex];

    // Verify session ID matches (only creator can delete)
    if (tribute.sessionId !== body.sessionId) {
      return c.json({ 
        error: 'Unauthorized to delete this tribute',
        details: 'Session ID does not match'
      }, 403);
    }

    // Remove from array
    currentTributes.splice(tributeIndex, 1);

    // Update memorial
    const [updatedMemorial] = await db
      .update(memorials)
      .set({
        memoryWall: currentTributes,
        updatedAt: new Date()
      })
      .where(eq(memorials.id, memorial.id))
      .returning();

    console.log('✅ Tribute deleted successfully');

    return c.json({
      success: true,
      message: 'Tribute deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting tribute:', error);
    return c.json({ 
      error: 'Failed to delete tribute',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// NEW ROUTE: Get public tributes with relative time
memorialsApp.get('/public/:identifier/tributes', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);

  try {
    // Find memorial
    let memorial = null;
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));
      if (memorialById) memorial = memorialById;
    } catch (error) {
      console.log('Trying customUrl...');
    }

    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));
        if (memorialByUrl) memorial = memorialByUrl;
      } catch (error) {
        console.log('CustomUrl search failed');
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    // Get tributes and add relative time
    const tributes = Array.isArray(memorial.memoryWall) 
      ? memorial.memoryWall 
      : [];

    const tributesWithRelativeTime = tributes.map((tribute: any) => ({
      ...tribute,
      relativeTime: getRelativeTime(new Date(tribute.createdAt || new Date()))
    }));

    return c.json({ 
      tributes: tributesWithRelativeTime,
      total: tributesWithRelativeTime.length
    });

  } catch (error) {
    console.error('❌ Error fetching tributes:', error);
    return c.json({ 
      error: 'Failed to fetch tributes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// UPDATED: Modify the public memorial route to include relative times
memorialsApp.get('/public/:identifier', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);

  console.log('🔍 Public memorial request for:', { raw: rawIdentifier, cleaned: identifier });

  try {
    let memorial = null;

    // Try to find by ID first
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));

      if (memorialById) {
        memorial = memorialById;
        console.log('✅ Found by ID:', memorial.id);
      }
    } catch (error) {
      console.log('⚠️ ID search failed, trying customUrl:', error);
    }

    // If not found by ID, try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));

        if (memorialByUrl) {
          memorial = memorialByUrl;
          console.log('✅ Found by customUrl:', memorial.customUrl);
        }
      } catch (error) {
        console.log('⚠️ CustomUrl search failed:', error);
      }
    }

    if (!memorial) {
      console.log('❌ Memorial not found:', identifier);
      return c.json({ 
        error: 'Memorial not found',
        details: `No memorial found with identifier: ${identifier}`
      }, 404);
    }

    // Get memories for this memorial
    const memorialMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.memorialId, memorial.id));

    // Parse service info with proper typing
    const serviceInfo = memorial.serviceInfo as ServiceInfo || {};

    // Add relative time to tributes
    const memoryWall = Array.isArray(memorial.memoryWall) 
      ? memorial.memoryWall.map((tribute: any) => ({
          ...tribute,
          relativeTime: getRelativeTime(new Date(tribute.createdAt || new Date()))
        }))
      : [];

    // Return complete memorial data with relative times
    const transformedMemorial = {
      ...memorial,
      service: serviceInfo,
      serviceInfo: serviceInfo,
      timeline: memorial.timeline || [],
      favorites: memorial.favorites || [],
      familyTree: memorial.familyTree || [],
      gallery: memorial.gallery || [],
      memoryWall: memoryWall,
      tributes: memoryWall,
      memories: memorialMemories || []
    };

    console.log('✅ Returning memorial data with relative times');

    return c.json({ memorial: transformedMemorial });
  } catch (error) {
    console.error('❌ Error fetching public memorial:', error);
    return c.json({ 
      error: 'Failed to fetch memorial',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
// Add this debug endpoint to check raw family tree data
memorialsApp.get('/debug/:identifier/family-tree', async (c) => {
  const rawIdentifier = c.req.param('identifier');
  const identifier = cleanMemorialIdentifier(rawIdentifier);

  try {
    let memorial = null;

    // Try by ID
    try {
      const [memorialById] = await db
        .select()
        .from(memorials)
        .where(eq(memorials.id, identifier));
      if (memorialById) memorial = memorialById;
    } catch (error) {
      console.log('ID search failed');
    }

    // Try by customUrl
    if (!memorial) {
      try {
        const [memorialByUrl] = await db
          .select()
          .from(memorials)
          .where(eq(memorials.customUrl, identifier));
        if (memorialByUrl) memorial = memorialByUrl;
      } catch (error) {
        console.log('CustomUrl search failed');
      }
    }

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    console.log('🔍 RAW familyTree field from DB:', {
      type: typeof memorial.familyTree,
      isArray: Array.isArray(memorial.familyTree),
      value: memorial.familyTree,
      stringified: JSON.stringify(memorial.familyTree)
    });

    return c.json({
      memorialId: memorial.id,
      familyTree: memorial.familyTree,
      familyTreeType: typeof memorial.familyTree,
      familyTreeLength: Array.isArray(memorial.familyTree) ? memorial.familyTree.length : 'Not array'
    });
  } catch (error) {
    console.error('Debug error:', error);
    return c.json({ error: 'Debug failed' }, 500);
  }
});
export { memorialsApp };