import { env } from "@/app/data/env/server"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/app/drizzle/schema"

export const db = drizzle(env.DATABASE_URL, { schema })