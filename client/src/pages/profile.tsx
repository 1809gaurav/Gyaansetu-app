import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TricolorHeader from "@/components/tricolor-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useTTS } from "@/hooks/use-tts";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { apiUrl } from "@/lib/api";

export default function Profile() {
  const [userId] = useState("demo-user");
  const [preferences, setPreferences] = useState({
    preferredLanguage: "english",
    voiceEnabled: true,
    highContrastMode: false,
  });
  
  const { speak } = useTTS();
  const queryClient = useQueryClient();

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/preferences`, newPreferences);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Settings Updated", 
        description: "Your preferences have been saved successfully" 
      });
      speak("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update settings",
        variant: "destructive"
      });
    },
  });

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    updatePreferencesMutation.mutate(newPreferences);
  };

  const handleLanguageChange = (language: "english" | "hindi") => {
    handlePreferenceChange("preferredLanguage", language);
    const message = language === "english" 
      ? "Language preference changed to English" 
      : "भाषा वरीयता हिंदी में बदली गई";
    speak(message, language);
  };

  const handleVoiceToggle = (enabled: boolean) => {
    handlePreferenceChange("voiceEnabled", enabled);
    speak(enabled ? "Voice features enabled" : "Voice features disabled");
  };

  const handleContrastToggle = (enabled: boolean) => {
    handlePreferenceChange("highContrastMode", enabled);
    speak(enabled ? "High contrast mode enabled" : "High contrast mode disabled");
    
    // Apply contrast mode immediately
    if (enabled) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
  };

  const handleExportProgress = async () => {
    try {
      const response = await fetch(apiUrl(`/api/users/${userId}/stats`));
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gyansetu-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      speak("Progress data exported successfully as a JSON file.");
      toast({ 
        title: "Export Successful", 
        description: "Your progress data has been downloaded." 
      });
    } catch (error) {
      console.error("Export error:", error);
      speak("Failed to export progress data.");
      toast({ 
        title: "Export Failed", 
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleClearData = async () => {
    if (confirm(preferences.preferredLanguage === "english" 
      ? "Are you sure you want to clear all your progress data? This action cannot be undone."
      : "क्या आप वाकई अपना सारा प्रगति डेटा मिटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता है।")) {
      
      try {
        // In a real app, this would be a DELETE request to an API
        // For this prototype, we'll clear local storage related to progress
        localStorage.removeItem("gyansetu-offline-content");
        
        speak("All progress data has been cleared successfully.");
        toast({ 
          title: "Data Cleared", 
          description: "Your progress has been reset." 
        });
        
        // Refresh the page to show empty stats
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error("Clear data error:", error);
        speak("Failed to clear progress data.");
      }
    }
  };

  return (
    <div className="gyansetu-container">
      <TricolorHeader />

      <main className="flex-1 px-6 py-6 space-y-6" role="main">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <button
            onClick={() => speak("Profile settings page. Adjust your preferences for language, voice features, and accessibility options.")}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Read page description aloud"
            data-testid="button-speak-description"
          >
            <i className="fas fa-volume-up" aria-hidden="true"></i>
          </button>
        </div>

        {/* Language Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-language mr-2 text-primary" aria-hidden="true"></i>
              Language Preferences / भाषा वरीयताएं
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={preferences.preferredLanguage === "english" ? "default" : "secondary"}
                className="h-auto p-4"
                onClick={() => handleLanguageChange("english")}
                data-testid="button-language-english"
              >
                <div className="text-center">
                  <i className="fas fa-globe text-xl mb-2" aria-hidden="true"></i>
                  <div className="font-medium">English</div>
                  <div className="text-xs opacity-75">Primary Language</div>
                </div>
              </Button>
              
              <Button
                variant={preferences.preferredLanguage === "hindi" ? "default" : "secondary"}
                className="h-auto p-4"
                onClick={() => handleLanguageChange("hindi")}
                data-testid="button-language-hindi"
              >
                <div className="text-center">
                  <i className="fas fa-language text-xl mb-2" aria-hidden="true"></i>
                  <div className="font-medium">हिंदी</div>
                  <div className="text-xs opacity-75">मुख्य भाषा</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-universal-access mr-2 text-primary" aria-hidden="true"></i>
              Accessibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="voice-enabled" className="text-base font-medium">
                  Voice Features
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable text-to-speech and voice commands
                </p>
              </div>
              <Switch
                id="voice-enabled"
                checked={preferences.voiceEnabled}
                onCheckedChange={handleVoiceToggle}
                data-testid="switch-voice-enabled"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast" className="text-base font-medium">
                  High Contrast Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={preferences.highContrastMode}
                onCheckedChange={handleContrastToggle}
                data-testid="switch-high-contrast"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-volume-up mr-2 text-primary" aria-hidden="true"></i>
              Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="h-auto p-4"
                onClick={() => speak("This is a test of the text-to-speech feature at normal speed")}
                data-testid="button-test-speech"
              >
                <div className="text-center">
                  <i className="fas fa-play text-xl mb-2" aria-hidden="true"></i>
                  <div className="font-medium">Test Speech</div>
                  <div className="text-xs opacity-75">Normal Speed</div>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                className="h-auto p-4"
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance("This is a test of the text-to-speech feature at slow speed");
                  utterance.rate = 0.5;
                  speechSynthesis.speak(utterance);
                }}
                data-testid="button-test-slow-speech"
              >
                <div className="text-center">
                  <i className="fas fa-play text-xl mb-2" aria-hidden="true"></i>
                  <div className="font-medium">Test Slow</div>
                  <div className="text-xs opacity-75">Slow Speed</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-database mr-2 text-primary" aria-hidden="true"></i>
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="h-auto p-4"
                onClick={handleExportProgress}
                data-testid="button-export-progress"
              >
                <div className="text-center">
                  <i className="fas fa-download text-xl mb-2" aria-hidden="true"></i>
                  <div className="font-medium">Export Progress</div>
                  <div className="text-xs opacity-75">Download your data</div>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                className="h-auto p-4"
                onClick={handleClearData}
                data-testid="button-clear-data"
              >
                <div className="text-center">
                  <i className="fas fa-trash text-xl mb-2" aria-hidden="true"></i>
                  <div className="font-medium">Clear Data</div>
                  <div className="text-xs opacity-75">Reset progress</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-info-circle mr-2 text-primary" aria-hidden="true"></i>
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">September 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Developer</span>
              <span className="font-medium">GYANSETU Team</span>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation currentPage="profile" />
    </div>
  );
}
