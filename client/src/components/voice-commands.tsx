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
    <section className="gyansetu-card" aria-labelledby="voice-commands-heading">
      <h2 id="voice-commands-heading" className="text-lg font-semibold mb-3">
        {currentLanguage === "english" ? "Voice Commands" : "वॉयस कमांड"}
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          className={`gyansetu-button ${
            isListening ? 'gyansetu-button-accent speaking-indicator' : 'gyansetu-button-accent'
          }`}
          onClick={onVoiceToggle}
          aria-label={isListening ? "Stop voice command listening" : "Start voice command listening"}
          data-testid="button-voice-toggle"
        >
          <i className={`fas fa-microphone mr-2 ${isListening ? 'animate-pulse' : ''}`} aria-hidden="true"></i>
          {getButtonText("listen")}
        </Button>
        
        <Button
          className="gyansetu-button gyansetu-button-secondary"
          onClick={onRepeat}
          aria-label="Repeat last announcement"
          data-testid="button-repeat"
        >
          <i className="fas fa-redo mr-2" aria-hidden="true"></i>
          {getButtonText("repeat")}
        </Button>
        
        <Button
          className="gyansetu-button gyansetu-button-secondary"
          onClick={onHelp}
          aria-label="Get help with voice commands"
          data-testid="button-help"
        >
          <i className="fas fa-question-circle mr-2" aria-hidden="true"></i>
          {getButtonText("help")}
        </Button>
        
        <Button
          className="gyansetu-button gyansetu-button-secondary"
          onClick={() => {/* Audio settings */}}
          aria-label="Audio settings"
          data-testid="button-audio-settings"
        >
          <i className="fas fa-volume-up mr-2" aria-hidden="true"></i>
          {getButtonText("audio")}
        </Button>
      </div>
    </section>
  );
}
