import { useLocation } from "wouter";

interface BottomNavigationProps {
  currentPage: "home" | "quiz" | "analytics" | "profile";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navigationItems = [
    {
      key: "home",
      path: "/",
      icon: "fas fa-home",
      label: "Home",
      ariaLabel: "Home page"
    },
    {
      key: "quiz",
      path: "/quiz",
      icon: "fas fa-question-circle",
      label: "Quiz",
      ariaLabel: "Quiz sections"
    },
    {
      key: "analytics",
      path: "/analytics",
      icon: "fas fa-chart-bar",
      label: "Analytics",
      ariaLabel: "Performance analytics"
    },
    {
      key: "profile",
      path: "/profile",
      icon: "fas fa-user",
      label: "Profile",
      ariaLabel: "User profile"
    }
  ];

  const handleNavigation = (path: string, label: string) => {
    setLocation(path);
    
    // Announce navigation for screen readers
    const announcement = document.getElementById("current-announcement");
    if (announcement) {
      announcement.textContent = `Navigated to ${label}`;
    }
  };

  return (
    <nav 
      className="glass-card border-t border-white/10 px-6 py-4 pb-8 rounded-none mt-auto" 
      role="navigation" 
      aria-label="Main navigation"
      data-testid="bottom-navigation"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            className={`flex flex-col items-center space-y-2 p-3 transition-all touch-target rounded-2xl ${
              currentPage === item.key 
                ? "text-primary bg-primary/10 font-bold scale-110 shadow-lg shadow-primary/5" 
                : "text-white/40 hover:text-white/60"
            }`}
            onClick={() => handleNavigation(item.path, item.label)}
            aria-label={item.ariaLabel}
            aria-current={currentPage === item.key ? "page" : undefined}
            data-testid={`nav-${item.key}`}
          >
            <i className={`${item.icon} text-2xl`} aria-hidden="true"></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
