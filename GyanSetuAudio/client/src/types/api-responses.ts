import type { ExamPack, Question, ProgressStats, OfflineContent, UserProgress } from "@shared/schema";

// API Response interfaces
export interface ExamPacksResponse {
  examPacks: ExamPack[];
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface ProgressStatsResponse {
  stats: ProgressStats;
}

export interface OfflineContentResponse {
  offlineContent: OfflineContent[];
}

export interface UserProgressResponse {
  progress: UserProgress;
}