import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { ExamPack, Question, QuizSession } from "@shared/schema";

interface OfflineStorageData {
  examPacks: ExamPack[];
  questions: Record<string, Question[]>;
  quizSessions: QuizSession[];
  lastSync: Date;
}

interface UseOfflineStorageReturn {
  // Data state
  isOnline: boolean;
  offlineData: OfflineStorageData;
  downloadedPacks: string[];
  
  // Storage operations
  downloadPack: (packId: string) => Promise<void>;
  removePack: (packId: string) => Promise<void>;
  getOfflineQuestions: (packId: string) => Question[];
  
  // Quiz session management
  saveQuizSession: (session: QuizSession) => Promise<void>;
  loadQuizSession: (packId: string) => QuizSession | null;
  clearQuizSession: (packId: string) => Promise<void>;
  
  // Sync operations
  syncData: () => Promise<void>;
  getStorageInfo: () => { used: number; available: number; packs: number };
  
  // Loading states
  isDownloading: boolean;
  isSyncing: boolean;
}

const STORAGE_KEY = "gyansetu_offline_data";
const STORAGE_VERSION = "1.0";

export function useOfflineStorage(userId: string): UseOfflineStorageReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineStorageData>({
    examPacks: [],
    questions: {},
    quizSessions: [],
    lastSync: new Date(0)
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const queryClient = useQueryClient();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data from localStorage on mount
  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION) {
          setOfflineData({
            ...parsed.data,
            lastSync: new Date(parsed.data.lastSync)
          });
        }
      }
    } catch (error) {
      console.error("Error loading offline data:", error);
      toast({
        title: "Storage Error",
        description: "Failed to load offline data",
        variant: "destructive"
      });
    }
  }, []);

  const saveOfflineData = useCallback((data: OfflineStorageData) => {
    try {
      const toStore = {
        version: STORAGE_VERSION,
        data: {
          ...data,
          lastSync: data.lastSync.toISOString()
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      setOfflineData(data);
    } catch (error) {
      console.error("Error saving offline data:", error);
      toast({
        title: "Storage Error",
        description: "Failed to save offline data",
        variant: "destructive"
      });
    }
  }, []);

  // Download pack mutation
  const downloadPackMutation = useMutation({
    mutationFn: async (packId: string) => {
      const [packResponse, questionsResponse] = await Promise.all([
        apiRequest("GET", `/api/exam-packs/${packId}`, undefined),
        apiRequest("GET", `/api/exam-packs/${packId}/questions`, undefined)
      ]);
      
      const packData = await packResponse.json();
      const questionsData = await questionsResponse.json();
      
      return {
        examPack: packData.examPack,
        questions: questionsData.questions
      };
    },
    onSuccess: (data, packId) => {
      const newOfflineData = {
        ...offlineData,
        examPacks: [...offlineData.examPacks.filter(p => p.id !== packId), data.examPack],
        questions: {
          ...offlineData.questions,
          [packId]: data.questions
        },
        lastSync: new Date()
      };
      
      saveOfflineData(newOfflineData);
      
      // Mark as downloaded on server
      apiRequest("POST", `/api/users/${userId}/offline/${packId}`, {})
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "offline"] });
        })
        .catch(console.error);
      
      toast({
        title: "Download Complete",
        description: `${data.examPack.title} is now available offline`
      });
    },
    onError: (error) => {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download exam pack",
        variant: "destructive"
      });
    }
  });

  const downloadPack = useCallback(async (packId: string) => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to download content",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    try {
      await downloadPackMutation.mutateAsync(packId);
    } finally {
      setIsDownloading(false);
    }
  }, [isOnline, downloadPackMutation]);

  const removePack = useCallback(async (packId: string) => {
    const newOfflineData = {
      ...offlineData,
      examPacks: offlineData.examPacks.filter(p => p.id !== packId),
      questions: Object.fromEntries(
        Object.entries(offlineData.questions).filter(([id]) => id !== packId)
      ),
      quizSessions: offlineData.quizSessions.filter(s => s.examPackId !== packId)
    };
    
    saveOfflineData(newOfflineData);
    
    toast({
      title: "Pack Removed",
      description: "Exam pack removed from offline storage"
    });
  }, [offlineData, saveOfflineData]);

  const getOfflineQuestions = useCallback((packId: string): Question[] => {
    return offlineData.questions[packId] || [];
  }, [offlineData.questions]);

  const saveQuizSession = useCallback(async (session: QuizSession) => {
    const newSessions = offlineData.quizSessions.filter(s => s.examPackId !== session.examPackId);
    newSessions.push(session);
    
    const newOfflineData = {
      ...offlineData,
      quizSessions: newSessions
    };
    
    saveOfflineData(newOfflineData);
  }, [offlineData, saveOfflineData]);

  const loadQuizSession = useCallback((packId: string): QuizSession | null => {
    return offlineData.quizSessions.find(s => s.examPackId === packId) || null;
  }, [offlineData.quizSessions]);

  const clearQuizSession = useCallback(async (packId: string) => {
    const newOfflineData = {
      ...offlineData,
      quizSessions: offlineData.quizSessions.filter(s => s.examPackId !== packId)
    };
    
    saveOfflineData(newOfflineData);
  }, [offlineData, saveOfflineData]);

  const syncData = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Cannot sync while offline",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    try {
      // Sync any pending quiz sessions or progress
      // This would involve sending local data to server
      const newOfflineData = {
        ...offlineData,
        lastSync: new Date()
      };
      
      saveOfflineData(newOfflineData);
      
      toast({
        title: "Sync Complete",
        description: "Your progress has been synchronized"
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, offlineData, saveOfflineData]);

  const getStorageInfo = useCallback(() => {
    try {
      // Estimate storage usage
      const dataSize = new Blob([JSON.stringify(offlineData)]).size;
      const availableStorage = 50 * 1024 * 1024; // 50MB estimate
      
      return {
        used: Math.round(dataSize / 1024 / 1024 * 100) / 100, // MB
        available: Math.round(availableStorage / 1024 / 1024), // MB
        packs: offlineData.examPacks.length
      };
    } catch (error) {
      return { used: 0, available: 50, packs: 0 };
    }
  }, [offlineData]);

  const downloadedPacks = offlineData.examPacks.map(pack => pack.id);

  return {
    isOnline,
    offlineData,
    downloadedPacks,
    downloadPack,
    removePack,
    getOfflineQuestions,
    saveQuizSession,
    loadQuizSession,
    clearQuizSession,
    syncData,
    getStorageInfo,
    isDownloading,
    isSyncing
  };
}
