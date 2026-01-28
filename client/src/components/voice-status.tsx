interface VoiceStatusProps {
  isListening: boolean;
  isSupported: boolean;
  currentLanguage: "english" | "hindi";
}

export default function VoiceStatus({ isListening, isSupported, currentLanguage }: VoiceStatusProps) {
  const getStatusMessage = () => {
    if (!isSupported) {
      return currentLanguage === "english" 
        ? "Voice recognition not available in this browser"
        : "इस ब्राउज़र में वॉयस रिकग्निशन उपलब्ध नहीं है";
    }
    
    if (isListening) {
      return currentLanguage === "english"
        ? "Listening for voice commands..."
        : "वॉयस कमांड सुन रहा है...";
    }
    
    return currentLanguage === "english"
      ? "Voice commands active - Say 'Help' for available commands"
      : "वॉयस कमांड सक्रिय - उपलब्ध कमांड के लिए 'मदद' कहें";
  };

  const getStatusColor = () => {
    if (!isSupported) return "text-destructive";
    if (isListening) return "text-primary";
    return "text-accent";
  };

  const getIndicatorColor = () => {
    if (!isSupported) return "bg-destructive";
    if (isListening) return "bg-primary";
    return "bg-accent";
  };

  return (
    <div 
      className="px-6 py-3 bg-accent/10 border-b border-border" 
      id="voice-status" 
      aria-live="polite" 
      aria-atomic="true"
      data-testid="voice-status"
    >
      <div className="flex items-center space-x-3">
        <div 
          className={`w-3 h-3 rounded-full ${getIndicatorColor()} ${isListening ? 'voice-pulse' : ''}`} 
          aria-hidden="true"
        ></div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
      </div>
    </div>
  );
}
