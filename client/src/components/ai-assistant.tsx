import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiAssistant, speakAIResponse } from "@/lib/ai-assistant";
import type { SpeakFn } from "@/hooks/use-tts";

interface AIAssistantProps {
  currentLanguage: "english" | "hindi";
  onSpeak: SpeakFn;
}

export default function AIAssistant({ currentLanguage, onSpeak }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");

  const getText = (key: string) => {
    const translations = {
      title: currentLanguage === "english" ? "AI Study Assistant" : "AI अध्ययन सहायक",
      unavailable: currentLanguage === "english" ? "Unavailable" : "अनुपलब्ध",
      available: currentLanguage === "english" ? "Available" : "उपलब्ध",
      askQuestion: currentLanguage === "english" ? "Ask Study Question" : "अध्ययन प्रश्न पूछें",
      getHelp: currentLanguage === "english" ? "Get Study Help" : "अध्ययन सहायता प्राप्त करें",
      generateQuestions: currentLanguage === "english" ? "Practice Questions" : "अभ्यास प्रश्न",
      recommendations: currentLanguage === "english" ? "Study Tips" : "अध्ययन सुझाव",
      description: currentLanguage === "english" 
        ? "AI-powered study assistant to help with exam preparation"
        : "परीक्षा तैयारी में सहायता के लिए AI-संचालित अध्ययन सहायक"
    };
    return translations[key as keyof typeof translations] || key;
  };

  const handleStudyHelp = async () => {
    setIsLoading(true);
    try {
      const query = currentLanguage === "english" 
        ? "Help me understand the key topics for government exam preparation"
        : "सरकारी परीक्षा तैयारी के लिए मुख्य विषयों को समझने में मेरी मदद करें";
        
      const response = await aiAssistant.getStudyHelp(query, currentLanguage);
      setLastResponse(response.response || response.error || "No response");
      speakAIResponse(response, onSpeak, currentLanguage);
    } catch (error) {
      console.error("AI Study Help error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    try {
      const topic = currentLanguage === "english" ? "General Knowledge" : "सामान्य ज्ञान";
      const response = await aiAssistant.generatePracticeQuestions(topic, 3, "medium", currentLanguage);
      setLastResponse(response.response || response.error || "No response");
      speakAIResponse(response, onSpeak, currentLanguage);
    } catch (error) {
      console.error("AI Question Generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const performanceData = {
        accuracy: 75,
        weakAreas: ["Mathematics", "Reasoning"],
        timeSpent: 120
      };
      const response = await aiAssistant.getStudyRecommendations(performanceData, currentLanguage);
      setLastResponse(response.response || response.error || "No response");
      speakAIResponse(response, onSpeak, currentLanguage);
    } catch (error) {
      console.error("AI Recommendations error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="gyansetu-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            <i className="fas fa-robot mr-2 text-accent" aria-hidden="true"></i>
            {getText("title")}
          </CardTitle>
          <Badge variant={aiAssistant.isAvailable() ? "default" : "secondary"}>
            <i className={`fas ${aiAssistant.isAvailable() ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-1`} aria-hidden="true"></i>
            {aiAssistant.isAvailable() ? getText("available") : getText("unavailable")}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {getText("description")}
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          <Button
            className="gyansetu-button gyansetu-button-primary text-left"
            onClick={handleStudyHelp}
            disabled={isLoading}
            data-testid="button-study-help"
          >
            <i className="fas fa-question-circle mr-2" aria-hidden="true"></i>
            {getText("getHelp")}
          </Button>
          
          <Button
            className="gyansetu-button gyansetu-button-secondary text-left"
            onClick={handleGenerateQuestions}
            disabled={isLoading}
            data-testid="button-generate-questions"
          >
            <i className="fas fa-clipboard-list mr-2" aria-hidden="true"></i>
            {getText("generateQuestions")}
          </Button>
          
          <Button
            className="gyansetu-button gyansetu-button-secondary text-left"
            onClick={handleGetRecommendations}
            disabled={isLoading}
            data-testid="button-recommendations"
          >
            <i className="fas fa-lightbulb mr-2" aria-hidden="true"></i>
            {getText("recommendations")}
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
            <span className="text-sm text-muted-foreground">
              {currentLanguage === "english" ? "Thinking..." : "सोच रहा है..."}
            </span>
          </div>
        )}
        
        {lastResponse && !isLoading && (
          <div className="bg-muted/50 rounded-lg p-3 mt-4">
            <p className="text-sm">{lastResponse}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}