// backend/routes/rsvps.ts - FIXED
import { Hono } from 'hono';
import { db } from '../drizzle/db.js';
import { rsvps, memorials } from '../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/bearAuth.js';

const rsvpsApp = new Hono();

// Get RSVPs for a memorial (authenticated - owner only)
rsvpsApp.get('/:memorialId', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const memorialId = c.req.param('memorialId');

  try {
    // Verify memorial ownership
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, memorialId));

    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Memorial not found or unauthorized' }, 404);
    }

    // Get RSVPs for this memorial
    const memorialRsvps = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.memorialId, memorialId));

    return c.json({ rsvps: memorialRsvps });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return c.json({ error: 'Failed to fetch RSVPs' }, 500);
  }
});

// Create RSVP (public endpoint - for memorial visitors)
rsvpsApp.post('/', async (c) => {
  const body = await c.req.json();

  try {
    // Verify memorial exists
    const [memorial] = await db
      .select()
      .from(memorials)
      .where(eq(memorials.id, body.memorialId));

    if (!memorial) {
      return c.json({ error: 'Memorial not found' }, 404);
    }

    const [rsvp] = await db
      .insert(rsvps)
      .values({
        memorialId: body.memorialId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        attending: body.attending,
        guests: body.guests || [],
      })
      .returning();

    return c.json({ rsvp }, 201);
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return c.json({ error: 'Failed to create RSVP' }, 500);
  }
});

// Delete RSVP (authenticated - owner only)
rsvpsApp.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const rsvpId = c.req.param('id');

  try {
    // Get RSVP with memorial data in a single query
    const result = await db
      .select({
        rsvp: rsvps,
        memorial: memorials
      })
      .from(rsvps)
      .leftJoin(memorials, eq(rsvps.memorialId, memorials.id))
      .where(eq(rsvps.id, rsvpId));

    if (result.length === 0) {
      return c.json({ error: 'RSVP not found' }, 404);
    }

    const { rsvp, memorial } = result[0];

    // Verify memorial ownership
    if (!memorial || memorial.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await db
      .delete(rsvps)
      .where(eq(rsvps.id, rsvpId));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return c.json({ error: 'Failed to delete RSVP' }, 500);
  }
});

export { rsvpsApp };