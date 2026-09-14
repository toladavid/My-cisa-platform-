import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Candidate"),
  examDate: text("exam_date"), // ISO date YYYY-MM-DD
  dailyMinutes: integer("daily_minutes").notNull().default(60),
  focusDomains: jsonb("focus_domains").$type<string[]>().default([]),
  experience: text("experience").notNull().default("working"), // novice | working | seasoned
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  lastStudiedOn: text("last_studied_on"), // ISO date
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name"),
  kind: text("kind").notNull().default("text"), // paste | file | pdf
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const keyPoints = pgTable("key_points", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id, { onDelete: "cascade" }),
  domain: text("domain"), // "1".."5" or null for general/core
  text: text("text").notNull(),
  source: text("source").notNull().default("core"), // core | material
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id, { onDelete: "cascade" }),
  domain: text("domain").notNull().default("1"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  source: text("source").notNull().default("core"), // core | material
  ef: real("ef").notNull().default(2.5), // SM-2 easiness factor
  intervalDays: integer("interval_days").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").references(() => materials.id, { onDelete: "cascade" }),
  domain: text("domain").notNull().default("1"), // "1".."5" or "M" (material)
  source: text("source").notNull().default("core"), // core | generated | uploaded
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull().default(""),
  difficulty: integer("difficulty").notNull().default(2), // 1 easy, 2 medium, 3 hard
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull().default("practice"), // practice | exam
  total: integer("total").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  durationSec: integer("duration_sec").notNull().default(0),
  breakdown: jsonb("breakdown").$type<Record<string, { total: number; correct: number }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // focus | quiz | flashcard | reading
  minutes: integer("minutes").notNull().default(0),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const planTasks = pgTable("plan_tasks", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  label: text("label").notNull(),
  kind: text("kind").notNull(), // reading | flashcard | quiz | focus | review | mock
  domain: text("domain"),
  target: integer("target"), // item count if any
  estMinutes: integer("est_minutes").notNull().default(30),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at", { withTimezone: true }),
  href: text("href"),
});
