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

    const handleKeyDown = (event: KeyboardEvent) => {
      // Browsers often block volume keys or remap them. 
      // We will listen for as many common volume-up mappings as possible.
      const isVolumeUp = event.key === 'ArrowUp' || 
                         event.key === 'VolumeUp' || 
                         event.key === 'AudioVolumeUp' ||
                         (event as any).keyCode === 175 ||
                         (event as any).key === 'Up';

      if (isVolumeUp) {
        const currentTime = Date.now();
        
        // Always allow double-tap as a fallback for both ArrowUp and VolumeUp
        if (currentTime - lastVolumeUpTime < 500) {
          if (!isListening) {
            startListening();
            const feedback = new SpeechSynthesisUtterance("Listening mode activated");
            feedback.text = feedback.text.replace(/GyanSetu/gi, "Gyan Setu");
            window.speechSynthesis.speak(feedback);
          }
        }
        lastVolumeUpTime = currentTime;

        // Also handle Long Press for VolumeUp keys specifically
        if (event.key !== 'ArrowUp' && !volumeUpTimer && !isListening) {
          volumeUpTimer = setTimeout(() => {
            startListening();
            const feedback = new SpeechSynthesisUtterance("Listening mode activated");
            feedback.text = feedback.text.replace(/GyanSetu/gi, "Gyan Setu");
            window.speechSynthesis.speak(feedback);
            volumeUpTimer = null;
          }, 600); // Shorter duration for better responsiveness
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (volumeUpTimer) {
        clearTimeout(volumeUpTimer);
        volumeUpTimer = null;
      }
    };

    // Use both capturing and bubbling phases to ensure we catch the event
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    // Some mobile browsers might only fire these on specific elements
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      document.removeEventListener('keydown', handleKeyDown, true);
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
