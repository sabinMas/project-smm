import session from 'express-session';
import { env } from '@/lib/env';

// Use a Prisma-backed session store so sessions survive server restarts.
// We implement a minimal PrismaSessionStore that satisfies express-session's Store interface.
import { prisma } from '@/lib/db';
import { Store } from 'express-session';

class PrismaSessionStore extends Store {
  async get(sid: string, cb: (err?: any, session?: session.SessionData | null) => void) {
    try {
      const row = await prisma.session.findUnique({ where: { sid } });
      if (!row || row.expiresAt < new Date()) {
        return cb(null, null);
      }
      cb(null, JSON.parse(row.data));
    } catch (e) {
      cb(e);
    }
  }

  async set(sid: string, sessionData: session.SessionData, cb?: (err?: any) => void) {
    try {
      const userId = (sessionData as any).passport?.user || '';
      const maxAge = sessionData.cookie?.maxAge || 7 * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + maxAge);

      await prisma.session.upsert({
        where: { sid },
        update: { data: JSON.stringify(sessionData), expiresAt, userId: userId || undefined },
        create: { sid, userId: userId || 'anonymous', data: JSON.stringify(sessionData), expiresAt },
      });
      cb?.();
    } catch (e) {
      cb?.(e);
    }
  }

  async destroy(sid: string, cb?: (err?: any) => void) {
    try {
      await prisma.session.delete({ where: { sid } }).catch(() => {});
      cb?.();
    } catch (e) {
      cb?.(e);
    }
  }
}

export const sessionMiddleware = session({
  store: new PrismaSessionStore(),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
