import { useState, useCallback, useRef, useEffect } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim().toLowerCase();
        setTranscript(transcript);
        console.log("Speech recognition result:", transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition not supported");
      return;
    }

    try {
      setTranscript("");
      setError(null);
      recognitionRef.current.start();

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setError("Failed to start speech recognition");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let lastVolumeUpTime = 0;
    let volumeUpTimer: NodeJS.Timeout | null = null;
    let isLongPress = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isVolumeUp = event.key === 'ArrowUp' || 
                         event.key === 'VolumeUp' || 
                         event.key === 'AudioVolumeUp' ||
                         (event as any).keyCode === 175;

      if (isVolumeUp) {
        const currentTime = Date.now();
        
        // Handle ArrowUp separately as requested (keep double-tap for ArrowUp)
        if (event.key === 'ArrowUp') {
          if (currentTime - lastVolumeUpTime < 500) {
            if (!isListening) {
              startListening();
              const feedback = new SpeechSynthesisUtterance("Listening mode activated");
              feedback.text = feedback.text.replace(/GyanSetu/gi, "Gyan Setu");
              window.speechSynthesis.speak(feedback);
            }
          }
          lastVolumeUpTime = currentTime;
        } else {
          // Handle VolumeUp with Long Press (Deep Press)
          if (!volumeUpTimer && !isListening) {
            isLongPress = false;
            volumeUpTimer = setTimeout(() => {
              isLongPress = true;
              startListening();
              const feedback = new SpeechSynthesisUtterance("Listening mode activated");
              feedback.text = feedback.text.replace(/GyanSetu/gi, "Gyan Setu");
              window.speechSynthesis.speak(feedback);
              volumeUpTimer = null;
            }, 800); // 800ms for "deep press"
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const isVolumeUp = event.key === 'VolumeUp' || 
                         event.key === 'AudioVolumeUp' ||
                         (event as any).keyCode === 175;
      
      if (isVolumeUp && volumeUpTimer) {
        clearTimeout(volumeUpTimer);
        volumeUpTimer = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      if (volumeUpTimer) clearTimeout(volumeUpTimer);
    };
  }, [isListening, startListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported
  };
}
