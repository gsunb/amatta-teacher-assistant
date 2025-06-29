import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Only setup Google auth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Dynamic callback URL based on environment
    const getCallbackURL = () => {
      if (process.env.NODE_ENV === 'production' && process.env.REPLIT_DOMAINS) {
        return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/google/callback`;
      }
      return 'http://localhost:5000/api/auth/google/callback';
    };

    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL()
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const userData = {
          id: profile.id,
          email: profile.emails?.[0]?.value || null,
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          profileImageUrl: profile.photos?.[0]?.value || null,
        };

        // Upsert user in database
        const user = await storage.upsertUser(userData);
        
        // Create session-compatible user object
        const sessionUser = {
          claims: {
            sub: profile.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            profile_image_url: userData.profileImageUrl,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        };

        return done(null, sessionUser);
      } catch (error) {
        return done(error as Error, false);
      }
    }));

    // Google OAuth routes
    app.get("/api/auth/google", 
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/auth/google/callback",
      passport.authenticate("google", { 
        successRedirect: "/",
        failureRedirect: "/api/login"
      })
    );
  }
}

export function isGoogleAuthAvailable(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}