import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TricolorHeader from "@/components/tricolor-header";
import VoiceStatus from "@/components/voice-status";
import VoiceCommands from "@/components/voice-commands";
import ExamPackCard from "@/components/exam-pack-card";
import ProgressOverview from "@/components/progress-overview";
import BottomNavigation from "@/components/bottom-navigation";
import { useTTS } from "@/hooks/use-tts";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { ExamPack, ProgressStats } from "@shared/schema";

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState<"english" | "hindi">("english");
  const [userId] = useState("demo-user"); // In real app, get from auth context
  
  const { speak, isSpeaking } = useTTS();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    isSupported: speechSupported 
  } = useSpeechRecognition();

  // Fetch exam packs
  const { data: examPacksData, isLoading: examPacksLoading } = useQuery({
    queryKey: ["/api/exam-packs"],
  });

  // Fetch user progress stats
  const { data: statsData } = useQuery({
    queryKey: ["/api/users", userId, "stats"],
  });

  const examPacks = examPacksData?.examPacks || [];
  const stats = statsData?.stats || { totalQuestions: 0, attempted: 0, correct: 0, accuracy: 0, timeSpent: 0 };

  // Voice command handling
  useEffect(() => {
    if (transcript) {
      handleVoiceCommand(transcript.toLowerCase());
    }
  }, [transcript]);

  // Welcome announcement on load
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Welcome to GYANSETU - Official Accessible Exam Prep. Voice commands are active.", currentLanguage);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleVoiceCommand = (command: string) => {
    console.log("Voice command received:", command);
    
    if (command.includes("start quiz") || command.includes("quiz")) {
      toast({ title: "Starting quiz session", description: "Navigating to quiz mode" });
      speak("Starting quiz session", currentLanguage);
    } else if (command.includes("repeat")) {
      speak("Welcome to GYANSETU - Official Accessible Exam Prep. Voice commands are active.", currentLanguage);
    } else if (command.includes("help")) {
      speak("Available commands: Start quiz, Repeat, Help, Download pack, Next, Previous", currentLanguage);
    } else if (command.includes("download")) {
      speak("Which exam pack would you like to download?", currentLanguage);
    } else if (command.includes("english")) {
      setCurrentLanguage("english");
      speak("Language changed to English", "english");
    } else if (command.includes("hindi") || command.includes("हिंदी")) {
      setCurrentLanguage("hindi");
      speak("Language changed to Hindi", "hindi");
    }
  };

  const handleLanguageChange = (language: "english" | "hindi") => {
    setCurrentLanguage(language);
    const message = language === "english" ? "Language changed to English" : "भाषा हिंदी में बदली गई";
    speak(message, language);
    toast({ 
      title: "Language Changed", 
      description: `Interface language changed to ${language === "english" ? "English" : "Hindi"}` 
    });
  };

  const handleStartQuiz = () => {
    speak("Select an exam pack to start your quiz session", currentLanguage);
    toast({ 
      title: "Quiz Mode", 
      description: "Please select an exam pack to begin" 
    });
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      speak("Voice commands stopped", currentLanguage);
    } else {
      if (speechSupported) {
        startListening();
        speak("Voice commands activated. I'm listening.", currentLanguage);
      } else {
        toast({ 
          title: "Voice Recognition Unavailable", 
          description: "Your browser doesn't support voice recognition" 
        });
      }
    }
  };

  return (
    <div className="gyansetu-container">
      {/* Header with tricolor ribbon */}
      <TricolorHeader />

      {/* Voice status indicator */}
      <VoiceStatus 
        isListening={isListening}
        isSupported={speechSupported}
        currentLanguage={currentLanguage}
      />

      {/* Main content */}
      <main className="flex-1 px-6 py-6 space-y-6" role="main">
        
        {/* Language Selection */}
        <section className="gyansetu-card" aria-labelledby="language-heading">
          <h2 id="language-heading" className="text-lg font-semibold mb-3">
            Select Language / भाषा चुनें
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className={`gyansetu-button ${
                currentLanguage === "english" ? "gyansetu-button-primary" : "gyansetu-button-secondary"
              }`}
              onClick={() => handleLanguageChange("english")}
              aria-pressed={currentLanguage === "english"}
              data-testid="button-select-english"
            >
              <i className="fas fa-globe mr-2" aria-hidden="true"></i>
              English
            </Button>
            <Button
              className={`gyansetu-button ${
                currentLanguage === "hindi" ? "gyansetu-button-primary" : "gyansetu-button-secondary"
              }`}
              onClick={() => handleLanguageChange("hindi")}
              aria-pressed={currentLanguage === "hindi"}
              data-testid="button-select-hindi"
            >
              <i className="fas fa-language mr-2" aria-hidden="true"></i>
              हिंदी
            </Button>
          </div>
        </section>

        {/* Voice Commands Panel */}
        <VoiceCommands
          isListening={isListening}
          isSpeaking={isSpeaking}
          onVoiceToggle={handleVoiceToggle}
          onRepeat={() => speak("Welcome to GYANSETU - Official Accessible Exam Prep. Voice commands are active.", currentLanguage)}
          onHelp={() => speak("Available commands: Start quiz, Repeat, Help, Download pack, Next, Previous", currentLanguage)}
          currentLanguage={currentLanguage}
        />

        {/* Exam Packs Selection */}
        <section className="gyansetu-card" aria-labelledby="exam-packs-heading">
          <h2 id="exam-packs-heading" className="text-lg font-semibold mb-3">
            Available Exam Packs
          </h2>
          <div className="space-y-3">
            {examPacksLoading ? (
              <div className="text-center py-4" data-testid="loading-exam-packs">
                <div className="animate-pulse">Loading exam packs...</div>
              </div>
            ) : examPacks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground" data-testid="no-exam-packs">
                No exam packs available
              </div>
            ) : (
              examPacks.map((pack: ExamPack) => (
                <ExamPackCard
                  key={pack.id}
                  examPack={pack}
                  userId={userId}
                  currentLanguage={currentLanguage}
                  onSpeak={speak}
                />
              ))
            )}
          </div>
        </section>

        {/* Progress Overview */}
        <ProgressOverview 
          stats={stats}
          currentLanguage={currentLanguage}
          onSpeak={speak}
        />

        {/* Quick Actions */}
        <section className="space-y-3">
          <Button
            className="w-full gyansetu-button gyansetu-button-primary text-lg"
            onClick={handleStartQuiz}
            data-testid="button-start-quiz"
          >
            <i className="fas fa-play-circle mr-3 text-xl" aria-hidden="true"></i>
            Start Quiz Session
          </Button>
          
          <Button
            className="w-full gyansetu-button gyansetu-button-accent text-lg"
            onClick={() => speak("Review mode not yet implemented", currentLanguage)}
            data-testid="button-review-marked"
          >
            <i className="fas fa-bookmark mr-3 text-xl" aria-hidden="true"></i>
            Review Marked Questions
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="gyansetu-button gyansetu-button-secondary"
              onClick={() => speak("Progress report feature coming soon", currentLanguage)}
              data-testid="button-progress-report"
            >
              <i className="fas fa-chart-line mr-2" aria-hidden="true"></i>
              Progress Report
            </Button>
            <Button
              className="gyansetu-button gyansetu-button-secondary"
              onClick={() => speak("Offline content management feature coming soon", currentLanguage)}
              data-testid="button-offline-content"
            >
              <i className="fas fa-download mr-2" aria-hidden="true"></i>
              Offline Content
            </Button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="home" />

      {/* Screen reader announcements */}
      <div 
        id="audio-announcements" 
        className="sr-only" 
        aria-live="assertive" 
        aria-atomic="true"
        data-testid="audio-announcements"
      >
        <span id="current-announcement"></span>
      </div>
    </div>
  );
}
