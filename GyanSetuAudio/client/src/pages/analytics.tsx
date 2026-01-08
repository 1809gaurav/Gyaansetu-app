import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TricolorHeader from "@/components/tricolor-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useTTS } from "@/hooks/use-tts";
import type { ProgressStats } from "@shared/schema";

export default function Analytics() {
  const [userId] = useState("demo-user");
  const { speak } = useTTS();

  // Fetch overall statistics
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "stats"],
  });

  const stats: ProgressStats = statsData?.stats || { 
    totalQuestions: 0, 
    attempted: 0, 
    correct: 0, 
    accuracy: 0, 
    timeSpent: 0 
  };

  const handleSpeakStats = () => {
    const message = `Your performance statistics: You have attempted ${stats.attempted} questions out of ${stats.totalQuestions} total questions. Your accuracy rate is ${Math.round(stats.accuracy)} percent with ${stats.correct} correct answers. Total time spent studying is ${Math.floor(stats.timeSpent / 60)} minutes.`;
    speak(message);
  };

  if (isLoading) {
    return (
      <div className="gyansetu-container">
        <TricolorHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading analytics...</div>
          </div>
        </div>
        <BottomNavigation currentPage="analytics" />
      </div>
    );
  }

  return (
    <div className="gyansetu-container">
      <TricolorHeader />

      <main className="flex-1 px-6 py-6 space-y-6" role="main">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <button
            onClick={handleSpeakStats}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Read statistics aloud"
            data-testid="button-speak-stats"
          >
            <i className="fas fa-volume-up" aria-hidden="true"></i>
          </button>
        </div>

        {/* Overall Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-line mr-2 text-primary" aria-hidden="true"></i>
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary" data-testid="stat-attempted">
                  {stats.attempted}
                </div>
                <div className="text-sm text-muted-foreground">Questions Attempted</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-accent" data-testid="stat-correct">
                  {stats.correct}
                </div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy Rate</span>
                <span className="font-medium" data-testid="stat-accuracy">
                  {Math.round(stats.accuracy)}%
                </span>
              </div>
              <Progress value={stats.accuracy} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Study Time:</span>
                <div className="font-medium" data-testid="stat-study-time">
                  {Math.floor(stats.timeSpent / 60)} minutes
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Avg. per Question:</span>
                <div className="font-medium" data-testid="stat-avg-time">
                  {stats.attempted > 0 ? Math.round(stats.timeSpent / stats.attempted) : 0}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-pie mr-2 text-primary" aria-hidden="true"></i>
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Correct Answers</span>
                <div className="flex items-center space-x-2">
                  <Progress value={(stats.correct / Math.max(stats.attempted, 1)) * 100} className="w-20 h-2" />
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Incorrect Answers</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={((stats.attempted - stats.correct) / Math.max(stats.attempted, 1)) * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.attempted > 0 ? Math.round(((stats.attempted - stats.correct) / stats.attempted) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Progress</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(stats.attempted / Math.max(stats.totalQuestions, 1)) * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.totalQuestions > 0 ? Math.round((stats.attempted / stats.totalQuestions) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-lightbulb mr-2 text-primary" aria-hidden="true"></i>
              Study Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.accuracy < 50 && (
                <div className="p-3 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-destructive mr-2" aria-hidden="true"></i>
                    <span className="font-medium">Focus on fundamentals</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your accuracy is below 50%. Review basic concepts before attempting more questions.
                  </p>
                </div>
              )}
              
              {stats.accuracy >= 50 && stats.accuracy < 75 && (
                <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center">
                    <i className="fas fa-chart-line text-primary mr-2" aria-hidden="true"></i>
                    <span className="font-medium">Good progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're improving! Focus on practicing more questions to increase accuracy.
                  </p>
                </div>
              )}
              
              {stats.accuracy >= 75 && (
                <div className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
                  <div className="flex items-center">
                    <i className="fas fa-trophy text-accent mr-2" aria-hidden="true"></i>
                    <span className="font-medium">Excellent performance</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Great job! Consider attempting more challenging question sets.
                  </p>
                </div>
              )}
              
              {stats.attempted < 10 && (
                <div className="p-3 bg-muted rounded-lg border-l-4 border-muted-foreground">
                  <div className="flex items-center">
                    <i className="fas fa-play text-muted-foreground mr-2" aria-hidden="true"></i>
                    <span className="font-medium">Get started</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Attempt more questions to get better insights into your performance.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation currentPage="analytics" />
    </div>
  );
}
