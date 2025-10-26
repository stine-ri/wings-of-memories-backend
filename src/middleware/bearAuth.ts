import { createMiddleware } from 'hono/factory';
import { verify } from 'jsonwebtoken';

export interface AuthVariables {
  userId: string;
  userRole: string;
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: string;
      };
      
      c.set('userId', decoded.userId);
      c.set('userRole', decoded.role);
      await next();
    } catch (error) {
      return c.json({ error: 'Invalid token' }, 401);
    }
  }
);