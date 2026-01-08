import { 
  type User, 
  type InsertUser, 
  type ExamPack, 
  type InsertExamPack,
  type Question,
  type InsertQuestion,
  type UserProgress,
  type InsertUserProgress,
  type UserAnswer,
  type InsertUserAnswer,
  type OfflineContent,
  type QuestionOption,
  type ProgressStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: string, preferences: Partial<User>): Promise<User | undefined>;

  // Exam pack management
  getExamPacks(): Promise<ExamPack[]>;
  getExamPack(id: string): Promise<ExamPack | undefined>;
  createExamPack(examPack: InsertExamPack): Promise<ExamPack>;

  // Question management
  getQuestionsByExamPack(examPackId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Progress tracking
  getUserProgress(userId: string, examPackId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, examPackId: string, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  // User answers
  saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getUserAnswers(userId: string, questionId?: string): Promise<UserAnswer[]>;
  
  // Statistics
  getProgressStats(userId: string, examPackId?: string): Promise<ProgressStats>;
  
  // Offline content
  markContentAsDownloaded(userId: string, examPackId: string): Promise<OfflineContent>;
  getOfflineContent(userId: string): Promise<OfflineContent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private examPacks: Map<string, ExamPack> = new Map();
  private questions: Map<string, Question> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private userAnswers: Map<string, UserAnswer> = new Map();
  private offlineContent: Map<string, OfflineContent> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample exam packs
    const mathPack: ExamPack = {
      id: "ssc-cgl-math",
      title: "SSC CGL - Mathematics",
      description: "500 questions with detailed explanations",
      category: "SSC",
      totalQuestions: 500,
      size: 25,
      language: "english",
      isDownloadable: true,
      createdAt: new Date(),
    };

    const gsPack: ExamPack = {
      id: "upsc-gs",
      title: "UPSC Prelims - General Studies",
      description: "800 questions covering all topics",
      category: "UPSC",
      totalQuestions: 800,
      size: 45,
      language: "english",
      isDownloadable: true,
      createdAt: new Date(),
    };

    this.examPacks.set(mathPack.id, mathPack);
    this.examPacks.set(gsPack.id, gsPack);

    // Create sample questions for math pack
    const sampleQuestions: Question[] = [
      {
        id: "q1",
        examPackId: "ssc-cgl-math",
        questionText: "What is the value of 15% of 240?",
        options: [
          { id: "a", text: "36", isCorrect: true },
          { id: "b", text: "32", isCorrect: false },
          { id: "c", text: "38", isCorrect: false },
          { id: "d", text: "34", isCorrect: false }
        ] as QuestionOption[],
        explanation: "15% of 240 = (15/100) × 240 = 36",
        difficulty: "easy",
        category: "Percentage",
        language: "english"
      },
      {
        id: "q2",
        examPackId: "ssc-cgl-math",
        questionText: "If the cost price of 20 articles is equal to the selling price of 16 articles, find the gain percent.",
        options: [
          { id: "a", text: "20%", isCorrect: false },
          { id: "b", text: "25%", isCorrect: true },
          { id: "c", text: "30%", isCorrect: false },
          { id: "d", text: "35%", isCorrect: false }
        ] as QuestionOption[],
        explanation: "Let CP of each article = Re 1. CP of 20 articles = Rs 20. SP of 16 articles = Rs 20. SP of each article = 20/16 = 1.25. Gain = 1.25 - 1 = 0.25. Gain% = (0.25/1) × 100 = 25%",
        difficulty: "medium",
        category: "Profit and Loss",
        language: "english"
      }
    ];

    sampleQuestions.forEach(q => this.questions.set(q.id, q));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      preferredLanguage: insertUser.preferredLanguage || "english",
      voiceEnabled: true,
      highContrastMode: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: string, preferences: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getExamPacks(): Promise<ExamPack[]> {
    return Array.from(this.examPacks.values());
  }

  async getExamPack(id: string): Promise<ExamPack | undefined> {
    return this.examPacks.get(id);
  }

  async createExamPack(examPack: InsertExamPack): Promise<ExamPack> {
    const id = randomUUID();
    const pack: ExamPack = { 
      ...examPack, 
      id,
      isDownloadable: true,
      createdAt: new Date()
    };
    this.examPacks.set(id, pack);
    return pack;
  }

  async getQuestionsByExamPack(examPackId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.examPackId === examPackId);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const q: Question = { 
      ...question, 
      id,
      examPackId: question.examPackId || null,
      language: question.language || "english"
    };
    this.questions.set(id, q);
    return q;
  }

  async getUserProgress(userId: string, examPackId: string): Promise<UserProgress | undefined> {
    const key = `${userId}-${examPackId}`;
    return Array.from(this.userProgress.values()).find(p => 
      p.userId === userId && p.examPackId === examPackId
    );
  }

  async updateUserProgress(userId: string, examPackId: string, progress: Partial<UserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, examPackId);
    
    if (existing) {
      const updated = { ...existing, ...progress, lastAccessed: new Date() };
      this.userProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: UserProgress = {
        id,
        userId,
        examPackId,
        questionsAttempted: 0,
        correctAnswers: 0,
        markedQuestions: [],
        completedQuestions: [],
        lastAccessed: new Date(),
        ...progress
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const id = randomUUID();
    const userAnswer: UserAnswer = { 
      ...answer, 
      id,
      userId: answer.userId || null,
      questionId: answer.questionId || null,
      timeSpent: answer.timeSpent || null,
      isMarkedForReview: answer.isMarkedForReview || false,
      answeredAt: new Date() 
    };
    this.userAnswers.set(id, userAnswer);
    return userAnswer;
  }

  async getUserAnswers(userId: string, questionId?: string): Promise<UserAnswer[]> {
    return Array.from(this.userAnswers.values()).filter(a => 
      a.userId === userId && (!questionId || a.questionId === questionId)
    );
  }

  async getProgressStats(userId: string, examPackId?: string): Promise<ProgressStats> {
    const answers = await this.getUserAnswers(userId);
    const filteredAnswers = examPackId 
      ? answers.filter(a => {
          const question = a.questionId ? this.questions.get(a.questionId) : null;
          return question?.examPackId === examPackId;
        })
      : answers;

    const totalQuestions = examPackId 
      ? (await this.getQuestionsByExamPack(examPackId)).length
      : this.questions.size;
    
    const attempted = filteredAnswers.length;
    const correct = filteredAnswers.filter(a => a.isCorrect).length;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const timeSpent = filteredAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    return {
      totalQuestions,
      attempted,
      correct,
      accuracy,
      timeSpent
    };
  }

  async markContentAsDownloaded(userId: string, examPackId: string): Promise<OfflineContent> {
    const id = randomUUID();
    const content: OfflineContent = {
      id,
      userId,
      examPackId,
      downloadedAt: new Date(),
      isComplete: true
    };
    this.offlineContent.set(id, content);
    return content;
  }

  async getOfflineContent(userId: string): Promise<OfflineContent[]> {
    return Array.from(this.offlineContent.values()).filter(c => c.userId === userId);
  }
}

export const storage = new MemStorage();
