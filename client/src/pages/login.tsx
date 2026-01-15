
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/stock_images/education_app_logo_m_b3c4a4de.jpg";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState<"email" | "password" | null>(null);

  const handleVoiceInput = (target: "email" | "password") => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setListeningTarget(target);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === "email") {
        setEmail(transcript.replace(/\s/g, "").toLowerCase());
      } else {
        setPassword(transcript);
      }
      setIsListening(false);
      setListeningTarget(null);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setListeningTarget(null);
      toast({
        title: "Error",
        description: "Could not recognize voice. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningTarget(null);
    };

    recognition.start();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("gyansetu-auth", "true");
      setLocation("/");
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to GyanSetu.",
      });
    } else {
      toast({
        title: "Required",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="GyanSetu Logo" className="w-20 h-20 rounded-xl shadow-lg" />
          </div>
          <CardTitle className="text-2xl font-bold">GyanSetu Login</CardTitle>
          <p className="text-sm text-muted-foreground">Access your offline exam prep</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 pr-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`absolute right-1 top-1 ${isListening && listeningTarget === "email" ? "text-primary animate-pulse" : ""}`}
                  onClick={() => handleVoiceInput("email")}
                  data-testid="button-voice-email"
                >
                  {isListening && listeningTarget === "email" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`absolute right-1 top-1 ${isListening && listeningTarget === "password" ? "text-primary animate-pulse" : ""}`}
                  onClick={() => handleVoiceInput("password")}
                  data-testid="button-voice-password"
                >
                  {isListening && listeningTarget === "password" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" data-testid="button-login">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
