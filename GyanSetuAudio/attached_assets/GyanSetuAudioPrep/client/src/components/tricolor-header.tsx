import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TricolorHeader() {
  const [highContrast, setHighContrast] = useState(false);

  const toggleContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    
    if (newContrast) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
  };

  return (
    <header className="bg-card border-b border-border" role="banner">
      {/* Tricolor ribbon */}
      <div className="tricolor-ribbon" aria-label="Indian tricolor ribbon" role="img"></div>
      
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* GYANSETU emblem */}
          <div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron to-indianGreen flex items-center justify-center" 
            aria-label="GYANSETU emblem"
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-foreground">GYANSETU</h1>
            <p className="text-sm text-muted-foreground">Official Accessible Exam Prep</p>
          </div>
        </div>
        
        {/* Accessibility controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            className="touch-target"
            onClick={toggleContrast}
            aria-label="Toggle high contrast mode"
            data-testid="button-toggle-contrast"
          >
            <i className="fas fa-adjust text-lg" aria-hidden="true"></i>
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="touch-target"
            aria-label="Settings"
            data-testid="button-settings"
          >
            <i className="fas fa-cog text-lg" aria-hidden="true"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
