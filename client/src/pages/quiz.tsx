import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TricolorHeader from "@/components/tricolor-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useTTS } from "@/hooks/use-tts";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { voiceCommandProcessor } from "@/lib/voice-commands";
import type { Question, QuestionOption } from "@shared/schema";
import type { QuestionsResponse } from "@/types/api-responses";

export default function Quiz() {
  const [, params] = useRoute("/quiz/:packId");
  const packId = params?.packId;
  
  const [userId] = useState("demo-user");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"english" | "hindi">("english");
  
  const { speak } = useTTS();
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  const queryClient = useQueryClient();

  // Fetch questions for the exam pack
  const { data: questionsData, isLoading } = useQuery<QuestionsResponse>({
    queryKey: ["/api/exam-packs", packId, "questions"],
    enabled: !!packId,
  });

  const questions = questionsData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async (answerData: any) => {
      const response = await apiRequest("POST", `/api/users/${userId}/answers`, answerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "stats"] });
    },
  });

  // Voice command handling
  useEffect(() => {
    if (transcript && isListening) {
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('gyansetu-language') as "english" | "hindi" | null;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Read question aloud when it changes
  useEffect(() => {
    if (currentQuestion && !showExplanation) {
      setTimeout(() => {
        readCurrentQuestion();
      }, 500);
      setQuestionStartTime(new Date());
    }
  }, [currentQuestionIndex, currentQuestion]);

  const readCurrentQuestion = () => {
    if (!currentQuestion) return;
    
    // Read question in selected language
    const questionNumber = currentLanguage === "english" 
      ? `Question ${currentQuestionIndex + 1} of ${questions.length}`
      : `प्रश्न ${currentQuestionIndex + 1} कुल ${questions.length} में से`;
      
    const questionText = `${questionNumber}. ${currentQuestion.questionText}`;
    const optionsText = (currentQuestion.options as QuestionOption[])
      .map((option, index) => {
        const optionLabel = currentLanguage === "english" 
          ? `Option ${String.fromCharCode(65 + index)}`
          : `विकल्प ${String.fromCharCode(65 + index)}`;
        return `${optionLabel}: ${option.text}`;
      })
      .join(". ");
    
    const instruction = currentLanguage === "english"
      ? "Say A, B, C, or D to select your answer."
      : "अपना उत्तर चुनने के लिए A, B, C, या D कहें।";
    
    speak(`${questionText}. ${optionsText}. ${instruction}`, currentLanguage);
  };

  const handleVoiceCommand = (command: string) => {
    if (!currentQuestion) return;

    console.log("Quiz voice command received:", command);
    
    // Process command using VoiceCommandProcessor
    const result = voiceCommandProcessor.processCommand(command, { 
      inQuiz: true, 
      currentLanguage 
    });
    
    if (!result) {
      const errorMessage = currentLanguage === "english"
        ? "Sorry, I didn't understand that command. Say 'help' for available commands."
        : "क्षमा करें, मैं वह कमांड नहीं समझ पाया। उपलब्ध कमांडों के लिए 'हेल्प' कहें।";
      speak(errorMessage, currentLanguage);
      return;
    }
    
    console.log("Processed quiz voice command:", result);
    
    // Handle the recognized command
    switch (result.action) {
      case "repeat_last":
        readCurrentQuestion();
        break;
        
      case "next_question":
        handleNextQuestion();
        break;
        
      case "previous_question":
        handlePreviousQuestion();
        break;
        
      case "skip_question":
        handleSkipQuestion();
        break;
        
      case "mark_question":
        handleMarkForReview();
        break;
        
      case "show_explanation":
        handleShowExplanation();
        break;
        
      case "submit_answer":
        handleSubmitAnswer();
        break;
        
      case "select_option":
        const option = result.parameters?.option;
        if (option && ["a", "b", "c", "d"].includes(option)) {
          const optionIndex = option.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
          const options = currentQuestion.options as QuestionOption[];
          if (optionIndex < options.length) {
            handleOptionSelect(options[optionIndex].id);
          }
        }
        break;
        
      case "show_help":
        const helpText = voiceCommandProcessor.getHelpText(currentLanguage);
        speak(helpText, currentLanguage);
        break;
        
      case "set_language":
        const language = result.parameters?.language;
        if (language && (language === "english" || language === "hindi")) {
          setCurrentLanguage(language);
          localStorage.setItem('gyansetu-language', language);
          const message = language === "english" ? "Language changed to English" : "भाषा हिंदी में बदली गई";
          speak(message, language);
        }
        break;
        
      default:
        const notImplementedMessage = currentLanguage === "english"
          ? "Command recognized but not available in quiz mode"
          : "कमांड पहचाना गया लेकिन क्विज़ मोड में उपलब्ध नहीं है";
        speak(notImplementedMessage, currentLanguage);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    
    const options = currentQuestion.options as QuestionOption[];
    const selectedOption = options.find(opt => opt.id === optionId);
    const optionLetter = String.fromCharCode(65 + options.findIndex(opt => opt.id === optionId));
    
    if (selectedOption) {
      const message = currentLanguage === "english"
        ? `Selected option ${optionLetter}: ${selectedOption.text}`
        : `चयनित विकल्प ${optionLetter}: ${selectedOption.text}`;
      speak(message, currentLanguage);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;

    const options = currentQuestion.options as QuestionOption[];
    const correctOption = options.find(opt => opt.isCorrect);
    const isCorrect = selectedOption === correctOption?.id;
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);

    // Save answer
    await saveAnswerMutation.mutateAsync({
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
      timeSpent,
      isMarkedForReview: markedQuestions.includes(currentQuestion.id),
    });

    const feedback = isCorrect ? "Correct!" : "Incorrect.";
    speak(feedback);
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption("");
      setShowExplanation(false);
    } else {
      // Quiz completed
      speak("Quiz completed! Returning to home.");
      toast({ title: "Quiz Completed", description: "Great job! Your answers have been saved." });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[questions[currentQuestionIndex - 1]?.id] || "");
      setShowExplanation(false);
    }
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    
    setMarkedQuestions(prev => {
      const isMarked = prev.includes(currentQuestion.id);
      if (isMarked) {
        speak("Question unmarked for review");
        return prev.filter(id => id !== currentQuestion.id);
      } else {
        speak("Question marked for review");
        return [...prev, currentQuestion.id];
      }
    });
  };

  const handleShowExplanation = () => {
    if (!currentQuestion) return;
    
    setShowExplanation(true);
    speak(`Explanation: ${currentQuestion.explanation}`);
  };

  const handleSkipQuestion = () => {
    speak("Skipping question");
    handleNextQuestion();
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      speak("Voice commands stopped");
    } else {
      startListening();
      speak("Voice commands activated");
    }
  };

  if (isLoading) {
    return (
      <div className="gyansetu-container">
        <TricolorHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading quiz questions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="gyansetu-container">
        <TricolorHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">No questions available</h2>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const options = currentQuestion.options as QuestionOption[];

  return (
    <div className="gyansetu-container">
      <TricolorHeader />

      {/* Quiz Progress */}
      <div className="px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Voice Controls */}
      <div className="px-6 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={isListening ? "default" : "secondary"}
              onClick={handleVoiceToggle}
              data-testid="button-voice-toggle"
            >
              <i className={`fas fa-microphone mr-2 ${isListening ? "animate-pulse" : ""}`} aria-hidden="true"></i>
              {isListening ? "Listening..." : "Voice"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={readCurrentQuestion}
              data-testid="button-repeat-question"
            >
              <i className="fas fa-redo mr-2" aria-hidden="true"></i>
              Repeat
            </Button>
          </div>
          <Button
            size="sm"
            variant={markedQuestions.includes(currentQuestion.id) ? "default" : "secondary"}
            onClick={handleMarkForReview}
            data-testid="button-mark-review"
          >
            <i className="fas fa-bookmark mr-2" aria-hidden="true"></i>
            {markedQuestions.includes(currentQuestion.id) ? "Marked" : "Mark"}
          </Button>
        </div>
      </div>

      {/* Question Content */}
      <main className="flex-1 px-6 py-6" role="main">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4" data-testid="question-text">
              {currentQuestion.questionText}
            </h2>
            
            {!showExplanation ? (
              <div className="space-y-3">
                {options.map((option, index) => (
                  <Button
                    key={option.id}
                    variant={selectedOption === option.id ? "default" : "secondary"}
                    className="w-full text-left justify-start p-4 h-auto"
                    onClick={() => handleOptionSelect(option.id)}
                    data-testid={`button-option-${String.fromCharCode(65 + index).toLowerCase()}`}
                  >
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option.text}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Explanation:</h3>
                  <p>{currentQuestion.explanation}</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="font-medium">
                    Correct Answer: {options.find(opt => opt.isCorrect)?.text}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!showExplanation ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={handleSkipQuestion}
                data-testid="button-skip"
              >
                <i className="fas fa-forward mr-2" aria-hidden="true"></i>
                Skip
              </Button>
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                data-testid="button-submit-answer"
              >
                <i className="fas fa-check mr-2" aria-hidden="true"></i>
                Submit
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleNextQuestion}
              data-testid="button-next-question"
            >
              <i className="fas fa-arrow-right mr-2" aria-hidden="true"></i>
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={handleShowExplanation}
              data-testid="button-show-explanation"
            >
              <i className="fas fa-lightbulb mr-2" aria-hidden="true"></i>
              Explain
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation currentPage="quiz" />
    </div>
  );
}
