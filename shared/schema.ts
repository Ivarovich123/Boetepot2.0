import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  speler: text("speler").notNull(),
  datum: timestamp("datum").notNull().defaultNow(),
  bedrag: doublePrecision("bedrag").notNull(),
  reden: text("reden").notNull(),
});

export const insertFineSchema = createInsertSchema(fines).pick({
  speler: true,
  bedrag: true,
  reden: true,
});

export type InsertFine = z.infer<typeof insertFineSchema>;
export type Fine = typeof fines.$inferSelect;
