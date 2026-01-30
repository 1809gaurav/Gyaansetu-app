import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TricolorHeader from "@/components/tricolor-header";
import VoiceStatus from "@/components/voice-status";
import VoiceCommands from "@/components/voice-commands";
import ExamPackCard from "@/components/exam-pack-card";
import ProgressOverview from "@/components/progress-overview";
import AIAssistant from "@/components/ai-assistant";
import BottomNavigation from "@/components/bottom-navigation";
import { useTTS } from "@/hooks/use-tts";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { voiceCommandProcessor } from "@/lib/voice-commands";
import type { ExamPack, ProgressStats } from "@shared/schema";
import type { ExamPacksResponse, ProgressStatsResponse } from "@/types/api-responses";
import type { SpeakFn } from "@/hooks/use-tts";

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
  const { data: examPacksData, isLoading: examPacksLoading } = useQuery<ExamPacksResponse>({
    queryKey: ["/api/exam-packs"],
  });

  // Fetch user progress stats
  const { data: statsData } = useQuery<ProgressStatsResponse>({
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

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('gyansetu-language') as "english" | "hindi" | null;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Welcome announcement on load
  useEffect(() => {
    const timer = setTimeout(() => {
      let welcomeMessage = currentLanguage === "english"
        ? "Welcome to GyanSetu - Official Accessible Exam Prep. Voice commands are active."
        : "ज्ञानसेतु में आपका स्वागत है - आधिकारिक सुलभ परीक्षा तैयारी। वॉयस कमांड सक्रिय हैं।";
      
      // Fix pronunciation of GyanSetu
      welcomeMessage = welcomeMessage.replace(/GyanSetu/gi, "Gyan Setu");
      
      console.log("Speaking welcome message:", welcomeMessage);
      speak(welcomeMessage, currentLanguage);
    }, 2500); // Increased delay to ensure page is ready and TTS engine initialized
    return () => clearTimeout(timer);
  }, [currentLanguage, speak]);

  const handleVoiceCommand = (command: string) => {
    console.log("Voice command received:", command);
    
    // Process command using VoiceCommandProcessor
    const result = voiceCommandProcessor.processCommand(command, { 
      inQuiz: false, 
      currentLanguage 
    });
    
    if (!result) {
      speak("Sorry, I didn't understand that command. Say 'help' for available commands.", currentLanguage);
      return;
    }
    
    console.log("Processed voice command:", result);
    
    // Handle the recognized command
    switch (result.action) {
      case "start_quiz":
        handleStartQuizVoiceCommand();
        break;
        
      case "repeat_last":
        speak("Welcome to GYANSETU - Official Accessible Exam Prep. Voice commands are active.", currentLanguage);
        break;
        
      case "show_help":
        const helpText = voiceCommandProcessor.getHelpText(currentLanguage);
        speak(helpText, currentLanguage);
        break;
        
      case "download_pack":
        speak("Which exam pack would you like to download? Say the name of the exam pack.", currentLanguage);
        break;
        
      case "set_language":
        const language = result.parameters?.language;
        if (language && (language === "english" || language === "hindi")) {
          handleLanguageChange(language);
        }
        break;
        
      case "navigate_analytics":
        speak("Navigating to analytics page", currentLanguage);
        window.location.href = "/analytics";
        break;
        
      case "navigate_profile":
        speak("Navigating to profile page", currentLanguage);
        window.location.href = "/profile";
        break;
        
      case "activate_ai":
        const aiMessage = currentLanguage === "english" 
          ? "Hi, I am Gyan Sarthi. I am listening. How can I help with your studies today?"
          : "नमस्ते, मैं ज्ञान सारथी हूँ। मैं सुन रहा हूँ। आज मैं आपकी पढ़ाई में कैसे मदद कर सकता हूँ?";
        speak(aiMessage, currentLanguage);
        // Scroll to AI assistant component if needed or focus it
        const aiElement = document.querySelector('[data-testid="ai-assistant-card"]');
        if (aiElement) {
          aiElement.scrollIntoView({ behavior: 'smooth' });
        }
        break;
        
      default:
        speak("Command recognized but not implemented yet", currentLanguage);
    }
  };

  const handleLanguageChange = (language: "english" | "hindi") => {
    setCurrentLanguage(language);
    localStorage.setItem('gyansetu-language', language);
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

  const handleStartQuizVoiceCommand = () => {
    // Try to start quiz with the first available downloaded pack
    const downloadedPacks = examPacks.filter(pack => {
      // This would normally check if pack is downloaded, simplified for now
      return true; // All packs are considered available for voice command
    });
    
    if (downloadedPacks.length > 0) {
      const firstPack = downloadedPacks[0];
      toast({ 
        title: "Starting Quiz", 
        description: `Starting ${firstPack.title}` 
      });
      speak(`Starting quiz for ${firstPack.title}`, currentLanguage);
      
      // Navigate to quiz
      setTimeout(() => {
        window.location.href = `/quiz/${firstPack.id}`;
      }, 1000);
    } else {
      speak("No exam packs are available. Please download an exam pack first.", currentLanguage);
      toast({ 
        title: "No Quiz Available", 
        description: "Please download an exam pack first" 
      });
    }
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

  const handleProgressReport = () => {
    const message = currentLanguage === "english" 
      ? `Generating your detailed progress report. You have attempted ${stats.attempted} questions with ${Math.round(stats.accuracy)}% accuracy.`
      : `आपकी विस्तृत प्रगति रिपोर्ट तैयार की जा रही है। आपने ${Math.round(stats.accuracy)}% सटीकता के साथ ${stats.attempted} प्रश्नों का प्रयास किया है।`;
    
    speak(message, currentLanguage);
    toast({
      title: currentLanguage === "english" ? "Progress Report" : "प्रगति रिपोर्ट",
      description: message
    });
  };

  const handleOfflineContent = () => {
    const message = currentLanguage === "english"
      ? "Checking offline content. Your downloaded exam packs are ready for practice without internet."
      : "ऑफ़लाइन सामग्री की जाँच की जा रही है। आपके डाउनलोड किए गए परीक्षा पैक इंटरनेट के बिना अभ्यास के लिए तैयार हैं।";
    
    speak(message, currentLanguage);
    toast({
      title: currentLanguage === "english" ? "Offline Content" : "ऑफ़लाइन सामग्री",
      description: message
    });
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

        {/* AI Assistant */}
        <AIAssistant 
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
              onClick={handleProgressReport}
              data-testid="button-progress-report"
            >
              <i className="fas fa-chart-line mr-2" aria-hidden="true"></i>
              Progress Report
            </Button>
            <Button
              className="gyansetu-button gyansetu-button-secondary"
              onClick={handleOfflineContent}
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
