import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();
export const createdAt = timestamp('createdAt',{withTimezone:true}).notNull().defaultNow();
export const updatedAt = timestamp('updatedAt',{withTimezone:true}).notNull().defaultNow().$onUpdate(()=>new Date());