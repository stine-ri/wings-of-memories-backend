import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { auth } from './routes/auth.js';
import { authMiddleware } from './middleware/bearAuth.js';
import { memorialsApp } from './routes/memorials.js';
import { imagekitApp } from './routes/imagekit.js';
import { rsvpsApp } from './routes/rsvps.js';
const app = new Hono();

// CORS middleware 
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://wings-of-memory-frontend.vercel.app/'], 
  credentials: true,
}));

// Health check
app.get('/', (c) => c.json({ message: 'Wings of Memories API is running!' }));

// Auth routes (no auth required)
app.route('/api/auth', auth);

// Protected routes
app.route('/api/memorials', memorialsApp).use(authMiddleware);
app.route('/api/imagekit', imagekitApp);
app.route('/api/rsvps', rsvpsApp); 

const port = parseInt(process.env.PORT || '3000');

serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};