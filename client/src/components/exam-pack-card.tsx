import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ExamPack } from "@shared/schema";
import type { SpeakFn } from "@/hooks/use-tts";
import type { OfflineContentResponse, UserProgressResponse } from "@/types/api-responses";

interface ExamPackCardProps {
  examPack: ExamPack;
  userId: string;
  currentLanguage: "english" | "hindi";
  onSpeak: SpeakFn;
}

export default function ExamPackCard({ examPack, userId, currentLanguage, onSpeak }: ExamPackCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const queryClient = useQueryClient();

  // Check if pack is already downloaded
  const { data: offlineData } = useQuery<OfflineContentResponse>({
    queryKey: ["/api/users", userId, "offline"],
  });

  // Get user progress for this pack
  const { data: progressData } = useQuery<UserProgressResponse>({
    queryKey: ["/api/users", userId, "progress", examPack.id],
  });

  const offlineContent = offlineData?.offlineContent || [];
  const isDownloaded = offlineContent.some((content) => content.examPackId === examPack.id);
  const progress = progressData?.progress;
  const progressPercentage = progress && progress.questionsAttempted
    ? Math.round((progress.questionsAttempted / examPack.totalQuestions) * 100)
    : 0;

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${userId}/offline/${examPack.id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Download Complete", 
        description: `${examPack.title} is now available offline` 
      });
      onSpeak(`${examPack.title} downloaded successfully and is now available offline`, currentLanguage);
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "offline"] });
      setIsDownloading(false);
    },
    onError: () => {
      toast({ 
        title: "Download Failed", 
        description: "Failed to download exam pack",
        variant: "destructive"
      });
      setIsDownloading(false);
    },
  });

  const handleDownload = () => {
    setIsDownloading(true);
    downloadMutation.mutate();
    onSpeak(`Downloading ${examPack.title}`, currentLanguage);
  };

  const handleCardClick = () => {
    const description = `${examPack.title}. ${examPack.description}. ${examPack.totalQuestions} questions. ${
      isDownloaded ? 'Downloaded and ready to use' : `${examPack.size} MB download required`
    }. ${progress ? `Progress: ${progressPercentage} percent` : 'Not started yet'}.`;
    
    onSpeak(description, currentLanguage);
  };

  const handleStartQuiz = () => {
    if (!isDownloaded) {
      toast({ 
        title: "Download Required", 
        description: "Please download this pack first to start the quiz" 
      });
      onSpeak("Please download this pack first to start the quiz", currentLanguage);
      return;
    }
    
    onSpeak(`Starting quiz for ${examPack.title}`, currentLanguage);
    // Navigate to quiz page
    window.location.href = `/quiz/${examPack.id}`;
  };

  return (
    <div 
      className="border border-border rounded-md p-4 hover:bg-muted/50 transition-colors"
      role="button" 
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${examPack.title}, ${examPack.totalQuestions} questions, ${isDownloaded ? 'downloaded' : 'available for download'}`}
      data-testid={`exam-pack-${examPack.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{examPack.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{examPack.description}</p>
          
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Badge variant={isDownloaded ? "default" : "secondary"} className="text-xs">
              <i className={`fas ${isDownloaded ? 'fa-check' : 'fa-cloud-download-alt'} mr-1`} aria-hidden="true"></i>
              {isDownloaded ? 
                (currentLanguage === "english" ? "Downloaded" : "डाउनलोड किया गया") :
                (currentLanguage === "english" ? "Available" : "उपलब्ध")
              }
            </Badge>
            
            {progress && (
              <Badge variant="outline" className="text-xs">
                {currentLanguage === "english" ? "Progress" : "प्रगति"}: {progressPercentage}%
              </Badge>
            )}
            
            {!isDownloaded && (
              <span className="text-xs text-muted-foreground">
                {currentLanguage === "english" ? "Size" : "आकार"}: {examPack.size} MB
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDownloaded ? (
              <Button
                size="sm"
                className="gyansetu-button-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartQuiz();
                }}
                data-testid={`button-start-quiz-${examPack.id}`}
              >
                <i className="fas fa-play mr-2" aria-hidden="true"></i>
                {currentLanguage === "english" ? "Start Quiz" : "क्विज़ शुरू करें"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="gyansetu-button-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                disabled={isDownloading}
                data-testid={`button-download-${examPack.id}`}
              >
                <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`} aria-hidden="true"></i>
                {isDownloading ? 
                  (currentLanguage === "english" ? "Downloading..." : "डाउनलोड हो रहा है...") :
                  (currentLanguage === "english" ? "Download" : "डाउनलोड करें")
                }
              </Button>
            )}
          </div>
        </div>
        
        <i className="fas fa-chevron-right text-muted-foreground ml-4" aria-hidden="true"></i>
      </div>
    </div>
  );
}
