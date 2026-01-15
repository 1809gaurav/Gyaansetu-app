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
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import logoImage from "@assets/stock_images/education_app_logo_m_b3c4a4de.jpg";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highContrast, setHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[100]">
        <img src={logoImage} alt="GyanSetu Logo" className="w-32 h-32 rounded-2xl shadow-2xl animate-bounce mb-4" />
        <h1 className="text-2xl font-bold text-primary animate-pulse">GyanSetu</h1>
        <p className="text-muted-foreground mt-2">Empowering Offline Learning</p>
      </div>
    );
  }

  return (
    <div data-theme={theme} data-contrast={highContrast ? "high" : undefined}>
      {children}
    </div>
  );
}

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const [, setLocation] = useLocation();
  const isAuthenticated = localStorage.getItem("gyansetu-auth") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  return isAuthenticated ? <Component {...rest} /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {(params) => <ProtectedRoute component={Home} path="/" {...params} />}
      </Route>
      <Route path="/quiz">
        {(params) => <ProtectedRoute component={Quiz} path="/quiz" {...params} />}
      </Route>
      <Route path="/quiz/:packId">
        {(params) => <ProtectedRoute component={Quiz} path="/quiz/:packId" {...params} />}
      </Route>
      <Route path="/analytics">
        {(params) => <ProtectedRoute component={Analytics} path="/analytics" {...params} />}
      </Route>
      <Route path="/profile">
        {(params) => <ProtectedRoute component={Profile} path="/profile" {...params} />}
      </Route>
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
