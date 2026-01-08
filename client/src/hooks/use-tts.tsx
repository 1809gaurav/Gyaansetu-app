import { useState, useCallback, useRef } from "react";

// Define the speak function type for consistent usage across components
export type SpeakFn = (text: string, language?: "english" | "hindi") => void;

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, language: "english" | "hindi" = "english") => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech synthesis not supported in this browser");
      return;
    }

    // Stop any current speech
    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language and voice properties
    utterance.lang = language === "hindi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    
    // Update audio announcements div for screen readers
    const announcementElement = document.getElementById("current-announcement");
    if (announcementElement) {
      announcementElement.textContent = text;
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  const isSupported = 'speechSynthesis' in window;

  return {
    speak: speak as SpeakFn,
    stop,
    isSpeaking,
    isSupported
  };
}
