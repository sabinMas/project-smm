import { Router, Request, Response, NextFunction } from 'express';
import passport from './passport';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

const router = Router();

const FRONTEND_URL = env.CORS_ORIGIN.split(',')[0].trim();

// ── Email/Password Registration ─────────────────────────────────────────────
router.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, name: name || email.split('@')[0] },
    });

    // Auto-login after registration
    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ user: sanitizeUser(user) });
    });
  } catch (e) {
    next(e);
  }
});

// ── Email/Password Login ────────────────────────────────────────────────────
router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ user: sanitizeUser(user) });
    });
  } catch (e) {
    next(e);
  }
});

// ── Logout ──────────────────────────────────────────────────────────────────
router.post('/auth/logout', (req: Request, res: Response) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

// ── Current User ────────────────────────────────────────────────────────────
router.get('/auth/me', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ user: sanitizeUser(req.user as any) });
  } else {
    res.status(401).json({ user: null });
  }
});

// ── Google OAuth ────────────────────────────────────────────────────────────
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (_req: Request, res: Response) => {
    res.redirect(FRONTEND_URL);
  }
);

// ── GitHub OAuth ────────────────────────────────────────────────────────────
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=github_failed` }),
  (_req: Request, res: Response) => {
    res.redirect(FRONTEND_URL);
  }
);

// ── Helpers ─────────────────────────────────────────────────────────────────
function sanitizeUser(user: { id: string; email: string; name: string; avatarUrl?: string | null }) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
}

export default router;
