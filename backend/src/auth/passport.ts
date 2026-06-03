import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

// Serialization: store only user ID in session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

// ── Google OAuth ────────────────────────────────────────────────────────────
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.PUBLIC_BACKEND_URL}/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), undefined);

          // Find existing account link or create user
          const existingAccount = await prisma.account.findUnique({
            where: { provider_providerAccountId: { provider: 'google', providerAccountId: profile.id } },
            include: { user: true },
          });

          if (existingAccount) {
            return done(null, existingAccount.user);
          }

          // Check if user with this email already exists (link account)
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                avatarUrl: profile.photos?.[0]?.value,
              },
            });
          }

          // Create account link
          await prisma.account.create({
            data: {
              userId: user.id,
              provider: 'google',
              providerAccountId: profile.id,
            },
          });

          done(null, user);
        } catch (e) {
          done(e as Error, undefined);
        }
      }
    )
  );
}

// ── GitHub OAuth ────────────────────────────────────────────────────────────
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${env.PUBLIC_BACKEND_URL}/auth/github/callback`,
        scope: ['user:email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email =
            profile.emails?.[0]?.value || `${profile.username}@github.noemail`;
          
          const existingAccount = await prisma.account.findUnique({
            where: { provider_providerAccountId: { provider: 'github', providerAccountId: profile.id } },
            include: { user: true },
          });

          if (existingAccount) {
            return done(null, existingAccount.user);
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || profile.username || email.split('@')[0],
                avatarUrl: profile.photos?.[0]?.value,
              },
            });
          }

          await prisma.account.create({
            data: {
              userId: user.id,
              provider: 'github',
              providerAccountId: profile.id,
            },
          });

          done(null, user);
        } catch (e) {
          done(e as Error, undefined);
        }
      }
    )
  );
}

export default passport;
