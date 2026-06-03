import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that requires the request to have an authenticated session.
 * Returns 401 if not authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

/**
 * Helper to get the authenticated user's ID from the request.
 * Throws if not authenticated (use after requireAuth middleware).
 */
export function getUserId(req: Request): string {
  const user = req.user as { id: string } | undefined;
  if (!user?.id) throw new Error('No authenticated user');
  return user.id;
}
