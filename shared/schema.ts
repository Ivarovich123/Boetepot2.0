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

export const reasons = pgTable("reasons", {
  id: serial("id").primaryKey(),
  naam: text("naam").notNull().unique(),
  bedrag: doublePrecision("bedrag").notNull().default(5),
});

export const insertReasonSchema = createInsertSchema(reasons).pick({
  naam: true,
  bedrag: true,
});

export type InsertReason = z.infer<typeof insertReasonSchema>;
export type Reason = typeof reasons.$inferSelect;
