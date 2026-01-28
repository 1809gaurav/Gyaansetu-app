import { useState } from "react";
import { Button } from "@/components/ui/button";
import logoPng from "@/assets/logo.png";

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
    <header className="glass-card border-b border-white/10 sticky top-0 z-50" role="banner">
      {/* Tricolor ribbon */}
      <div className="tricolor-ribbon opacity-80" aria-label="Indian tricolor ribbon" role="img"></div>
      
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* GYANSETU emblem */}
          <div 
            className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full motivational-glow border-2 border-primary/30" 
            aria-label="GYANSETU emblem"
          >
            <img 
              src={logoPng} 
              alt="GYANSETU Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">GYANSETU</h1>
            <p className="text-xs text-primary font-medium uppercase tracking-wider">Empowering Every Dream</p>
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
