// AI Assistant service for GyanSetu exam preparation app
// This integrates with OpenAI to provide intelligent study assistance

import { toast } from "@/hooks/use-toast";

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

interface StudyQuestion {
  question: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  context?: string;
}

interface ExplanationRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  options: string[];
}

export class AIAssistant {
  private isEnabled: boolean = false;

  constructor() {
    // Check if OpenAI API key is available
    this.checkAPIAvailability();
  }

  private async checkAPIAvailability() {
    try {
      const response = await fetch('/api/ai/status');
      const data = await response.json();
      this.isEnabled = data.available || false;
    } catch (error) {
      console.warn('AI Assistant API not available:', error);
      this.isEnabled = false;
    }
  }

  public isAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * Get study assistance for a specific topic or question
   */
  public async getStudyHelp(query: string, language: "english" | "hindi" = "english"): Promise<AIResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: language === "english" 
          ? "AI Assistant is not available. Please contact administrator for API key setup."
          : "AI सहायक उपलब्ध नहीं है। API की सेटअप के लिए व्यवस्थापक से संपर्क करें।"
      };
    }

    try {
      const response = await fetch('/api/ai/study-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          language,
          context: 'exam_preparation'
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response
      };
    } catch (error) {
      console.error('AI Assistant error:', error);
      return {
        success: false,
        error: language === "english" 
          ? "Sorry, I'm having trouble connecting right now. Please try again later."
          : "क्षमा करें, मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।"
      };
    }
  }

  /**
   * Explain why a particular answer is correct/incorrect
   */
  public async explainAnswer(request: ExplanationRequest, language: "english" | "hindi" = "english"): Promise<AIResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: language === "english" 
          ? "AI explanations are not available without API key setup."
          : "API की सेटअप के बिना AI व्याख्या उपलब्ध नहीं है।"
      };
    }

    try {
      const response = await fetch('/api/ai/explain-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...request, 
          language
        }),
      });

      if (!response.ok) {
        throw new Error('AI explanation service unavailable');
      }

      const data = await response.json();
      return {
        success: true,
        response: data.explanation
      };
    } catch (error) {
      console.error('AI Explanation error:', error);
      return {
        success: false,
        error: language === "english" 
          ? "Unable to generate explanation at this time."
          : "इस समय व्याख्या तैयार करने में असमर्थ।"
      };
    }
  }

  /**
   * Generate practice questions for a topic
   */
  public async generatePracticeQuestions(topic: string, count: number = 5, difficulty: "easy" | "medium" | "hard" = "medium", language: "english" | "hindi" = "english"): Promise<AIResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: language === "english" 
          ? "Practice question generation requires AI assistant setup."
          : "अभ्यास प्रश्न उत्पादन के लिए AI सहायक सेटअप आवश्यक है।"
      };
    }

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic, 
          count, 
          difficulty, 
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Question generation service unavailable');
      }

      const data = await response.json();
      return {
        success: true,
        response: data.questions
      };
    } catch (error) {
      console.error('AI Question Generation error:', error);
      return {
        success: false,
        error: language === "english" 
          ? "Unable to generate practice questions at this time."
          : "इस समय अभ्यास प्रश्न उत्पन्न करने में असमर्थ।"
      };
    }
  }

  /**
   * Get study recommendations based on user performance
   */
  public async getStudyRecommendations(performanceData: any, language: "english" | "hindi" = "english"): Promise<AIResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: language === "english" 
          ? "Study recommendations require AI assistant functionality."
          : "अध्ययन सुझावों के लिए AI सहायक कार्यक्षमता आवश्यक है।"
      };
    }

    try {
      const response = await fetch('/api/ai/study-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          performanceData, 
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Recommendation service unavailable');
      }

      const data = await response.json();
      return {
        success: true,
        response: data.recommendations
      };
    } catch (error) {
      console.error('AI Recommendations error:', error);
      return {
        success: false,
        error: language === "english" 
          ? "Unable to generate study recommendations at this time."
          : "इस समय अध्ययन सुझाव उत्पन्न करने में असमर्थ।"
      };
    }
  }
}

// Export singleton instance
export const aiAssistant = new AIAssistant();

// Helper function to show AI responses via speech
export function speakAIResponse(response: AIResponse, speakFn: (text: string, language?: "english" | "hindi") => void, language: "english" | "hindi" = "english") {
  if (response.success && response.response) {
    speakFn(response.response, language);
  } else if (response.error) {
    speakFn(response.error, language);
    toast({
      title: language === "english" ? "AI Assistant" : "AI सहायक",
      description: response.error,
      variant: "destructive"
    });
  }
}