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
    const handleKeyDown = (event: KeyboardEvent) => {
      // In web browsers, volume keys are often not captureable directly for security
      // but we can listen for specific keys that might be mapped or use a fallback
      // For the hackathon demo, we'll map a double press of a common key (like 'v' or 'ArrowUp')
      // to simulate the volume button if the actual volume keys are blocked by the browser.
      if (event.key === 'ArrowUp' || event.key === 'VolumeUp') {
        const currentTime = Date.now();
        if (currentTime - lastVolumeUpTime < 500) {
          if (!isListening) {
            startListening();
            // Optional: Provide audio feedback
            const feedback = new SpeechSynthesisUtterance("Listening mode activated");
            window.speechSynthesis.speak(feedback);
          }
        }
        lastVolumeUpTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
