import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../drizzle/db.js';
import { users } from '../drizzle/schema.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Generate JWT token
  const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

    return c.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.issues }, 400);
    }
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT token
  const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);
    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.issues }, 400);
    }
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get current user endpoint
auth.get('/me', async (c) => {
  const rawUserId = (c as any).get('userId');

  if (typeof rawUserId !== 'string') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const userId = rawUserId;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});

export { auth };