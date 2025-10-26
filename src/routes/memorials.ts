// backend/routes/memorials.ts - UPDATED with memoryWall
import { Hono } from 'hono';
import { db } from '../drizzle/db.js';
import { memorials } from '../drizzle/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/bearAuth.js';

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

    // Transform serviceInfo to service for frontend
    const transformedMemorial = {
      ...memorial,
      service: memorial.serviceInfo || {
        venue: '',
        address: '',
        date: '',
        time: ''
      }
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
        memoryWall: body.memoryWall || [], // ADD THIS LINE
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

// Update memorial - COMPLETE with all sections including memoryWall
memorialsApp.put('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('id');
  const body = await c.req.json();

  try {
    // Verify ownership
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
        memoryWall: body.memoryWall, // ADD THIS LINE
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

// Generate PDF
memorialsApp.post('/generate-pdf', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  try {
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, body.memorialId));

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    const pdfBuffer = await generateMemorialPDF(body.data);
    
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${memorial.name}-memorial.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return c.json({ error: 'Failed to generate PDF' }, 500);
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

// Mock PDF generation function
async function generateMemorialPDF(memorialData: any): Promise<Buffer> {
  // In reality, you would use a PDF generation service
  return Buffer.from('Mock PDF content - In production, integrate with PDF service');
}


export { memorialsApp };