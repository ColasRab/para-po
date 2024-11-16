import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        GOOGLE_ID: z.string(),
        GOOGLE_SECRET: z.string(),
        NEXTAUTH_SECRET: z.string(),
        FB_ACCESS_TOKEN: z.string(),
    },
    client: {
        NEXT_PUBLIC_GOOGLE_MAP_API: z.string(),
        NEXT_PUBLIC_APP_URL: z.string().url(),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        GOOGLE_ID: process.env.GOOGLE_ID,
        GOOGLE_SECRET: process.env.GOOGLE_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXT_PUBLIC_GOOGLE_MAP_API: process.env.NEXT_PUBLIC_GOOGLE_MAP_API,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        FB_ACCESS_TOKEN: process.env.FB_ACCESS_TOKEN,
    },
});