import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Home from "@/pages/home";
import Quiz from "@/pages/quiz";
import Analytics from "@/pages/analytics";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("gyansetu-theme") as "light" | "dark" | null;
    const storedContrast = localStorage.getItem("gyansetu-high-contrast") === "true";
    
    if (storedTheme) setTheme(storedTheme);
    setHighContrast(storedContrast);
  }, []);

  useEffect(() => {
    localStorage.setItem("gyansetu-theme", theme);
    localStorage.setItem("gyansetu-high-contrast", highContrast.toString());
    
    document.documentElement.setAttribute("data-theme", theme);
    if (highContrast) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
  }, [theme, highContrast]);

  return (
    <div data-theme={theme} data-contrast={highContrast ? "high" : undefined}>
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/quiz/:packId" component={Quiz} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
