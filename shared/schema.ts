import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("english"),
  voiceEnabled: boolean("voice_enabled").default(true),
  highContrastMode: boolean("high_contrast_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const examPacks = pgTable("exam_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // SSC, UPSC, Banking, etc.
  totalQuestions: integer("total_questions").notNull(),
  size: integer("size").notNull(), // in MB
  language: text("language").notNull().default("english"),
  isDownloadable: boolean("is_downloadable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examPackId: varchar("exam_pack_id").references(() => examPacks.id),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of {id, text, isCorrect}
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  category: text("category").notNull(),
  language: text("language").notNull().default("english"),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  examPackId: varchar("exam_pack_id").references(() => examPacks.id),
  questionsAttempted: integer("questions_attempted").default(0),
  correctAnswers: integer("correct_answers").default(0),
  markedQuestions: jsonb("marked_questions").default([]), // Array of question IDs
  completedQuestions: jsonb("completed_questions").default([]), // Array of question IDs
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  questionId: varchar("question_id").references(() => questions.id),
  selectedOption: text("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent"), // in seconds
  isMarkedForReview: boolean("is_marked_for_review").default(false),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const offlineContent = pgTable("offline_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  examPackId: varchar("exam_pack_id").references(() => examPacks.id),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  isComplete: boolean("is_complete").default(false),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferredLanguage: true,
});

export const insertExamPackSchema = createInsertSchema(examPacks).pick({
  title: true,
  description: true,
  category: true,
  totalQuestions: true,
  size: true,
  language: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  examPackId: true,
  questionText: true,
  options: true,
  explanation: true,
  difficulty: true,
  category: true,
  language: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  examPackId: true,
  questionsAttempted: true,
  correctAnswers: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).pick({
  userId: true,
  questionId: true,
  selectedOption: true,
  isCorrect: true,
  timeSpent: true,
  isMarkedForReview: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertExamPack = z.infer<typeof insertExamPackSchema>;
export type ExamPack = typeof examPacks.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;

export type OfflineContent = typeof offlineContent.$inferSelect;

// Additional types for frontend
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizSession {
  examPackId: string;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Record<string, string>;
  markedQuestions: string[];
  startTime: Date;
}

export interface ProgressStats {
  totalQuestions: number;
  attempted: number;
  correct: number;
  accuracy: number;
  timeSpent: number;
}
