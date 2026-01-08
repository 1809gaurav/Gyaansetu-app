import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserAnswerSchema } from "@shared/schema";
import { z } from "zod";
import aiRoutes from "./ai-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, preferredLanguage: user.preferredLanguage } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  // User preferences
  app.patch("/api/users/:id/preferences", async (req, res) => {
    try {
      const { id } = req.params;
      const preferences = req.body;
      
      const updatedUser = await storage.updateUserPreferences(id, preferences);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(400).json({ message: "Failed to update preferences", error });
    }
  });

  // Exam packs
  app.get("/api/exam-packs", async (req, res) => {
    try {
      const examPacks = await storage.getExamPacks();
      res.json({ examPacks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exam packs", error });
    }
  });

  app.get("/api/exam-packs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const examPack = await storage.getExamPack(id);
      
      if (!examPack) {
        return res.status(404).json({ message: "Exam pack not found" });
      }
      
      res.json({ examPack });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exam pack", error });
    }
  });

  // Questions
  app.get("/api/exam-packs/:id/questions", async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getQuestionsByExamPack(id);
      res.json({ questions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions", error });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json({ question });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question", error });
    }
  });

  // User progress
  app.get("/api/users/:userId/progress/:examPackId", async (req, res) => {
    try {
      const { userId, examPackId } = req.params;
      const progress = await storage.getUserProgress(userId, examPackId);
      res.json({ progress });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress", error });
    }
  });

  app.post("/api/users/:userId/progress/:examPackId", async (req, res) => {
    try {
      const { userId, examPackId } = req.params;
      const progressData = req.body;
      
      const progress = await storage.updateUserProgress(userId, examPackId, progressData);
      res.json({ progress });
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress", error });
    }
  });

  // User answers
  app.post("/api/users/:userId/answers", async (req, res) => {
    try {
      const { userId } = req.params;
      const answerData = insertUserAnswerSchema.parse({ ...req.body, userId });
      
      const answer = await storage.saveUserAnswer(answerData);
      
      // Update progress
      const question = answerData.questionId ? await storage.getQuestion(answerData.questionId) : null;
      if (question) {
        const currentProgress = question?.examPackId ? await storage.getUserProgress(userId, question.examPackId) : null;
        const questionsAttempted = (currentProgress?.questionsAttempted || 0) + 1;
        const correctAnswers = (currentProgress?.correctAnswers || 0) + (answerData.isCorrect ? 1 : 0);
        
        if (question?.examPackId) {
          await storage.updateUserProgress(userId, question.examPackId, {
            questionsAttempted,
            correctAnswers
          });
        }
      }
      
      res.json({ answer });
    } catch (error) {
      res.status(400).json({ message: "Failed to save answer", error });
    }
  });

  // Progress statistics
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const { examPackId } = req.query;
      
      const stats = await storage.getProgressStats(userId, examPackId as string);
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics", error });
    }
  });

  // Offline content
  app.post("/api/users/:userId/offline/:examPackId", async (req, res) => {
    try {
      const { userId, examPackId } = req.params;
      
      const content = await storage.markContentAsDownloaded(userId, examPackId);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark content as downloaded", error });
    }
  });

  app.get("/api/users/:userId/offline", async (req, res) => {
    try {
      const { userId } = req.params;
      const offlineContent = await storage.getOfflineContent(userId);
      res.json({ offlineContent });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offline content", error });
    }
  });

  // AI Assistant routes
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
