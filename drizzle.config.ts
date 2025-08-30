import { env } from '@/app/data/env/server';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/app/drizzle/migrations',
  schema: './src/app/drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
