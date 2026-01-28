import { Button } from "@/components/ui/button";

interface VoiceCommandsProps {
  isListening: boolean;
  isSpeaking: boolean;
  onVoiceToggle: () => void;
  onRepeat: () => void;
  onHelp: () => void;
  currentLanguage: "english" | "hindi";
}

export default function VoiceCommands({
  isListening,
  isSpeaking,
  onVoiceToggle,
  onRepeat,
  onHelp,
  currentLanguage
}: VoiceCommandsProps) {
  
  const getButtonText = (command: string) => {
    const translations = {
      listen: currentLanguage === "english" ? "Listen" : "सुनें",
      repeat: currentLanguage === "english" ? "Repeat" : "दोहराएं",
      help: currentLanguage === "english" ? "Help" : "मदद",
      audio: currentLanguage === "english" ? "Audio" : "ऑडियो"
    };
    return translations[command as keyof typeof translations] || command;
  };

  return (
    <section className="glass-card p-6 border-white/5 shadow-2xl relative overflow-hidden" aria-labelledby="voice-commands-heading">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <i className="fas fa-microchip text-4xl" aria-hidden="true"></i>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 id="voice-commands-heading" className="text-lg font-bold text-white/90">
          Neural Interface
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-white/5 text-white/70"
            onClick={onHelp}
            aria-label="Help"
          >
            <i className="fas fa-question text-sm" aria-hidden="true"></i>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-white/5 text-white/70"
            onClick={onRepeat}
            aria-label="Repeat last message"
          >
            <i className="fas fa-redo text-sm" aria-hidden="true"></i>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-6">
        <Button
          size="lg"
          className={`w-28 h-28 rounded-full shadow-2xl transition-all duration-500 transform ${
            isListening 
              ? "bg-primary text-white scale-110 motivational-glow animate-voice-pulse" 
              : "bg-white/5 text-white/40 hover:bg-white/10"
          }`}
          onClick={onVoiceToggle}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          data-testid="button-voice-main"
        >
          <i className={`fas fa-microphone text-4xl ${isSpeaking ? 'animate-bounce' : ''}`} aria-hidden="true"></i>
        </Button>
        
        <p className={`mt-6 text-center text-sm font-bold tracking-widest uppercase transition-all duration-300 ${isListening ? "text-primary opacity-100" : "text-white/20 opacity-50"}`}>
          {isListening ? (currentLanguage === "english" ? "Processing..." : "प्रोसेसिंग...") : (currentLanguage === "english" ? "Tap to Connect" : "कनेक्ट करने के लिए टैप करें")}
        </p>
      </div>
    </section>
  );
}
