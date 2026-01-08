import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { ProgressStats } from "@shared/schema";

interface ProgressOverviewProps {
  stats: ProgressStats;
  currentLanguage: "english" | "hindi";
  onSpeak: (text: string, language?: string) => void;
}

export default function ProgressOverview({ stats, currentLanguage, onSpeak }: ProgressOverviewProps) {
  
  const handleSpeakProgress = () => {
    const message = currentLanguage === "english" 
      ? `Your progress: ${stats.attempted} questions attempted out of ${stats.totalQuestions} total. ${stats.correct} correct answers with ${Math.round(stats.accuracy)} percent accuracy.`
      : `आपकी प्रगति: कुल ${stats.totalQuestions} में से ${stats.attempted} प्रश्न किए गए। ${stats.correct} सही उत्तर के साथ ${Math.round(stats.accuracy)} प्रतिशत सटीकता।`;
    
    onSpeak(message, currentLanguage);
  };

  const getText = (key: string) => {
    const translations = {
      title: currentLanguage === "english" ? "Your Progress" : "आपकी प्रगति",
      attempted: currentLanguage === "english" ? "Total Questions Attempted" : "कुल प्रश्न किए गए",
      correct: currentLanguage === "english" ? "Correct Answers" : "सही उत्तर",
      accuracy: currentLanguage === "english" ? "Accuracy Rate" : "सटीकता दर"
    };
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <section className="gyansetu-card" aria-labelledby="progress-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="progress-heading" className="text-lg font-semibold">
          {getText("title")}
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSpeakProgress}
          aria-label="Read progress statistics aloud"
          data-testid="button-speak-progress"
        >
          <i className="fas fa-volume-up" aria-hidden="true"></i>
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getText("attempted")}</span>
          <span className="text-lg font-bold text-primary" data-testid="progress-attempted">
            {stats.attempted.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getText("correct")}</span>
          <span className="text-lg font-bold text-accent" data-testid="progress-correct">
            {stats.correct.toLocaleString()}
          </span>
        </div>
        
        <div>
          <div className="w-full bg-muted rounded-full h-3" 
               role="progressbar" 
               aria-valuenow={Math.round(stats.accuracy)} 
               aria-valuemin="0" 
               aria-valuemax="100" 
               aria-label={`${getText("accuracy")} ${Math.round(stats.accuracy)}%`}>
            <div 
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
              data-testid="progress-accuracy-bar"
            ></div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2" data-testid="progress-accuracy-text">
            {Math.round(stats.accuracy)}% {getText("accuracy")}
          </p>
        </div>
      </div>
    </section>
  );
}
