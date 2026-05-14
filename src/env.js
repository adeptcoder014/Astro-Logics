import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
const isProd = process.env.NODE_ENV === "production";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  
    server: {
    AUTH_SECRET: isProd ? z.string() : z.string().optional(),
    AUTH_DISCORD_ID: isProd ? z.string() : z.string().optional(),
    AUTH_DISCORD_SECRET: isProd ? z.string() : z.string().optional(),
    // AUTH_GOOGLE_ID: isProd ? z.string() : z.string().optional(),
    // AUTH_GOOGLE_SECRET: isProd ? z.string() : z.string().optional(),
    DATABASE_URL: isProd ? z.string().url() : z.string().url().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // Google Gemini API configuration
    API_KEY: isProd ? z.string() : z.string().optional(),
    // Google Cloud Storage configuration
    GCS_BUCKET_NAME: z.string().optional(),
    GCS_PROJECT_ID: z.string().optional(),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  },
  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_AGENT_RUNTIME_URL: z.string().url().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    // AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    // AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV,
    API_KEY: process.env.API_KEY,
    GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
    GCS_PROJECT_ID: process.env.GCS_PROJECT_ID,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    NEXT_PUBLIC_AGENT_RUNTIME_URL: process.env.NEXT_PUBLIC_AGENT_RUNTIME_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
